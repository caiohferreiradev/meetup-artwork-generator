<?php
/**
 * Generator markup, shared by the full-page template and the shortcode.
 * Behaviour lives in assets/js/app.js.
 *
 * @package meetup-artwork-generator
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Prints the generator.
 */
function wpbr_artes_render_generator() {
	?>
	<div class="wpbr-artes">
		<noscript>
			<p class="wpbr-notice"><?php esc_html_e( 'The generator needs JavaScript enabled in your browser.', 'meetup-artwork-generator' ); ?></p>
		</noscript>

		<div class="wpbr-artes__layout">
			<form class="wpbr-artes__form" id="wpbr-artes-form" autocomplete="off" onsubmit="return false;">

				<section class="wpbr-step">
					<h2 class="wpbr-step__title"><span class="wpbr-step__number">1</span><?php esc_html_e( 'Your community', 'meetup-artwork-generator' ); ?></h2>

					<div class="wpbr-field">
						<label for="wpbr-city"><?php esc_html_e( 'City', 'meetup-artwork-generator' ); ?></label>
						<div class="wpbr-search">
							<span class="dashicons dashicons-search" aria-hidden="true"></span>
							<input type="text" id="wpbr-city" list="wpbr-city-list" data-field="cityQuery" aria-describedby="wpbr-city-help" placeholder="<?php esc_attr_e( 'Type to search, e.g.: Curitiba', 'meetup-artwork-generator' ); ?>">
						</div>
						<datalist id="wpbr-city-list"></datalist>
						<p class="wpbr-help" id="wpbr-city-help"><?php esc_html_e( 'Pick a community from the list or type any city.', 'meetup-artwork-generator' ); ?></p>
					</div>

					<div class="wpbr-field">
						<label for="wpbr-landmark"><?php esc_html_e( 'Landmark in the background', 'meetup-artwork-generator' ); ?></label>
						<select id="wpbr-landmark" data-field="landmark" aria-describedby="wpbr-landmark-help"></select>
						<p class="wpbr-help" id="wpbr-landmark-help"><?php esc_html_e( 'Shows up as a shadow in the bottom right corner of the artwork.', 'meetup-artwork-generator' ); ?></p>
					</div>

					<div class="wpbr-field" data-show-when="landmark=custom">
						<span class="wpbr-field__label" id="wpbr-watermark-label"><?php esc_html_e( 'Your image', 'meetup-artwork-generator' ); ?></span>
						<div class="wpbr-watermark">
							<button type="button" class="wpbr-photo__button wpbr-watermark__button" id="wpbr-watermark" aria-labelledby="wpbr-watermark-label wpbr-watermark-text">
								<img alt="" hidden>
								<span class="wpbr-photo__placeholder"><span class="dashicons dashicons-format-image" aria-hidden="true"></span><span id="wpbr-watermark-text"><?php esc_html_e( 'Upload image', 'meetup-artwork-generator' ); ?></span></span>
							</button>
							<p class="wpbr-help"><?php esc_html_e( 'A photo or drawing of a local landmark. It becomes a blue watermark: dark areas show up, light areas disappear. Images with a transparent background work best.', 'meetup-artwork-generator' ); ?></p>
						</div>
						<input type="file" accept="image/*" id="wpbr-watermark-file" hidden>
					</div>
				</section>

				<section class="wpbr-step">
					<h2 class="wpbr-step__title"><span class="wpbr-step__number">2</span><?php esc_html_e( 'About the event', 'meetup-artwork-generator' ); ?></h2>

					<fieldset class="wpbr-field">
						<legend><?php esc_html_e( 'Event type', 'meetup-artwork-generator' ); ?></legend>
						<div class="wpbr-segmented">
							<label><input type="radio" name="wpbr-mode" value="presencial" data-field="mode"><span><?php esc_html_e( 'In person', 'meetup-artwork-generator' ); ?></span></label>
							<label><input type="radio" name="wpbr-mode" value="online" data-field="mode"><span><?php esc_html_e( 'Online', 'meetup-artwork-generator' ); ?></span></label>
						</div>
					</fieldset>

					<div class="wpbr-field">
						<label for="wpbr-edition"><?php esc_html_e( 'Edition number (optional)', 'meetup-artwork-generator' ); ?></label>
						<input type="text" id="wpbr-edition" data-field="edition" inputmode="numeric" maxlength="6" placeholder="<?php esc_attr_e( 'E.g.: 18', 'meetup-artwork-generator' ); ?>">
					</div>

					<div class="wpbr-field">
						<label for="wpbr-header"><?php esc_html_e( 'Next to the logo, first line', 'meetup-artwork-generator' ); ?></label>
						<input type="text" id="wpbr-header" data-field="header" maxlength="50" aria-describedby="wpbr-header-help" placeholder="<?php esc_attr_e( 'E.g.: Joinville WordPress Community', 'meetup-artwork-generator' ); ?>">
					</div>

					<div class="wpbr-field">
						<label for="wpbr-subheader"><?php esc_html_e( 'Next to the logo, second line', 'meetup-artwork-generator' ); ?></label>
						<input type="text" id="wpbr-subheader" data-field="subheader" maxlength="40" aria-describedby="wpbr-header-help" placeholder="<?php esc_attr_e( 'E.g.: #18 In person', 'meetup-artwork-generator' ); ?>">
						<p class="wpbr-help" id="wpbr-header-help"><?php esc_html_e( 'Filled in from the city, edition and event type. Edit them if you want.', 'meetup-artwork-generator' ); ?></p>
					</div>

					<div class="wpbr-field-row">
						<div class="wpbr-field">
							<label for="wpbr-date"><?php esc_html_e( 'Date', 'meetup-artwork-generator' ); ?></label>
							<input type="date" id="wpbr-date" data-field="date">
						</div>
						<div class="wpbr-field">
							<label for="wpbr-time"><?php esc_html_e( 'Time', 'meetup-artwork-generator' ); ?></label>
							<input type="time" id="wpbr-time" data-field="time">
						</div>
						<div class="wpbr-field">
							<label for="wpbr-tz"><abbr title="<?php esc_attr_e( 'Time zone', 'meetup-artwork-generator' ); ?>"><?php echo esc_html_x( 'TZ', 'time zone abbreviation', 'meetup-artwork-generator' ); ?></abbr></label>
							<input type="text" id="wpbr-tz" data-field="tz" maxlength="6" placeholder="BRT" autocapitalize="characters" spellcheck="false">
						</div>
					</div>
					<p class="wpbr-help wpbr-field-hint"><?php esc_html_e( 'Without date and time, the artwork shows the block editor toolbar.', 'meetup-artwork-generator' ); ?></p>

					<div class="wpbr-field">
						<label for="wpbr-title"><?php esc_html_e( 'Meetup title (theme)', 'meetup-artwork-generator' ); ?></label>
						<textarea id="wpbr-title" data-field="title" rows="2" maxlength="90" aria-describedby="wpbr-title-help" placeholder="<?php esc_attr_e( 'E.g.: Behind the scenes of WordPress projects', 'meetup-artwork-generator' ); ?>"></textarea>
						<p class="wpbr-help" id="wpbr-title-help"><?php esc_html_e( 'Goes inside the blue box.', 'meetup-artwork-generator' ); ?></p>
					</div>

					<fieldset class="wpbr-field">
						<legend><?php esc_html_e( 'Title style', 'meetup-artwork-generator' ); ?></legend>
						<div class="wpbr-segmented">
							<label><input type="radio" name="wpbr-title-weight" value="400" data-field="titleWeight"><span><?php esc_html_e( 'Regular', 'meetup-artwork-generator' ); ?></span></label>
							<label><input type="radio" name="wpbr-title-weight" value="700" data-field="titleWeight"><span class="is-bold"><?php esc_html_e( 'Bold', 'meetup-artwork-generator' ); ?></span></label>
						</div>
					</fieldset>

					<div class="wpbr-field">
						<label for="wpbr-description"><?php esc_html_e( 'Description (optional)', 'meetup-artwork-generator' ); ?></label>
						<textarea id="wpbr-description" data-field="description" rows="3" maxlength="200" placeholder="<?php esc_attr_e( 'E.g.: Learn about the challenges and solutions behind real projects built with WordPress.', 'meetup-artwork-generator' ); ?>"></textarea>
					</div>

					<div class="wpbr-field">
						<label for="wpbr-highlight"><?php esc_html_e( 'Footer highlight (optional)', 'meetup-artwork-generator' ); ?></label>
						<input type="text" id="wpbr-highlight" data-field="highlight" maxlength="60" placeholder="<?php esc_attr_e( 'E.g.: Free event', 'meetup-artwork-generator' ); ?>">
					</div>

					<div class="wpbr-field" data-show-when="mode=presencial">
						<label for="wpbr-venue"><?php esc_html_e( 'Venue and address', 'meetup-artwork-generator' ); ?></label>
						<input type="text" id="wpbr-venue" data-field="venue" maxlength="140" placeholder="<?php esc_attr_e( 'E.g.: University auditorium · 123 Example St – Downtown', 'meetup-artwork-generator' ); ?>">
						<label class="wpbr-check">
							<input type="checkbox" data-field="showVenue">
							<span><?php esc_html_e( 'Show the venue on the artwork', 'meetup-artwork-generator' ); ?></span>
						</label>
					</div>

					<div class="wpbr-field">
						<label for="wpbr-link"><?php esc_html_e( 'Registration link', 'meetup-artwork-generator' ); ?></label>
						<input type="url" id="wpbr-link" data-field="link" inputmode="url" aria-describedby="wpbr-link-help" placeholder="<?php esc_attr_e( 'E.g.: https://www.meetup.com/your-group/events/…', 'meetup-artwork-generator' ); ?>">
						<p class="wpbr-help" id="wpbr-link-help"><?php esc_html_e( 'The event page on Meetup.com or wherever people RSVP. Used in the announcement texts.', 'meetup-artwork-generator' ); ?></p>
					</div>
				</section>

				<section class="wpbr-step">
					<h2 class="wpbr-step__title"><span class="wpbr-step__number">3</span><?php esc_html_e( 'Talks and speakers', 'meetup-artwork-generator' ); ?></h2>
					<div class="wpbr-list" id="wpbr-talks"></div>
					<button type="button" class="wpbr-btn" id="wpbr-add-talk">
						<span class="dashicons dashicons-plus-alt2" aria-hidden="true"></span><?php esc_html_e( 'Add talk', 'meetup-artwork-generator' ); ?>
					</button>
				</section>

				<section class="wpbr-step">
					<h2 class="wpbr-step__title"><span class="wpbr-step__number">4</span><?php esc_html_e( 'Supporters and sponsors', 'meetup-artwork-generator' ); ?></h2>
					<p class="wpbr-help wpbr-step__intro"><?php esc_html_e( 'Logos of whoever supports or hosts the event. PNG with a transparent background works best.', 'meetup-artwork-generator' ); ?></p>
					<div class="wpbr-list" id="wpbr-sponsors"></div>
					<button type="button" class="wpbr-btn" id="wpbr-add-sponsor">
						<span class="dashicons dashicons-plus-alt2" aria-hidden="true"></span><?php esc_html_e( 'Add logo', 'meetup-artwork-generator' ); ?>
					</button>
				</section>

				<p class="wpbr-artes__reset">
					<button type="button" class="wpbr-link wpbr-link--danger" id="wpbr-reset"><?php esc_html_e( 'Start over', 'meetup-artwork-generator' ); ?></button>
				</p>
			</form>

			<div class="wpbr-artes__preview">
				<section class="wpbr-step wpbr-preview-card">
					<h2 class="wpbr-step__title"><span class="wpbr-step__number">5</span><?php esc_html_e( 'Choose the format and download', 'meetup-artwork-generator' ); ?></h2>

					<fieldset class="wpbr-field wpbr-theme-field">
						<legend><?php esc_html_e( 'Artwork colors', 'meetup-artwork-generator' ); ?></legend>
						<div class="wpbr-segmented">
							<label><input type="radio" name="wpbr-theme" value="light" data-field="theme"><span><?php esc_html_e( 'Light', 'meetup-artwork-generator' ); ?></span></label>
							<label><input type="radio" name="wpbr-theme" value="dark" data-field="theme"><span><?php esc_html_e( 'Dark', 'meetup-artwork-generator' ); ?></span></label>
						</div>
					</fieldset>

					<div class="wpbr-formats" id="wpbr-formats" role="radiogroup" aria-label="<?php esc_attr_e( 'Artwork format', 'meetup-artwork-generator' ); ?>"></div>
					<div class="wpbr-canvas-wrap">
						<canvas id="wpbr-canvas" role="img" aria-label="<?php esc_attr_e( 'Artwork preview', 'meetup-artwork-generator' ); ?>"></canvas>
					</div>
					<p class="wpbr-size" id="wpbr-size" aria-live="polite"></p>
					<div class="wpbr-actions">
						<button type="button" class="wpbr-btn wpbr-btn--primary wpbr-btn--large" id="wpbr-download">
							<span class="dashicons dashicons-download" aria-hidden="true"></span><?php esc_html_e( 'Download this artwork', 'meetup-artwork-generator' ); ?>
						</button>
						<button type="button" class="wpbr-btn wpbr-btn--large" id="wpbr-download-all"><?php esc_html_e( 'Download all formats', 'meetup-artwork-generator' ); ?></button>
					</div>
				</section>
			</div>
		</div>

		<section class="wpbr-step wpbr-copy">
			<h2 class="wpbr-step__title">
				<span class="wpbr-step__number">6</span><?php esc_html_e( 'Announcement texts', 'meetup-artwork-generator' ); ?>
				<span class="wpbr-step__optional"><?php esc_html_e( 'optional', 'meetup-artwork-generator' ); ?></span>
			</h2>
			<p class="wpbr-help wpbr-step__intro">
				<?php esc_html_e( 'Ready-made texts with the event details, written the way each network works. Open a network, review and copy. Anything [in brackets] still needs to be filled in the form.', 'meetup-artwork-generator' ); ?>
			</p>
			<div class="wpbr-copy__list" id="wpbr-copy-list"></div>
		</section>

		<template id="wpbr-talk-template">
			<div class="wpbr-item">
				<div class="wpbr-item__head">
					<strong class="wpbr-item__label"></strong>
					<span class="wpbr-item__tools">
						<button type="button" class="wpbr-link" data-action="up" aria-label="<?php esc_attr_e( 'Move up', 'meetup-artwork-generator' ); ?>"><span class="dashicons dashicons-arrow-up-alt2" aria-hidden="true"></span></button>
						<button type="button" class="wpbr-link" data-action="down" aria-label="<?php esc_attr_e( 'Move down', 'meetup-artwork-generator' ); ?>"><span class="dashicons dashicons-arrow-down-alt2" aria-hidden="true"></span></button>
						<button type="button" class="wpbr-link wpbr-link--danger" data-action="remove"><?php esc_html_e( 'Remove', 'meetup-artwork-generator' ); ?></button>
					</span>
				</div>
				<div class="wpbr-item__body">
					<div class="wpbr-photo">
						<button type="button" class="wpbr-photo__button" data-action="photo">
							<img alt="" hidden>
							<span class="wpbr-photo__placeholder"><span class="dashicons dashicons-camera" aria-hidden="true"></span><?php esc_html_e( 'Photo', 'meetup-artwork-generator' ); ?></span>
						</button>
						<button type="button" class="wpbr-link wpbr-photo__remove" data-action="clear-photo" hidden><?php esc_html_e( 'Remove photo', 'meetup-artwork-generator' ); ?></button>
						<input type="file" accept="image/*" hidden>
					</div>
					<div class="wpbr-item__fields">
						<label><?php esc_html_e( 'Talk title', 'meetup-artwork-generator' ); ?><input type="text" data-key="title" maxlength="80" placeholder="<?php esc_attr_e( 'E.g.: Getting started with the block editor', 'meetup-artwork-generator' ); ?>"></label>
						<label><?php esc_html_e( 'Speaker name', 'meetup-artwork-generator' ); ?><input type="text" data-key="speaker" maxlength="60" placeholder="<?php esc_attr_e( 'E.g.: Ana Souza', 'meetup-artwork-generator' ); ?>"></label>
					</div>
				</div>
			</div>
		</template>

		<template id="wpbr-sponsor-template">
			<div class="wpbr-item">
				<div class="wpbr-item__head">
					<strong class="wpbr-item__label"></strong>
					<span class="wpbr-item__tools">
						<button type="button" class="wpbr-link" data-action="up" aria-label="<?php esc_attr_e( 'Move up', 'meetup-artwork-generator' ); ?>"><span class="dashicons dashicons-arrow-up-alt2" aria-hidden="true"></span></button>
						<button type="button" class="wpbr-link" data-action="down" aria-label="<?php esc_attr_e( 'Move down', 'meetup-artwork-generator' ); ?>"><span class="dashicons dashicons-arrow-down-alt2" aria-hidden="true"></span></button>
						<button type="button" class="wpbr-link wpbr-link--danger" data-action="remove"><?php esc_html_e( 'Remove', 'meetup-artwork-generator' ); ?></button>
					</span>
				</div>
				<div class="wpbr-item__body">
					<div class="wpbr-photo wpbr-photo--logo">
						<button type="button" class="wpbr-photo__button" data-action="photo">
							<img alt="" hidden>
							<span class="wpbr-photo__placeholder"><span class="dashicons dashicons-upload" aria-hidden="true"></span><?php esc_html_e( 'Upload logo', 'meetup-artwork-generator' ); ?></span>
						</button>
						<button type="button" class="wpbr-link wpbr-photo__remove" data-action="clear-photo" hidden><?php esc_html_e( 'Remove logo', 'meetup-artwork-generator' ); ?></button>
						<input type="file" accept="image/*" hidden>
					</div>
					<div class="wpbr-item__fields">
						<label><?php esc_html_e( 'Name (shown in the texts, and on the artwork if there is no logo)', 'meetup-artwork-generator' ); ?><input type="text" data-key="name" maxlength="40" placeholder="<?php esc_attr_e( 'E.g.: Example Agency', 'meetup-artwork-generator' ); ?>"></label>
					</div>
				</div>
			</div>
		</template>

		<template id="wpbr-copy-template">
			<details class="wpbr-copy__item">
				<summary>
					<span class="wpbr-copy__icon dashicons" aria-hidden="true"></span>
					<span class="wpbr-copy__name"></span>
					<span class="wpbr-copy__hint"></span>
					<span class="wpbr-copy__badge" hidden><?php esc_html_e( 'Missing info', 'meetup-artwork-generator' ); ?></span>
				</summary>
				<div class="wpbr-copy__body">
					<p class="wpbr-copy__tip"></p>
					<textarea class="wpbr-copy__text" readonly rows="12"></textarea>
					<div class="wpbr-copy__bar">
						<span class="wpbr-copy__count"></span>
						<span class="wpbr-copy__status" role="status" aria-live="polite"></span>
						<button type="button" class="wpbr-btn wpbr-btn--primary" data-action="copy">
							<span class="dashicons dashicons-clipboard" aria-hidden="true"></span><?php esc_html_e( 'Copy text', 'meetup-artwork-generator' ); ?>
						</button>
					</div>
				</div>
			</details>
		</template>
	</div>
	<?php
}
