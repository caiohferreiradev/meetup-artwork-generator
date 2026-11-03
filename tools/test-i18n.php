<?php
/**
 * Regression checks for language selection without a WordPress installation.
 * Run with: php tools/test-i18n.php
 */
define( 'ABSPATH', __DIR__ );

function apply_filters( $hook, $value ) {
	return $value;
}
function add_action() {}
function wp_unslash( $value ) {
	return is_array( $value ) ? array_map( 'wp_unslash', $value ) : stripslashes( $value );
}
function sanitize_text_field( $value ) {
	return trim( $value );
}
function determine_locale() {
	return $GLOBALS['test_site_locale'];
}

set_error_handler(
	function ( $severity, $message, $file, $line ) {
		throw new ErrorException( $message, 0, $severity, $file, $line );
	}
);
require isset( $argv[1] ) ? $argv[1] : __DIR__ . '/../includes/i18n.php';

function check_language( $description, $query, $cookie, $browser, $site, $requested, $current ) {
	$_GET                           = null === $query ? array() : array( 'wpbr_lang' => $query );
	$_COOKIE                        = null === $cookie ? array() : array( WPBR_ARTES_LANG_COOKIE => $cookie );
	$_SERVER['HTTP_ACCEPT_LANGUAGE'] = $browser;
	$GLOBALS['test_site_locale']    = $site;
	$actual_requested               = wpbr_artes_requested_language();
	$actual_current                 = wpbr_artes_current_language();
	if ( $requested !== $actual_requested || $current !== $actual_current ) {
		fwrite( STDERR, "$description: expected $requested/$current; got $actual_requested/$actual_current\n" );
		exit( 1 );
	}
}

check_language( 'URL takes precedence', 'pt_BR', 'es_ES', 'en-US', 'en_US', 'pt_BR', 'pt_BR' );
check_language( 'Valid cookie', null, 'es_ES', 'en-US', 'en_US', '', 'es_ES' );
check_language( 'Sanitized URL', 'pt_BR!', null, '', 'en_US', 'pt_BR', 'pt_BR' );
check_language( 'Invalid URL uses cookie', 'fr_FR', 'es_ES', '', 'en_US', '', 'es_ES' );
check_language( 'Array URL uses cookie', array( 'pt_BR' ), 'es_ES', '', 'en_US', '', 'es_ES' );
check_language( 'Nested URL uses cookie', array( array( 'pt_BR' ) ), 'es_ES', '', 'en_US', '', 'es_ES' );
check_language( 'Array cookie uses browser', null, array( 'pt_BR' ), 'es-ES', 'en_US', '', 'es_ES' );
check_language( 'Nested cookie uses site', null, array( array( 'pt_BR' ) ), '', 'pt_BR', '', 'pt_BR' );
check_language( 'Both invalid use default', array( array( 'pt_BR' ) ), array( array( 'es_ES' ) ), '', 'fr_FR', '', 'en_US' );
check_language( 'Invalid cookie uses browser', null, 'fr_FR', 'es-ES', 'en_US', '', 'es_ES' );
check_language( 'Non-string values use fallback', 123, false, '', 'pt_BR', '', 'pt_BR' );

echo "Language selection regression checks passed.\n";
