/**
 * Simple Image Gallery - Gutenberg Block Registration
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import Edit from './blocks/gallery/edit';
import './blocks/gallery/editor.css';

registerBlockType( 'sig/gallery', {
	title: __( 'Simple Image Gallery', 'simple-image-gallery' ),
	description: __( 'Display images in a horizontal scroll gallery with lightbox. Works with WooCommerce product galleries or manually added images.', 'simple-image-gallery' ),
	category: 'media',
	icon: 'format-gallery',
	supports: {
		html: false,
		align: [ 'wide', 'full' ],
	},
	attributes: {
		images: {
			type: 'array',
			default: [],
		},
		useProductGallery: {
			type: 'boolean',
			default: false,
		},
		imageHeight: {
			type: 'number',
			default: 400,
		},
	},
	edit: Edit,
	save: () => null, // Server-side rendered
} );
