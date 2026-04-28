<?php
/**
 * Block registration and rendering for Simple Image Gallery.
 */

defined( 'ABSPATH' ) || exit;

class SIG_Block {

	public function __construct() {
		add_action( 'init', array( $this, 'register_block' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_assets' ) );
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
	 * Render the gallery block on the frontend.
	 *
	 * @param array $attributes Block attributes.
	 * @return string HTML output.
	 */
	public function render( array $attributes ): string {
		$source = isset( $attributes['source'] ) ? $attributes['source'] : 'woocommerce';
		$height = isset( $attributes['height'] ) && $attributes['height'] ? $attributes['height'] : '70vh';

		if ( 'woocommerce' === $source ) {
			$images = SIG_Woo::get_product_images();
		} else {
			$images = isset( $attributes['images'] ) && is_array( $attributes['images'] )
				? $attributes['images']
				: array();
		}

		if ( empty( $images ) ) {
			return '';
		}

		$style = esc_attr( '--sig-height: ' . $height );

		$html  = '<div class="sig-gallery" style="' . $style . '" data-source="' . esc_attr( $source ) . '">';
		foreach ( $images as $image ) {
			$url = isset( $image['url'] ) ? esc_url( $image['url'] ) : '';
			$alt = isset( $image['alt'] ) ? esc_attr( $image['alt'] ) : '';
			if ( $url ) {
				$html .= '<img src="' . $url . '" alt="' . $alt . '" loading="lazy">';
			}
		}
		$html .= '</div>';

		return $html;
	}

	public function enqueue_frontend_assets(): void {
		if ( ! has_block( 'simple-image-gallery/gallery' ) ) {
			return;
		}

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
