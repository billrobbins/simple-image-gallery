<?php
/**
 * WooCommerce product image integration for Simple Image Gallery.
 */

defined( 'ABSPATH' ) || exit;

class SIG_Woo {

	/**
	 * Get product images for the current product page.
	 *
	 * Returns an array of ['id' => int, 'url' => string, 'alt' => string] entries,
	 * starting with the featured image followed by gallery images.
	 *
	 * @return array<int, array{id: int, url: string, alt: string}>
	 */
	public static function get_product_images(): array {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return array();
		}

		// Cache by post ID before resolving $product to avoid wc_get_product()
		// DB calls on subsequent renders of the same block on one page.
		static $cache = array();
		$post_id = get_the_ID();
		if ( ! $post_id ) {
			return array();
		}
		$post_id = (int) $post_id;
		if ( isset( $cache[ $post_id ] ) ) {
			return $cache[ $post_id ];
		}

		global $product;

		if ( ! $product instanceof WC_Product ) {
			$product = wc_get_product( $post_id );
		}

		if ( ! $product instanceof WC_Product ) {
			return $cache[ $post_id ] = array();
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
				'id'  => $id,
				'url' => $url,
				'alt' => (string) get_post_meta( $id, '_wp_attachment_image_alt', true ),
			);
		}

		return $cache[ $post_id ] = $images;
	}
}
