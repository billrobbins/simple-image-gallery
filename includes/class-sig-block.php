<?php
/**
 * Block registration and rendering for Simple Image Gallery.
 */

defined( 'ABSPATH' ) || exit;

class SIG_Block {

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
		$source = $attributes['source'] ?? 'woocommerce';
		$height = $this->sanitize_css_dimension( $attributes['height'] ?? '70vh', '70vh' );

		$images = ( 'woocommerce' === $source )
			? SIG_Woo::get_product_images()
			: ( $attributes['images'] ?? array() );

		if ( empty( $images ) ) {
			return '';
		}

		$this->enqueue_frontend_assets();

		$html = sprintf(
			'<div class="sig-gallery" role="region" aria-label="%s" tabindex="0" style="%s" data-source="%s">',
			esc_attr__( 'Image gallery', 'simple-image-gallery' ),
			esc_attr( '--sig-height: ' . $height ),
			esc_attr( $source )
		);

		foreach ( $images as $image ) {
			$url = isset( $image['url'] ) ? esc_url( $image['url'] ) : '';
			if ( ! $url ) {
				continue;
			}
			$alt = isset( $image['alt'] ) ? esc_attr( $image['alt'] ) : '';
			$html .= '<img src="' . $url . '" alt="' . $alt . '" loading="lazy">';
		}

		return $html . '</div>';
	}

	public function enqueue_frontend_assets(): void {
		static $asset_file = null;
		if ( null === $asset_file ) {
			$asset_path = SIG_PATH . 'build/frontend.asset.php';
			$asset_file = file_exists( $asset_path ) ? require $asset_path : array(
				'dependencies' => array(),
				'version'      => SIG_VERSION,
			);
		}

		wp_enqueue_script(
			'sig-frontend',
			SIG_URL . 'build/frontend.js',
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);

		wp_enqueue_style(
			'sig-frontend',
			SIG_URL . 'build/frontend.css',
			array(),
			SIG_VERSION
		);
	}
}
