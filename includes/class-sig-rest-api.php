<?php
/**
 * REST API endpoint for fetching product gallery images in the editor.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SIG_REST_API {

	/**
	 * Register REST routes.
	 */
	public function register() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register the product gallery endpoint.
	 */
	public function register_routes() {
		register_rest_route(
			'sig/v1',
			'/product-gallery/(?P<id>\d+)',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_product_gallery' ),
				'permission_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
				'args'                => array(
					'id' => array(
						'validate_callback' => function ( $param ) {
							return is_numeric( $param );
						},
						'sanitize_callback' => 'absint',
					),
				),
			)
		);
	}

	/**
	 * Get product gallery images.
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_product_gallery( $request ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return new WP_Error(
				'woocommerce_not_active',
				__( 'WooCommerce is not active.', 'simple-image-gallery' ),
				array( 'status' => 400 )
			);
		}

		$product_id = $request->get_param( 'id' );
		$product    = wc_get_product( $product_id );

		if ( ! $product ) {
			return new WP_Error(
				'product_not_found',
				__( 'Product not found.', 'simple-image-gallery' ),
				array( 'status' => 404 )
			);
		}

		$images    = array();
		$image_ids = $product->get_gallery_image_ids();
		$featured  = $product->get_image_id();

		if ( $featured ) {
			array_unshift( $image_ids, $featured );
		}

		foreach ( $image_ids as $image_id ) {
			$full_url  = wp_get_attachment_image_url( $image_id, 'full' );
			$large_url = wp_get_attachment_image_url( $image_id, 'large' );
			$alt       = get_post_meta( $image_id, '_wp_attachment_image_alt', true );

			if ( $full_url ) {
				$images[] = array(
					'id'      => $image_id,
					'url'     => $large_url ?: $full_url,
					'fullUrl' => $full_url,
					'alt'     => $alt ?: '',
				);
			}
		}

		return rest_ensure_response( $images );
	}
}
