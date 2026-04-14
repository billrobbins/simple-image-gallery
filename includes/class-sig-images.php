<?php
/**
 * Shared image retrieval for WooCommerce product galleries.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SIG_Images {

	/**
	 * Get gallery images for a WooCommerce product.
	 *
	 * @param int $product_id The product ID.
	 * @return array Array of image data, empty if WooCommerce is inactive or product not found.
	 */
	public static function get_product_gallery( $product_id ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return array();
		}

		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return array();
		}

		$image_ids = $product->get_gallery_image_ids();
		$featured  = $product->get_image_id();

		if ( $featured ) {
			array_unshift( $image_ids, $featured );
		}

		$images = array();
		foreach ( $image_ids as $image_id ) {
			$full_url = wp_get_attachment_image_url( $image_id, 'full' );
			if ( ! $full_url ) {
				continue;
			}

			$large_url = wp_get_attachment_image_url( $image_id, 'large' );
			$alt       = get_post_meta( $image_id, '_wp_attachment_image_alt', true );

			$images[] = array(
				'id'      => $image_id,
				'url'     => $large_url ?: $full_url,
				'fullUrl' => $full_url,
				'alt'     => $alt ?: '',
			);
		}

		return $images;
	}
}
