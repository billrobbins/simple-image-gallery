<?php
/**
 * WooCommerce product image integration for Simple Image Gallery.
 */

defined( 'ABSPATH' ) || exit;

class SIG_Woo {

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

		static $cache = array();
		$product_id = $product->get_id();
		if ( isset( $cache[ $product_id ] ) ) {
			return $cache[ $product_id ];
		}

		$featured_id = $product->get_image_id();
		$image_ids   = array_merge(
			$featured_id ? array( (int) $featured_id ) : array(),
			array_map( 'intval', (array) $product->get_gallery_image_ids() )
		);

		$images = array();
		foreach ( $image_ids as $id ) {
			$url = wp_get_attachment_image_url( $id, 'full' );
			if ( ! $url ) {
				continue;
			}
			$images[] = array(
				'url' => $url,
				'alt' => (string) get_post_meta( $id, '_wp_attachment_image_alt', true ),
			);
		}

		$cache[ $product_id ] = $images;

		return $images;
	}
}
