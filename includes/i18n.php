<?php
/**
 * Language selection for the generator.
 *
 * Visitors pick the generator language on the page itself (?wpbr_lang=),
 * independently of the site language. The choice is kept in a cookie.
 * Translations live in languages/ as .l10n.php files (WordPress 6.5+).
 *
 * @package meetup-artwork-generator
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'WPBR_ARTES_DOMAIN', 'meetup-artwork-generator' );
define( 'WPBR_ARTES_LANG_COOKIE', 'wpbr_artes_lang' );

/**
 * Languages offered in the selector, labelled in their own language.
 *
 * @return array Locale => native name.
 */
function wpbr_artes_languages() {
	return apply_filters(
		'wpbr_artes_languages',
		array(
			'pt_BR' => 'Português (Brasil)',
			'en_US' => 'English',
			'es_ES' => 'Español',
		)
	);
}

/**
 * Maps a WordPress locale to one of the generator languages.
 *
 * @param string $locale Locale such as pt_PT or es_MX.
 * @return string
 */
function wpbr_artes_match_language( $locale ) {
	$languages = wpbr_artes_languages();
	if ( isset( $languages[ $locale ] ) ) {
		return $locale;
	}
	foreach ( array_keys( $languages ) as $code ) {
		if ( strtok( $code, '_' ) === strtok( (string) $locale, '_' ) ) {
			return $code;
		}
	}
	return 'pt_BR';
}

/**
 * The language requested in the URL, if valid.
 *
 * @return string Empty when none.
 */
function wpbr_artes_requested_language() {
	// Display preference only; nothing is saved besides a cookie.
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$requested = isset( $_GET['wpbr_lang'] ) ? preg_replace( '/[^A-Za-z_]/', '', wp_unslash( $_GET['wpbr_lang'] ) ) : '';
	return isset( wpbr_artes_languages()[ $requested ] ) ? $requested : '';
}

/**
 * Best match for the browser languages (Accept-Language), if any.
 *
 * @return string Empty when none of the generator languages is accepted.
 */
