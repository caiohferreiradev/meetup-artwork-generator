/**
 * Announcement texts for each network, built from the generator form.
 *
 * Copy guidelines applied to every text:
 * - The first line is the hook: it says what is happening before "see more".
 * - Essentials (when, where, how to join) are scannable, one per line,
 *   with emojis as visual bullets and never replacing words.
 * - One clear call to action per text, with the link where it is clickable.
 * - Tone and length follow each network (WhatsApp short with *bold*,
 *   LinkedIn more professional, X under 280 characters, Instagram with the
 *   link in the bio and hashtags at the end).
 * - Hashtags in CamelCase so screen readers read them well.
 * - Missing information shows up as [placeholders] instead of disappearing.
 *
 * Strings come translated from PHP; dates and times use Intl so each
 * language gets its own format.
 */
( function () {
	'use strict';

	const X_LIMIT = 280;
	const X_URL_LENGTH = 23;
	const WEEKDAY_KEYS = [ 'onSunday', 'onMonday', 'onTuesday', 'onWednesday', 'onThursday', 'onFriday', 'onSaturday' ];

	/* Helpers -------------------------------------------------------------- */

	const capitalize = ( text ) => ( text ? text[ 0 ].toUpperCase() + text.slice( 1 ) : text );

	function parseDate( value ) {
		const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec( value || '' );
		return match ? new Date( +match[ 1 ], +match[ 2 ] - 1, +match[ 3 ] ) : null;
	}

	/** "19h30" in Portuguese, "7:30 PM" in English, "19:30" elsewhere. */
	function hour( value, locale ) {
		const match = /^(\d{2}):(\d{2})/.exec( value || '' );
		if ( ! match ) {
			return '';
		}
		const h = parseInt( match[ 1 ], 10 );
		if ( locale.startsWith( 'pt' ) ) {
			return match[ 2 ] === '00' ? `${ h }h` : `${ h }h${ match[ 2 ] }`;
		}
		const date = new Date( 2000, 0, 1, h, +match[ 2 ] );
		const options = { hour: 'numeric', minute: '2-digit' };
		if ( locale.startsWith( 'en' ) && match[ 2 ] === '00' ) {
			delete options.minute;
		}
		return new Intl.DateTimeFormat( locale, options ).format( date );
	}

	/** "A, B e C" with the language's own conjunction. */
	function joinList( list, locale ) {
		if ( list.length < 2 || ! Intl.ListFormat ) {
			return list.join( ', ' );
		}
		return new Intl.ListFormat( locale, { style: 'long', type: 'conjunction' } ).format( list );
	}

	/** "Belo Horizonte" -> "BeloHorizonte" (no accents, CamelCase). */
	function camel( text ) {
		return String( text || '' )
			.normalize( 'NFD' )
			.replace( /[̀-ͯ]/g, '' )
			.split( /[^A-Za-z0-9]+/ )
			.filter( Boolean )
			.map( ( word ) => word[ 0 ].toUpperCase() + word.slice( 1 ) )
			.join( '' );
	}

	/** Joins lines; `null`/`false` are dropped, '' is a blank line. */
	function compose( lines ) {
		return lines
			.flat( Infinity )
			.filter( ( line ) => line !== null && line !== false && line !== undefined )
			.join( '\n' )
			.replace( /\n{3,}/g, '\n\n' )
			.trim();
	}

	/**
	 * X weighted length: most Latin characters count 1, emoji and other
	 * symbols count 2, every URL counts 23.
	 */
	function xLength( text ) {
		const withoutUrls = text.replace( /https?:\/\/\S+/g, () => '\u0000'.repeat( X_URL_LENGTH ) );
		let length = 0;
		for ( const char of withoutUrls ) {
			const cp = char.codePointAt( 0 );
			if ( cp === 0xfe0f || cp === 0x200d ) {
				continue; // Emoji variation selector and joiner add no length.
			}
			const light = cp <= 4351 || ( cp >= 8192 && cp <= 8205 ) || ( cp >= 8208 && cp <= 8223 ) || ( cp >= 8242 && cp <= 8247 );
			length += light ? 1 : 2;
		}
		return length;
	}

	/* Shared pieces --------------------------------------------------------- */

	function facts( info, t, locale ) {
		const missing = {
			date: t( 'missingDate' ),
			time: t( 'missingTime' ),
			venue: t( 'missingVenue' ),
			link: t( 'missingLink' ),
			city: t( 'missingCity' ),
		};
		const date = parseDate( info.date );
		const time = hour( info.time, locale );
		// Known zones get a friendly name ("Brasília time"); others keep the abbreviation.
		const tzName = info.tz ? t( 'tz' + info.tz ) : '';
		const tz = info.online && info.tz ? ` (${ tzName !== 'tz' + info.tz ? tzName : info.tz })` : '';
		const dateLong = date
			? new Intl.DateTimeFormat( locale, { weekday: 'long', day: 'numeric', month: 'long' } ).format( date )
			: missing.date;
		const city = info.city || missing.city;
		const atTime = t( 'atTime', time || missing.time );

		const hook = info.title || t( info.online ? 'hookOnline' : 'hook', info.group );
		const about = info.description || ( info.online ? t( 'aboutOnline' ) : t( 'aboutCity', city ) );
		const on = date ? t( WEEKDAY_KEYS[ date.getDay() ] ) : t( 'onUnknown' );
		const lead = `${ on } ${ dateLong }, ${ atTime }${ tz }, ` + ( info.online ? t( 'weMeetOnline' ) : t( 'weMeetIn', city ) );

		const cityTag = info.city ? 'WordPress' + camel( info.city ) : 'WordPressBrasil';
		const tags = ( count ) =>
			[ 'WordPress', cityTag, 'WordPressBrasil', t( 'tagCommunity' ), 'Meetup' ]
				.filter( ( tag, i, all ) => tag && all.indexOf( tag ) === i )
				.slice( 0, count )
				.map( ( tag ) => '#' + tag )
				.join( ' ' );

		return {
			missing,
			date,
			time,
			tz,
			dateLong,
			when: `${ capitalize( dateLong ) }, ${ atTime }${ tz }`,
			where: info.online ? t( 'online' ) : info.venue || missing.venue,
			city,
			link: info.link || missing.link,
			hook,
			about,
			lead,
			tags,
			sponsors: info.sponsors.length ? joinList( info.sponsors, locale ) : '',
		};
	}

	function talkLines( talks, format ) {
		return talks.map( ( talk ) => ( talk.title && talk.speaker ? format( talk.title, talk.speaker ) : `• ${ talk.title || talk.speaker }` ) );
	}

	/* Networks -------------------------------------------------------------- */

	function meetup( info, f, t ) {
		return compose( [
			f.about,
			'',
			`📅 ${ t( 'when' ) } ${ f.when }`,
			`📍 ${ t( 'where' ) } ${ info.online ? t( 'meetupOnlineWhere' ) : f.where }`,
			info.highlight && `🎟️ ${ info.highlight }`,
			'',
			info.talks.length > 0 && [ t( 'schedule' ), talkLines( info.talks, ( title, s ) => `• ${ t( 'talkWith', title, s ) }` ), '' ],
			t( 'audienceTitle' ),
			t( 'audience' ),
			'',
			f.sponsors && [ t( 'supportTitle' ), t( 'thanks', f.sponsors ), '' ],
			t( 'rsvp' ),
			'',
			t( 'conduct' ),
		] );
	}

	function facebook( info, f, t ) {
		return compose( [
			`📣 ${ f.hook }`,
			'',
			f.about,
			'',
			info.talks.length > 0 && [ `🎤 ${ t( 'onSchedule' ) }`, talkLines( info.talks, ( title, s ) => `• ${ t( 'talkWith', title, s ) }` ), '' ],
			`📅 ${ f.when }`,
			`📍 ${ f.where }`,
			info.highlight && `🎟️ ${ info.highlight }`,
			'',
			`👉 ${ t( 'saveSpot', f.link ) }`,
			'',
			f.sponsors && [ `${ t( 'thanksCasual', f.sponsors ) } 💙`, '' ],
			t( 'shareFacebook' ),
			'',
			f.tags( 2 ),
		] );
	}

	function instagram( info, f, t ) {
		return compose( [
			`${ f.hook } 💙`,
			'',
			f.about,
			'',
			info.talks.length > 0 && [ `🎤 ${ t( 'speakers' ) }`, talkLines( info.talks, ( title, s ) => `• ${ s }: ${ title }` ), '' ],
			`📅 ${ capitalize( f.dateLong ) }`,
			`🕖 ${ f.time || f.missing.time }${ f.tz }`,
			`📍 ${ f.where }`,
			info.highlight && `🎟️ ${ info.highlight }`,
			'',
			`🔗 ${ t( 'linkInBio' ) }`,
			`${ t( 'tagFriend' ) } 👇`,
			'',
			f.tags( 5 ),
		] );
	}

	function linkedin( info, f, t ) {
		return compose( [
			f.hook,
			'',
			f.lead,
			'',
			f.about,
			'',
			info.talks.length > 0 && [ t( 'onSchedule' ), talkLines( info.talks, ( title, s ) => `→ ${ t( 'talkWith', title, s ) }` ), '' ],
			! info.online && t( 'venue', f.where ),
			info.highlight || null,
			'',
			t( 'registration', f.link ),
			'',
			f.sponsors && [ t( 'thanks', f.sponsors ), '' ],
			t( 'shareLinkedin' ),
			'',
			f.tags( 3 ),
		] );
	}

	function x( info, f, t, locale ) {
		const shortDate = f.date ? new Intl.DateTimeFormat( locale, { day: '2-digit', month: '2-digit' } ).format( f.date ) : f.missing.date;
		const auto = ! info.title;
		const place = auto ? '' : ', ' + ( info.online ? t( 'xOnline' ) : t( 'xIn', f.city ) );
		const timezone = info.online && info.tz ? ` (${ info.tz })` : '';
		let hook = ! auto ? info.title : info.online ? t( 'xHookOnline' ) : t( 'xHookCity', f.city );

		const first = info.talks[ 0 ];
		const talk = info.talks.length === 1
			? `🎤 ${ first.title && first.speaker ? t( 'talkWith', first.title, first.speaker ) : first.title || first.speaker }`
			: info.talks.length > 1 ? `🎤 ${ t( 'xTalks', info.talks.length ) }` : null;

		const build = ( withTalk, withHighlight ) =>
			compose( [
				`📣 ${ hook } — ${ shortDate }, ${ f.time || f.missing.time }${ timezone }${ place }`,
				withTalk && talk,
				withHighlight && info.highlight && `🎟️ ${ info.highlight }`,
				'',
				`👉 ${ f.link }`,
				f.tags( 2 ),
			] );

		// Drop the least important lines first, then shorten the hook.
		for ( const [ withTalk, withHighlight ] of [ [ true, true ], [ true, false ], [ false, false ] ] ) {
			const text = build( withTalk, withHighlight );
			if ( xLength( text ) <= X_LIMIT ) {
				return text;
			}
		}
		let text = build( false, false );
		while ( xLength( text ) > X_LIMIT && hook.length > 10 ) {
			hook = hook.slice( 0, -2 ).trimEnd() + '…';
			text = build( false, false );
		}
		return text;
	}

	function whatsapp( info, f, t ) {
		return compose( [
			`📣 *${ f.hook }*`,
			'',
			f.about,
			'',
			`📅 *${ t( 'when' ) }* ${ f.when }`,
			`📍 *${ t( 'where' ) }* ${ f.where }`,
			info.talks.length > 0 && [ `🎤 *${ t( 'scheduleShort' ) }*`, talkLines( info.talks, ( title, s ) => `• ${ title } — _${ s }_` ) ],
			info.highlight && `🎟️ ${ info.highlight }`,
			'',
			`👉 *${ t( 'register' ) }* ${ f.link }`,
			'',
			`${ t( 'forward' ) } 💙`,
		] );
	}

	const NETWORKS = [
		{ id: 'meetup', label: 'Meetup.com', icon: 'dashicons-groups', build: meetup },
		{ id: 'facebook', label: 'Facebook', icon: 'dashicons-facebook', build: facebook },
		{ id: 'instagram', label: 'Instagram', icon: 'dashicons-instagram', limit: 2200, build: instagram },
		{ id: 'linkedin', label: 'LinkedIn', icon: 'dashicons-linkedin', limit: 3000, build: linkedin },
		{ id: 'x', label: 'X (Twitter)', icon: 'dashicons-twitter', limit: X_LIMIT, weighted: true, build: x },
		{ id: 'whatsapp', label: 'WhatsApp', icon: 'dashicons-whatsapp', build: whatsapp },
	];

	/**
	 * info: { group, city, online, tz, title, date, time, venue, link,
	 *         description, highlight, talks: [{ title, speaker }],
	 *         sponsors: [name] }
	 * t: translation function; locale: BCP 47 tag such as pt-BR.
	 */
	function build( info, t, locale ) {
		const f = facts( info, t, locale );
		const placeholders = Object.values( f.missing );
		return NETWORKS.map( ( network ) => {
			const text = network.build( info, f, t, locale );
			return {
				id: network.id,
				label: network.label,
				hint: t( network.id + 'Hint' ),
				icon: network.icon,
				tip: t( network.id + 'Tip' ),
				limit: network.limit || 0,
				text,
				length: network.weighted ? xLength( text ) : [ ...text ].length,
				missing: placeholders.some( ( placeholder ) => text.includes( placeholder ) ),
			};
		} );
	}

	window.WPBRArtesCopy = { build };
} )();
