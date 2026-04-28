<?php
/**
 * Block registration and rendering for Simple Image Gallery.
 */

defined( 'ABSPATH' ) || exit;

class SIG_Block {

	/** Allowed values for the `source` block attribute. */
	private const ALLOWED_SOURCES = array( 'woocommerce', 'adhoc' );

	public function __construct() {
		add_action( 'init', array( $this, 'register_block' ) );
	}

	public function register_block(): void {
		register_block_type(
			SIG_PATH . 'build/blocks/gallery',
			array(
				'render_callback' => array( $this, 'render' ),
			)
		);
	}

	/**
	 * Sanitize a CSS dimension value (e.g. 70vh, 400px, 50%).
	 * Returns the fallback if the value doesn't match a safe pattern.
	 */
	private function sanitize_css_dimension( string $value, string $fallback ): string {
		if ( preg_match( '/^\d+(\.\d+)?(px|em|rem|vh|vw|%)$/', $value ) ) {
			return $value;
		}
		return $fallback;
	}

	/**
	 * Render the gallery block on the frontend.
	 *
	 * @param array $attributes Block attributes.
	 * @return string HTML output.
	 */
	public function render( array $attributes ): string {
		$raw_source = $attributes['source'] ?? '';
		if ( ! in_array( $raw_source, self::ALLOWED_SOURCES, true ) ) {
			return '';
		}
		$source = $raw_source;

		$height = $this->sanitize_css_dimension( $attributes['height'] ?? '70vh', '70vh' );

		if ( 'woocommerce' === $source ) {
			$images = SIG_Woo::get_product_images();
		} else {
			$images = is_array( $attributes['images'] ?? null ) ? $attributes['images'] : array();
		}

		if ( empty( $images ) ) {
			return '';
		}

		$html = sprintf(
			'<div class="sig-gallery" role="region" aria-label="%s" tabindex="0" style="%s">',
			esc_attr__( 'Image gallery', 'simple-image-gallery' ),
			esc_attr( '--sig-height: ' . $height )
		);

		foreach ( $images as $image ) {
			// For adhoc images, derive a fresh URL from the attachment ID so stored
			// URLs don't break after site migrations or attachment replacements.
			if ( ! empty( $image['id'] ) && 'adhoc' === $source ) {
				$url = wp_get_attachment_image_url( (int) $image['id'], 'full' );
				$alt = (string) get_post_meta( (int) $image['id'], '_wp_attachment_image_alt', true );
			} else {
				$url = isset( $image['url'] ) ? $image['url'] : '';
				$alt = isset( $image['alt'] ) ? $image['alt'] : '';
			}

			$url = esc_url( $url );
			if ( ! $url ) {
				continue;
			}
			$html .= '<img src="' . $url . '" alt="' . esc_attr( $alt ) . '" loading="lazy">';
		}

		return $html . '</div>';
	}
}