function wpbr_artes_browser_language() {
	$header = isset( $_SERVER['HTTP_ACCEPT_LANGUAGE'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_ACCEPT_LANGUAGE'] ) ) : '';
	$ranked = array();
	foreach ( explode( ',', $header ) as $index => $part ) {
		$pieces = explode( ';', trim( $part ) );
		$tag    = str_replace( '-', '_', trim( $pieces[0] ) );
		$weight = 1.0;
		if ( isset( $pieces[1] ) && preg_match( '/q=([0-9.]+)/', $pieces[1], $match ) ) {
			$weight = (float) $match[1];
		}
		if ( $tag && $weight > 0 ) {
			// Keep the browser order for equal weights.
			$ranked[ $tag ] = $weight - $index / 1000;
		}
	}
	arsort( $ranked );

	$languages = wpbr_artes_languages();
	foreach ( array_keys( $ranked ) as $tag ) {
		foreach ( array_keys( $languages ) as $code ) {
			if ( strcasecmp( $code, $tag ) === 0 || strcasecmp( strtok( $code, '_' ), strtok( $tag, '_' ) ) === 0 ) {
				return $code;
			}
		}
	}
	return '';
}

/**
 * Generator language: URL, then cookie, then the browser languages, then
 * the site language, then English.
 *
 * @return string
 */
function wpbr_artes_current_language() {
	$requested = wpbr_artes_requested_language();
	if ( $requested ) {
		return $requested;
	}
	$cookie = isset( $_COOKIE[ WPBR_ARTES_LANG_COOKIE ] ) ? preg_replace( '/[^A-Za-z_]/', '', wp_unslash( $_COOKIE[ WPBR_ARTES_LANG_COOKIE ] ) ) : '';
	if ( isset( wpbr_artes_languages()[ $cookie ] ) ) {
		return $cookie;
	}
	$browser = wpbr_artes_browser_language();
	if ( $browser ) {
		return $browser;
	}
	$site = determine_locale();
	if ( isset( wpbr_artes_languages()[ $site ] ) ) {
		return $site;
	}
	return apply_filters( 'wpbr_artes_default_language', 'en_US' );
}

/**
 * Loads the plugin translations for a language. English is the source.
 *
 * @param string $language Generator language.
 */
function wpbr_artes_load_translations( $language ) {
	// Unloading also stops WordPress from loading the site language just in time.
	unload_textdomain( WPBR_ARTES_DOMAIN );
	if ( 'en_US' !== $language ) {
		load_textdomain( WPBR_ARTES_DOMAIN, WPBR_ARTES_PATH . 'languages/' . WPBR_ARTES_DOMAIN . '-' . $language . '.mo' );
	}
}

/**
 * Site language everywhere else (admin, plugin list).
 */
function wpbr_artes_init_translations() {
	wpbr_artes_load_translations( wpbr_artes_match_language( determine_locale() ) );
}
add_action( 'init', 'wpbr_artes_init_translations', 0 );

/**
 * On the generator, switches to the visitor's language and remembers it.
 */
function wpbr_artes_switch_language() {
	if ( ! wpbr_artes_is_generator_view() ) {
		return;
	}
	$requested = wpbr_artes_requested_language();
	if ( $requested && ! headers_sent() ) {
		setcookie(
			WPBR_ARTES_LANG_COOKIE,
			$requested,
			array(
				'expires'  => time() + YEAR_IN_SECONDS,
				'path'     => COOKIEPATH ? COOKIEPATH : '/',
				'domain'   => COOKIE_DOMAIN,
				'secure'   => is_ssl(),
				'httponly' => true,
				'samesite' => 'Lax',
			)
		);
	}
	wpbr_artes_load_translations( wpbr_artes_current_language() );

	// The page changes with the visitor's language: keep caches from mixing them.
	if ( ! headers_sent() ) {
		header( 'Vary: Accept-Language, Cookie', false );
	}
}
add_action( 'template_redirect', 'wpbr_artes_switch_language' );

/**
 * Strings used by the scripts (interface and announcement texts).
 *
 * @return array
 */
function wpbr_artes_js_strings() {
	return array(
		// Interface.
		'otherCity'          => __( 'Other city…', 'meetup-artwork-generator' ),
		'none'               => __( 'None', 'meetup-artwork-generator' ),
		'customImage'        => __( 'My own image…', 'meetup-artwork-generator' ),
		'titlePlaceholder'   => __( 'Your meetup title', 'meetup-artwork-generator' ),
		/* translators: %s: community name, e.g. Brasil. */
		'onlineCommunity'    => __( 'WordPress %s (online)', 'meetup-artwork-generator' ),
		/* translators: %d: talk number. */
		'talkLabel'          => __( 'Talk %d', 'meetup-artwork-generator' ),
		/* translators: %d: supporter number. */
		'sponsorLabel'       => __( 'Supporter %d', 'meetup-artwork-generator' ),
		'imageError'         => __( 'This image could not be opened. Try a JPG or PNG file.', 'meetup-artwork-generator' ),
		'tooLong'            => __( 'The text is too long for this format; try shortening the title or the description.', 'meetup-artwork-generator' ),
		'resetConfirm'       => __( 'Erase everything you filled in and start a new artwork?', 'meetup-artwork-generator' ),
		'copied'             => __( 'Text copied!', 'meetup-artwork-generator' ),
		'copyFailed'         => __( 'Could not copy automatically. The text is selected: press Ctrl+C (or Cmd+C).', 'meetup-artwork-generator' ),
		/* translators: %s: social network name. */
		'textFor'            => __( 'Text for %s', 'meetup-artwork-generator' ),
		/* translators: 1: number of characters, 2: character limit. */
		'charsOf'            => __( '%1$s of %2$s characters', 'meetup-artwork-generator' ),
		/* translators: %s: number of characters. */
		'chars'              => __( '%s characters', 'meetup-artwork-generator' ),
		'headerInPerson'     => __( 'In-person Meetup', 'meetup-artwork-generator' ),
		'headerOnline'       => __( 'Online Meetup', 'meetup-artwork-generator' ),
		'headerBrasilOnline' => __( 'WordPress Brasil Online Meetup', 'meetup-artwork-generator' ),
		/* translators: %s: city name. */
		'communityOf'        => __( '%s WordPress Community', 'meetup-artwork-generator' ),
		'community'          => __( 'WordPress Community', 'meetup-artwork-generator' ),
		'defaultTalk'        => __( 'Getting started with the block editor', 'meetup-artwork-generator' ),
		'defaultSpeaker'     => __( 'Speaker name', 'meetup-artwork-generator' ),
		'defaultHighlight'   => __( 'Free event', 'meetup-artwork-generator' ),

		// Announcement texts: placeholders for missing information.
		'missingDate'        => __( '[date]', 'meetup-artwork-generator' ),
		'missingTime'        => __( '[time]', 'meetup-artwork-generator' ),
		'missingVenue'       => __( '[venue and address]', 'meetup-artwork-generator' ),
		'missingLink'        => __( '[registration link]', 'meetup-artwork-generator' ),
		'missingCity'        => __( '[city]', 'meetup-artwork-generator' ),

		// Announcement texts: shared pieces.
		/* translators: %s: community name. */
		'hook'               => __( 'A new %s meetup is coming up!', 'meetup-artwork-generator' ),
		/* translators: %s: community name. */
		'hookOnline'         => __( 'A new online %s meetup is coming up!', 'meetup-artwork-generator' ),
		'aboutOnline'        => __( 'An open gathering to learn, share experiences and meet people who use WordPress all over Brazil.', 'meetup-artwork-generator' ),
		/* translators: %s: city name. */
		'aboutCity'          => __( 'An open gathering to learn, share experiences and meet other people who use WordPress in %s.', 'meetup-artwork-generator' ),
		'onSunday'           => _x( 'On', 'before Sunday', 'meetup-artwork-generator' ),
		'onMonday'           => _x( 'On', 'before Monday', 'meetup-artwork-generator' ),
		'onTuesday'          => _x( 'On', 'before Tuesday', 'meetup-artwork-generator' ),
		'onWednesday'        => _x( 'On', 'before Wednesday', 'meetup-artwork-generator' ),
		'onThursday'         => _x( 'On', 'before Thursday', 'meetup-artwork-generator' ),
		'onFriday'           => _x( 'On', 'before Friday', 'meetup-artwork-generator' ),
		'onSaturday'         => _x( 'On', 'before Saturday', 'meetup-artwork-generator' ),
		'onUnknown'          => _x( 'On', 'before a missing date', 'meetup-artwork-generator' ),
		/* translators: %s: time, e.g. 7 PM. */
		'atTime'             => __( 'at %s', 'meetup-artwork-generator' ),
		/* translators: %s: city name. */
		'weMeetIn'           => __( 'we meet in %s.', 'meetup-artwork-generator' ),
		'weMeetOnline'       => __( 'we meet online.', 'meetup-artwork-generator' ),
		'tzBRT'              => __( 'Brasília time', 'meetup-artwork-generator' ),
		'tzACT'              => __( 'Acre time', 'meetup-artwork-generator' ),
		'tzAMT'              => __( 'Manaus time', 'meetup-artwork-generator' ),
		'online'             => __( 'Online', 'meetup-artwork-generator' ),
		'when'               => __( 'When:', 'meetup-artwork-generator' ),
		'where'              => __( 'Where:', 'meetup-artwork-generator' ),
		/* translators: 1: talk title, 2: speaker name. */
		'talkWith'           => __( '%1$s — with %2$s', 'meetup-artwork-generator' ),
		'tagCommunity'       => _x( 'WordPressCommunity', 'hashtag, no spaces', 'meetup-artwork-generator' ),

		// Meetup.com.
		'meetupOnlineWhere'  => __( 'Online. The streaming link is available here on Meetup for everyone who RSVPs.', 'meetup-artwork-generator' ),
		'schedule'           => __( 'SCHEDULE', 'meetup-artwork-generator' ),
		'audienceTitle'      => __( 'WHO IS IT FOR', 'meetup-artwork-generator' ),
		'audience'           => __( 'For people who use WordPress, build sites, develop or are just getting started. No experience needed: the community is open and welcoming.', 'meetup-artwork-generator' ),
		'supportTitle'       => __( 'SUPPORT', 'meetup-artwork-generator' ),
		/* translators: %s: list of supporters. */
		'thanks'             => __( 'Special thanks for the support: %s.', 'meetup-artwork-generator' ),
		'rsvp'               => __( 'RSVP here on Meetup to get the event reminders. If you can no longer make it, update your RSVP to free up the spot for someone else.', 'meetup-artwork-generator' ),
		'conduct'            => __( 'WordPress community events follow the community code of conduct: respect and a welcoming space come first.', 'meetup-artwork-generator' ),

		// Facebook.
		'onSchedule'         => __( 'On the schedule:', 'meetup-artwork-generator' ),
		/* translators: %s: registration link. */
		'saveSpot'           => __( 'Save your spot: %s', 'meetup-artwork-generator' ),
		/* translators: %s: list of supporters. */
		'thanksCasual'       => __( 'Thanks for the support, %s!', 'meetup-artwork-generator' ),
		'shareFacebook'      => __( 'Know someone who would enjoy this? Tag them in the comments or share!', 'meetup-artwork-generator' ),

		// Instagram.
		'speakers'           => __( 'Speakers:', 'meetup-artwork-generator' ),
		'linkInBio'          => __( 'Registration via the link in bio.', 'meetup-artwork-generator' ),
		'tagFriend'          => __( 'Tag who is coming with you!', 'meetup-artwork-generator' ),

		// LinkedIn.
		/* translators: %s: venue. */
		'venue'              => __( 'Venue: %s', 'meetup-artwork-generator' ),
		/* translators: %s: registration link. */
		'registration'       => __( 'Registration: %s', 'meetup-artwork-generator' ),
		'shareLinkedin'      => __( 'Know someone who would enjoy this? Share it or tag them in the comments.', 'meetup-artwork-generator' ),

		// X.
		/* translators: %s: city name. */
		'xHookCity'          => __( 'WordPress meetup in %s', 'meetup-artwork-generator' ),
		'xHookOnline'        => __( 'Online WordPress meetup', 'meetup-artwork-generator' ),
		/* translators: %d: number of talks. */
		'xTalks'             => __( '%d talks on the schedule', 'meetup-artwork-generator' ),
		/* translators: %s: city name. */
		'xIn'                => __( 'in %s', 'meetup-artwork-generator' ),
		'xOnline'            => __( 'online', 'meetup-artwork-generator' ),

		// WhatsApp.
		'scheduleShort'      => __( 'Schedule:', 'meetup-artwork-generator' ),
		'register'           => __( 'Register:', 'meetup-artwork-generator' ),
		'forward'            => __( 'Forward this to anyone who would enjoy it!', 'meetup-artwork-generator' ),

		// Networks.
		'meetupHint'         => __( 'Event description', 'meetup-artwork-generator' ),
		'meetupTip'          => __( 'Paste it in the event description. Use the artwork title as the event name and upload the "Meetup.com" artwork as the cover image.', 'meetup-artwork-generator' ),
		'facebookHint'       => __( 'Post or event', 'meetup-artwork-generator' ),
		'facebookTip'        => __( 'Post it with the "Facebook" or "Square" artwork. If you create a Facebook event, use this text as its description.', 'meetup-artwork-generator' ),
		'instagramHint'      => __( 'Post caption', 'meetup-artwork-generator' ),
		'instagramTip'       => __( 'Links in captions are not clickable on Instagram: put the registration link in your bio or use the link sticker in Stories. Tag the speakers and supporters on the image.', 'meetup-artwork-generator' ),
		'linkedinHint'       => __( 'Post', 'meetup-artwork-generator' ),
		'linkedinTip'        => __( 'After pasting, tag the speakers and supporting companies by typing @ before their names. This increases the reach of the post.', 'meetup-artwork-generator' ),
		'xHint'              => __( 'Up to 280 characters', 'meetup-artwork-generator' ),
		'xTip'               => __( 'The text is adjusted to fit 280 characters (each link counts as 23). To detail the schedule, reply to your own post.', 'meetup-artwork-generator' ),
		'whatsappHint'       => __( 'Groups and lists', 'meetup-artwork-generator' ),
		'whatsappTip'        => __( 'Asterisks make text bold on WhatsApp. Send it with the "Square" artwork (chats) or the "Status / Stories" one (status).', 'meetup-artwork-generator' ),
	);
}
