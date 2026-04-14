<?php
/**
 * Block registration and server-side rendering.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SIG_Block {

	/**
	 * Register the Gutenberg block.
	 */
	public function register() {
		if ( ! function_exists( 'register_block_type' ) ) {
			return;
		}

		$asset_file = SIG_PLUGIN_DIR . 'build/index.asset.php';
		$asset      = file_exists( $asset_file )
			? require $asset_file
			: array(
				'dependencies' => array(),
				'version'      => SIG_VERSION,
			);

		wp_register_script(
			'sig-editor',
			SIG_PLUGIN_URL . 'build/index.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_register_style(
			'sig-editor-style',
			SIG_PLUGIN_URL . 'build/index.css',
			array(),
			$asset['version']
		);

		register_block_type(
			'sig/gallery',
			array(
				'editor_script'   => 'sig-editor',
				'editor_style'    => 'sig-editor-style',
				'render_callback' => array( $this, 'render_block' ),
				'attributes'      => array(
					'images'     => array(
						'type'    => 'array',
						'default' => array(),
					),
					'useProductGallery' => array(
						'type'    => 'boolean',
						'default' => false,
					),
					'galleryHeight' => array(
						'type'    => 'number',
						'default' => 400,
					),
					'galleryHeightUnit' => array(
						'type'    => 'string',
						'default' => 'px',
					),
				),
			)
		);
	}

	/**
	 * Server-side render callback for the gallery block.
	 *
	 * @param array $attributes Block attributes.
	 * @return string Rendered HTML.
	 */
	public function render_block( $attributes ) {
		$images      = $attributes['images'] ?? array();
		$use_product = $attributes['useProductGallery'] ?? false;
		$height      = $attributes['galleryHeight'] ?? 400;
		$height_unit = $attributes['galleryHeightUnit'] ?? 'px';

		$allowed_units = array( 'px', 'vh', 'svh', 'dvh', 'em', 'rem', '%' );
		if ( ! in_array( $height_unit, $allowed_units, true ) ) {
			$height_unit = 'px';
		}

		if ( $use_product ) {
			$images = $this->get_product_gallery_images();
		}

		if ( empty( $images ) ) {
			return '';
		}

		$this->enqueue_frontend_assets();

		$gallery_id = 'sig-gallery-' . wp_unique_id();

		ob_start();
		?>
		<div
			class="sig-gallery"
			id="<?php echo esc_attr( $gallery_id ); ?>"
			data-images="<?php echo esc_attr( wp_json_encode( $images ) ); ?>"
			style="height: <?php echo floatval( $height ) . esc_attr( $height_unit ); ?>;"
		>
			<div class="sig-gallery__track">
				<?php foreach ( $images as $index => $image ) : ?>
					<button
						type="button"
						class="sig-gallery__item"
						data-index="<?php echo intval( $index ); ?>"
						aria-label="<?php echo esc_attr( sprintf( __( 'View image %d of %d', 'simple-image-gallery' ), $index + 1, count( $images ) ) ); ?>"
					>
						<img
							src="<?php echo esc_url( $image['url'] ?? '' ); ?>"
							alt="<?php echo esc_attr( $image['alt'] ?? '' ); ?>"
							loading="lazy"
						/>
					</button>
				<?php endforeach; ?>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Get images from the current WooCommerce product gallery.
	 *
	 * @return array Array of image data.
	 */
	private function get_product_gallery_images() {
		$product_id = get_the_ID();
		if ( ! $product_id ) {
			return array();
		}

		return SIG_Images::get_product_gallery( $product_id );
	}

	/**
	 * Enqueue frontend scripts and styles. Safe to call multiple times.
	 */
	private function enqueue_frontend_assets() {
		static $asset = null;
		if ( null === $asset ) {
			$asset_file = SIG_PLUGIN_DIR . 'build/frontend.asset.php';
			$asset      = file_exists( $asset_file )
				? require $asset_file
				: array(
					'dependencies' => array(),
					'version'      => SIG_VERSION,
				);
		}

		wp_enqueue_style(
			'sig-frontend-style',
			SIG_PLUGIN_URL . 'build/frontend.css',
			array(),
			$asset['version']
		);

		wp_enqueue_script(
			'sig-frontend',
			SIG_PLUGIN_URL . 'build/frontend.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);
	}
}
