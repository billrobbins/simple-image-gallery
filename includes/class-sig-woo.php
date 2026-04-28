<?php
/**
 * WooCommerce product image integration for Simple Image Gallery.
 */

defined( 'ABSPATH' ) || exit;

class SIG_Woo {

	public function __construct() {
		// No hooks needed — data is fetched on demand via static method.
	}

	/**
	 * Get product images for the current product page.
	 *
	 * Returns an array of ['url' => string, 'alt' => string] entries,
	 * starting with the featured image followed by gallery images.
	 *
	 * @return array<int, array{url: string, alt: string}>
	 */
	public static function get_product_images(): array {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return array();
		}

		global $product;

		if ( ! $product instanceof WC_Product ) {
			$product = wc_get_product( get_the_ID() );
		}

		if ( ! $product instanceof WC_Product ) {
			return array();
		}

		$image_ids = array();

		$featured_id = $product->get_image_id();
		if ( $featured_id ) {
			$image_ids[] = (int) $featured_id;
		}

		$gallery_ids = $product->get_gallery_image_ids();
		if ( is_array( $gallery_ids ) ) {
			foreach ( $gallery_ids as $id ) {
				$image_ids[] = (int) $id;
			}
		}

		$images = array();
		foreach ( $image_ids as $id ) {
			$url = wp_get_attachment_image_url( $id, 'full' );
			if ( ! $url ) {
				continue;
			}
			$alt = (string) get_post_meta( $id, '_wp_attachment_image_alt', true );
			$images[] = array(
				'url' => $url,
				'alt' => $alt,
			);
		}

		return $images;
	}
}
