const assert = require( 'node:assert/strict' );
const fs = require( 'node:fs' );
const path = require( 'node:path' );
const test = require( 'node:test' );
const vm = require( 'node:vm' );

const context = { window: {}, Intl };
vm.runInNewContext( fs.readFileSync( path.join( __dirname, '../assets/js/copy.js' ), 'utf8' ), context );

const translations = {
	missingDate: '[date]', missingTime: '[time]', missingVenue: '[venue]',
	missingLink: '[link]', missingCity: '[city]', xOnline: 'online',
	xHookOnline: 'Online meetup', xIn: 'in %s', xHookCity: 'Meetup in %s',
	talkWith: '%s with %s', xTalks: '%s talks', atTime: 'at %s',
	tzBRT: 'Brasília time', tagCommunity: 'Community',
};
const t = ( key, ...args ) => ( translations[ key ] || key ).replace( /%s/g, () => args.shift() );
const event = {
	group: 'WordPress', city: 'Belo Horizonte', online: true, tz: 'UTC',
	title: 'Meetup online', date: '2026-11-09', time: '19:00', venue: '',
	link: 'https://example.com/meetup', description: '', highlight: '', talks: [], sponsors: [],
};
const x = ( overrides, locale ) => context.window.WPBRArtesCopy.build( { ...event, ...overrides }, t, locale ).find( ( item ) => item.id === 'x' );

for ( const [ locale, date, time ] of [ [ 'pt-BR', '09/11', '19h' ], [ 'en-US', '11/09', '7 PM' ], [ 'es-ES', '9/11', '19:00' ] ] ) {
	test( `${ locale }: online time zones and reduction retain the essentials`, () => {
		for ( const zone of [ 'UTC', 'XYZ', 'BRT' ] ) {
			const basic = x( { tz: zone }, locale );
			assert.match( basic.text, new RegExp( `\\(${ zone }\\)` ) );
			assert.ok( basic.text.includes( date ) );
			assert.ok( basic.text.replace( /\s/g, ' ' ).includes( time ) );

			// A long city tag and title force the optional lines out and the title to shorten.
			const reduced = x( {
				tz: zone, city: 'A'.repeat( 120 ), title: 'T'.repeat( 90 ),
				highlight: 'H'.repeat( 60 ), talks: [ { title: 'Talk', speaker: 'Speaker' } ],
			}, locale );
			assert.ok( reduced.length <= 280, `weighted length: ${ reduced.length }` );
			assert.ok( reduced.text.includes( date ) );
			assert.ok( reduced.text.replace( /\s/g, ' ' ).includes( time ) );
			assert.ok( reduced.text.includes( `(${ zone })` ) );
			assert.ok( reduced.text.includes( event.link ) );
			assert.ok( reduced.text.includes( '…' ) );
			assert.ok( ! reduced.text.includes( 'H'.repeat( 60 ) ) );
		}
	} );
}

test( 'in-person events and empty time zones do not add a zone', () => {
	assert.ok( ! x( { online: false, tz: 'UTC' }, 'pt-BR' ).text.includes( '(UTC)' ) );
	assert.ok( ! x( { tz: '' }, 'pt-BR' ).text.includes( '()' ) );
	assert.ok( x( { title: '', tz: 'XYZ' }, 'pt-BR' ).text.includes( '(XYZ)' ) );
} );
