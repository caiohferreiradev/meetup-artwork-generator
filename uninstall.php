<?php
/**
 * Removes the plugin options. The generator page is left in place because
 * it is site content; deactivation already restored the previous front page.
 *
 * @package meetup-artwork-generator
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'wpbr_artes_page_id' );
delete_option( 'wpbr_artes_previous_front' );
