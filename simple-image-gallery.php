<?php
/**
 * Plugin Name: Simple Image Gallery
 * Description: A Gutenberg block for horizontal scroll image galleries with WooCommerce support.
 * Version: 1.0.0
 * Author: Bill Robbins
 * License: GPL-2.0+
 * Text Domain: simple-image-gallery
 */

defined( 'ABSPATH' ) || exit;

define( 'SIG_VERSION', '1.0.0' );
define( 'SIG_PATH', plugin_dir_path( __FILE__ ) );
define( 'SIG_URL', plugin_dir_url( __FILE__ ) );

require_once SIG_PATH . 'includes/class-sig-block.php';
require_once SIG_PATH . 'includes/class-sig-woo.php';

add_action( 'plugins_loaded', function () {
	new SIG_Block();
} );

