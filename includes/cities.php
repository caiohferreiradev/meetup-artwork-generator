<?php
/**
 * Communities and landmark silhouettes.
 *
 * Communities come from the WordPress chapter groups on Meetup.com and the
 * list at wpbrasil.org (October 2026). To add a city, use the
 * `wpbr_artes_cities` filter or open a pull request adding it here.
 *
 * @package meetup-artwork-generator
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Landmark silhouettes available under assets/landmarks/{id}.svg.
 *
 * @return array
 */
function wpbr_artes_get_landmarks() {
	$landmarks = array(
		'pao-de-acucar'        => __( 'Sugarloaf Mountain', 'meetup-artwork-generator' ),
		'igreja-pampulha'      => __( 'Pampulha Church', 'meetup-artwork-generator' ),
		'masp'                 => __( 'MASP', 'meetup-artwork-generator' ),
		'jardim-botanico'      => __( 'Curitiba Botanical Garden', 'meetup-artwork-generator' ),
		'usina-gasometro'      => __( 'Usina do Gasômetro', 'meetup-artwork-generator' ),
		'ponte-hercilio-luz'   => __( 'Hercílio Luz Bridge', 'meetup-artwork-generator' ),
		'congresso-nacional'   => __( 'National Congress', 'meetup-artwork-generator' ),
		'torre-castelo'        => __( 'Castle Tower', 'meetup-artwork-generator' ),
		'catedral-fortaleza'   => __( 'Fortaleza Cathedral', 'meetup-artwork-generator' ),
		'convento-penha'       => __( 'Penha Convent', 'meetup-artwork-generator' ),
		'relogio-goiania'      => __( 'Goiás Avenue Clock', 'meetup-artwork-generator' ),
		'catedral-sao-carlos'  => __( 'São Carlos Cathedral', 'meetup-artwork-generator' ),
		'farol-sao-tome'       => __( 'São Tomé Lighthouse', 'meetup-artwork-generator' ),
		'cristo-luz'           => __( 'Cristo Luz and the waterfront', 'meetup-artwork-generator' ),
		'palacio-rio-branco'   => __( 'Rio Branco Palace', 'meetup-artwork-generator' ),
		'cidade'               => __( 'City buildings (generic)', 'meetup-artwork-generator' ),
	);

	$output = array();
	foreach ( $landmarks as $id => $name ) {
		$output[ $id ] = array(
			'name' => $name,
			'url'  => WPBR_ARTES_URL . 'assets/landmarks/' . $id . '.svg',
		);
	}

	return apply_filters( 'wpbr_artes_landmarks', $output );
}

/**
 * Brazilian WordPress communities.
 *
 * `online` communities default to the "Meetup Online" label; `tz` is the
 * time zone abbreviation printed next to the time.
 *
 * @return array
 */
function wpbr_artes_get_cities() {
	$cities = array(
		array( 'id' => 'brasil', 'name' => __( 'Brazil', 'meetup-artwork-generator' ), 'uf' => '', 'group' => 'Comunidade WordPress Brasil', 'landmark' => '', 'online' => true ),
		array( 'id' => 'balneario-camboriu', 'name' => 'Balneário Camboriú', 'uf' => 'SC', 'group' => 'Comunidade WordPress de Balneário Camboriú', 'landmark' => 'cristo-luz' ),
		array( 'id' => 'barueri', 'name' => 'Barueri', 'uf' => 'SP', 'group' => 'Comunidade WordPress Barueri e arredores', 'landmark' => 'cidade' ),
		array( 'id' => 'belo-horizonte', 'name' => 'Belo Horizonte', 'uf' => 'MG', 'group' => 'Comunidade WordPress de Belo Horizonte', 'landmark' => 'igreja-pampulha' ),
		array( 'id' => 'brasilia', 'name' => 'Brasília', 'uf' => 'DF', 'group' => 'Comunidade WordPress de Brasília', 'landmark' => 'congresso-nacional' ),
		array( 'id' => 'campinas', 'name' => 'Campinas', 'uf' => 'SP', 'group' => 'Comunidade WordPress de Campinas', 'landmark' => 'torre-castelo' ),
		array( 'id' => 'campos', 'name' => 'Campos dos Goytacazes', 'uf' => 'RJ', 'group' => 'Comunidade WordPress de Campos', 'landmark' => 'farol-sao-tome' ),
		array( 'id' => 'curitiba', 'name' => 'Curitiba', 'uf' => 'PR', 'group' => 'Comunidade WordPress de Curitiba', 'landmark' => 'jardim-botanico' ),
		array( 'id' => 'florianopolis', 'name' => 'Florianópolis', 'uf' => 'SC', 'group' => 'Comunidade WordPress de Florianópolis', 'landmark' => 'ponte-hercilio-luz' ),
		array( 'id' => 'fortaleza', 'name' => 'Fortaleza', 'uf' => 'CE', 'group' => 'Comunidade WordPress de Fortaleza', 'landmark' => 'catedral-fortaleza' ),
		array( 'id' => 'goiania', 'name' => 'Goiânia', 'uf' => 'GO', 'group' => 'Comunidade WordPress de Goiânia', 'landmark' => 'relogio-goiania' ),
		array( 'id' => 'porto-alegre', 'name' => 'Porto Alegre', 'uf' => 'RS', 'group' => 'Comunidade WordPress de Porto Alegre', 'landmark' => 'usina-gasometro' ),
		array( 'id' => 'rio-branco', 'name' => 'Rio Branco', 'uf' => 'AC', 'group' => 'Comunidade WordPress de Rio Branco', 'landmark' => 'palacio-rio-branco', 'tz' => 'ACT' ),
		array( 'id' => 'rio-de-janeiro', 'name' => 'Rio de Janeiro', 'uf' => 'RJ', 'group' => 'Comunidade WordPress do Rio de Janeiro', 'landmark' => 'pao-de-acucar' ),
		array( 'id' => 'sao-carlos', 'name' => 'São Carlos', 'uf' => 'SP', 'group' => 'Comunidade WordPress de São Carlos', 'landmark' => 'catedral-sao-carlos' ),
		array( 'id' => 'sao-paulo', 'name' => 'São Paulo', 'uf' => 'SP', 'group' => 'Comunidade WordPress de São Paulo', 'landmark' => 'masp' ),
		array( 'id' => 'vitoria', 'name' => 'Vitória', 'uf' => 'ES', 'group' => 'Comunidade WordPress de Vitória', 'landmark' => 'convento-penha' ),
	);

	foreach ( $cities as &$city ) {
		$city = wp_parse_args(
			$city,
			array(
				'tz'     => 'BRT',
				'online' => false,
			)
		);
	}
	unset( $city );

	return apply_filters( 'wpbr_artes_cities', $cities );
}
