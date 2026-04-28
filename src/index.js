import { registerBlockType } from '@wordpress/blocks';
import Edit from './blocks/gallery/edit';
import metadata from './blocks/gallery/block.json';

registerBlockType( metadata.name, {
	edit: Edit,
	save: () => null, // Server-side rendered.
} );
