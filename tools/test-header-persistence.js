/*
 * Browser regression test for draft headers, using a disposable Playground.
 * Requires Node 20+, @wp-playground/cli 3.1.53 and playwright 1.63.0:
 *   npm install --no-save @wp-playground/cli@3.1.53 playwright@1.63.0
 *   npx playwright install chromium
 *   node tools/test-header-persistence.js
 * Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH to use an existing Chrome binary.
 */
const assert = require( 'node:assert/strict' );
const { mkdtemp, cp, rm } = require( 'node:fs/promises' );
const { tmpdir } = require( 'node:os' );
const path = require( 'node:path' );
const { runCLI } = require( '@wp-playground/cli' );
const { chromium } = require( 'playwright' );

const root = path.resolve( __dirname, '..' );
const key = 'wpbr-artes-state-v1';
const plugin = 'meetup-artwork-generator/meetup-artwork-generator.php';

async function main() {
	const dir = await mkdtemp( path.join( tmpdir(), 'meetup-headers-' ) );
	let server;
	let browser;
	try {
		for ( const file of [ 'meetup-artwork-generator.php', 'includes', 'templates', 'assets', 'languages' ] ) {
			await cp( path.join( root, file ), path.join( dir, file ), { recursive: true } );
		}
		server = await runCLI( {
			command: 'server', port: 0, workers: 1,
			wp: process.env.WP_VERSION || '6.5.14', php: process.env.PHP_VERSION || '7.4',
			'mount-before-install': [ { hostPath: dir, vfsPath: '/wordpress/wp-content/plugins/meetup-artwork-generator' } ],
			blueprint: { steps: [ { step: 'activatePlugin', pluginPath: plugin } ] },
		} );
		const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
		browser = await chromium.launch( executablePath ? { executablePath } : {} );
		const page = await browser.newPage();
		const url = ( lang ) => `${ server.serverUrl }/?wpbr_lang=${ lang }`;
		const state = () => page.evaluate( ( k ) => JSON.parse( localStorage.getItem( k ) ), key );
		const waitForState = async ( predicate ) => {
			const deadline = Date.now() + 5000;
			while ( Date.now() < deadline ) {
				const saved = await state();
				if ( saved && predicate( saved ) ) return;
				await page.waitForTimeout( 50 );
			}
			throw new Error( 'Timed out waiting for the draft to be saved.' );
		};
		const switchLanguage = async ( lang ) => {
			await Promise.all( [ page.waitForURL( `**/?wpbr_lang=${ lang }` ), page.selectOption( '#wpbr-language', lang ) ] );
		};
		const seed = async ( saved, lang = 'en_US' ) => {
			// Let the previous page's debounced save finish before seeding a draft.
			await page.waitForTimeout( 500 );
			await page.evaluate( ( { k, value } ) => localStorage.setItem( k, JSON.stringify( value ) ), { k: key, value: saved } );
			await page.goto( url( lang ) );
			await page.locator( '#wpbr-header' ).waitFor();
		};
		const values = async () => [ await page.locator( '#wpbr-header' ).inputValue(), await page.locator( '#wpbr-subheader' ).inputValue() ];
		await page.goto( url( 'en_US' ) );
		await page.locator( '#wpbr-header' ).fill( 'Custom community' );
		await page.locator( '#wpbr-subheader' ).fill( 'Special edition' );
		await waitForState( ( saved ) => saved.auto.header === false && saved.auto.subheader === false );
		await page.reload();
		assert.deepEqual( await values(), [ 'Custom community', 'Special edition' ] );
		await switchLanguage( 'pt_BR' );
		assert.deepEqual( await values(), [ 'Custom community', 'Special edition' ] );

		await seed( { header: 'Manual community', subheader: 'Previous auto', edition: '12', mode: 'online', auto: { header: false, subheader: true } } );
		assert.deepEqual( await values(), [ 'Manual community', '#12 Online' ] );
		await page.locator( '#wpbr-edition' ).fill( '13' );
		assert.deepEqual( await values(), [ 'Manual community', '#13 Online' ] );
		await page.locator( '[data-field="mode"][value="presencial"]' ).check();
		assert.deepEqual( await values(), [ 'Manual community', '#13 In person' ] );
		await waitForState( ( saved ) => saved.edition === '13' && saved.auto.header === false );
		await switchLanguage( 'pt_BR' );
		assert.deepEqual( await values(), [ 'Manual community', '#13 Presencial' ] );

		await seed( { header: 'Previous auto', subheader: 'Manual event', auto: { header: true, subheader: false } } );
		const initialCommunity = ( await values() )[ 0 ];
		await page.locator( '#wpbr-city' ).fill( 'A different community' );
		const [ changedCommunity, customEvent ] = await values();
		assert.notEqual( changedCommunity, initialCommunity );
		assert.equal( customEvent, 'Manual event' );
		await page.locator( '#wpbr-subheader' ).fill( '' );
		await page.locator( '#wpbr-edition' ).fill( '4' );
		assert.deepEqual( await values(), [ changedCommunity, '#4 In person' ] );
		await waitForState( ( saved ) => saved.auto.subheader === true && saved.edition === '4' );
		await page.reload();
		assert.deepEqual( await values(), [ changedCommunity, '#4 In person' ] );

		// A 1.3 draft's custom header becomes the second line in 1.4.
		await seed( { header: 'Custom old event', title: 'Keep my title', auto: { header: false } } );
		assert.deepEqual( await values(), [ 'Belo Horizonte WordPress Community', 'Custom old event' ] );
		await waitForState( ( saved ) => saved.version === 2 );
		assert.equal( ( await state() ).auto.subheader, false );
		await page.reload();
		assert.deepEqual( await values(), [ 'Belo Horizonte WordPress Community', 'Custom old event' ] );
		assert.equal( await page.locator( '[data-field="title"]' ).inputValue(), 'Keep my title' );

		await seed( { header: 'Meetup Presencial', title: 'Old generated title', auto: { header: true, title: true } } );
		assert.deepEqual( await values(), [ 'Belo Horizonte WordPress Community', 'In person' ] );
		assert.equal( await page.locator( '[data-field="title"]' ).inputValue(), '' );
		await waitForState( ( saved ) => saved.version === 2 );
		await page.locator( '[data-field="title"]' ).fill( 'New title' );
		await waitForState( ( saved ) => saved.title === 'New title' );
		await page.reload();
		assert.equal( await page.locator( '[data-field="title"]' ).inputValue(), 'New title' );
		console.log( 'Header persistence and migration checks passed.' );
	} finally {
		if ( browser ) await browser.close();
		if ( server ) await server[ Symbol.asyncDispose ]();
		await rm( dir, { recursive: true, force: true } );
	}
}

main().catch( ( error ) => { console.error( error ); process.exitCode = 1; } );
