<?php
/**
 * Plugin Name: Simple Image Gallery
 * Description: A Gutenberg block for displaying image galleries with horizontal scroll and lightbox. Works with WooCommerce product galleries or manually added images.
 * Version: 1.0.0
 * Author: Bill
 * Text Domain: simple-image-gallery
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SIG_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'SIG_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'SIG_VERSION', '1.0.0' );

require_once SIG_PLUGIN_DIR . 'includes/class-sig-block.php';
require_once SIG_PLUGIN_DIR . 'includes/class-sig-rest-api.php';

/**
 * Initialize the plugin.
 */
function sig_init() {
	$block = new SIG_Block();
	$block->register();

	$rest_api = new SIG_REST_API();
	$rest_api->register();
}
add_action( 'init', 'sig_init' );
