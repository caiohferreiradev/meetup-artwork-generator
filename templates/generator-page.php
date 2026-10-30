<?php
/**
 * Full-page template for the generator, independent of the active theme.
 *
 * @package meetup-artwork-generator
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$wpbr_artes_language = wpbr_artes_current_language();
?><!doctype html>
<html lang="<?php echo esc_attr( str_replace( '_', '-', $wpbr_artes_language ) ); ?>">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class( 'wpbr-artes-page' ); ?>>
<?php wp_body_open(); ?>

<a class="wpbr-skip-link" href="#wpbr-main"><?php esc_html_e( 'Skip to the generator', 'meetup-artwork-generator' ); ?></a>

<header class="wpbr-topbar">
	<div class="wpbr-topbar__inner">
		<span class="wpbr-topbar__brand">
			<span class="dashicons dashicons-wordpress" aria-hidden="true"></span>
			<?php esc_html_e( 'WordPress Brazil Community', 'meetup-artwork-generator' ); ?>
		</span>
		<div class="wpbr-topbar__tools">
			<form class="wpbr-language" method="get" action="">
				<label for="wpbr-language">
					<span class="dashicons dashicons-translation" aria-hidden="true"></span>
					<span class="wpbr-language__label"><?php esc_html_e( 'Language', 'meetup-artwork-generator' ); ?></span>
				</label>
				<select id="wpbr-language" name="wpbr_lang">
					<?php foreach ( wpbr_artes_languages() as $wpbr_artes_code => $wpbr_artes_name ) : ?>
						<option value="<?php echo esc_attr( $wpbr_artes_code ); ?>" lang="<?php echo esc_attr( str_replace( '_', '-', $wpbr_artes_code ) ); ?>" <?php selected( $wpbr_artes_code, $wpbr_artes_language ); ?>><?php echo esc_html( $wpbr_artes_name ); ?></option>
					<?php endforeach; ?>
				</select>
				<noscript><button type="submit"><?php esc_html_e( 'Change', 'meetup-artwork-generator' ); ?></button></noscript>
			</form>
			<?php if ( current_user_can( 'manage_options' ) ) : ?>
				<a class="wpbr-topbar__link" href="<?php echo esc_url( admin_url() ); ?>"><?php esc_html_e( 'Dashboard', 'meetup-artwork-generator' ); ?></a>
			<?php endif; ?>
		</div>
	</div>
</header>

<main id="wpbr-main" class="wpbr-page">
	<div class="wpbr-hero">
		<h1 class="wpbr-hero__title"><?php esc_html_e( 'Meetup Artwork Generator', 'meetup-artwork-generator' ); ?></h1>
		<p class="wpbr-hero__text">
			<?php esc_html_e( 'Fill in your meetup details, check the preview and download the artwork in the format of each network. At the end, copy the ready-made texts to spread the word. Everything stays saved in this browser until you start over.', 'meetup-artwork-generator' ); ?>
		</p>
	</div>

	<?php wpbr_artes_render_generator(); ?>
</main>

<footer class="wpbr-footer">
	<p>
		<?php esc_html_e( 'Made by and for the WordPress community in Brazil. Images and texts are generated in your browser and are not sent to any server.', 'meetup-artwork-generator' ); ?>
	</p>
</footer>

<?php wp_footer(); ?>
</body>
</html>
