import './editor.css';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RadioControl,
	TextControl,
	Button,
} from '@wordpress/components';

/**
 * Editor component for the Simple Image Gallery block.
 */
export default function Edit( { attributes, setAttributes } ) {
	const { source, images, height } = attributes;
	const blockProps = useBlockProps( { className: 'sig-gallery-editor' } );
	const isWoo = source === 'woocommerce';
	const hasImages = images.length > 0;

	function onSelectImages( media ) {
		setAttributes( {
			images: media.map( ( item ) => ( {
				id: item.id,
				url: item.url,
				alt: item.alt || '',
			} ) ),
		} );
	}

	function renderPreview() {
		if ( isWoo ) {
			return (
				<div className="sig-editor-placeholder">
					<p>
						{ __(
							'WooCommerce product images will appear here on the frontend.',
							'simple-image-gallery'
						) }
					</p>
				</div>
			);
		}

		if ( ! hasImages ) {
			return (
				<div className="sig-editor-placeholder">
					<p>
						{ __(
							'No images selected. Use the sidebar to add images.',
							'simple-image-gallery'
						) }
					</p>
				</div>
			);
		}

		return (
			<div className="sig-gallery" style={ { '--sig-height': height } }>
				{ images.map( ( img ) => (
					<img key={ img.id } src={ img.url } alt={ img.alt } />
				) ) }
			</div>
		);
	}

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Gallery Settings', 'simple-image-gallery' ) }>
					<RadioControl
						label={ __( 'Image Source', 'simple-image-gallery' ) }
						selected={ source }
						options={ [
							{
								label: __( 'WooCommerce Product', 'simple-image-gallery' ),
								value: 'woocommerce',
							},
							{
								label: __( 'Media Library', 'simple-image-gallery' ),
								value: 'adhoc',
							},
						] }
						onChange={ ( value ) => setAttributes( { source: value } ) }
					/>
					<TextControl
						label={ __( 'Gallery Height', 'simple-image-gallery' ) }
						help={ __( 'CSS value, e.g. 70vh, 400px', 'simple-image-gallery' ) }
						value={ height }
						onChange={ ( value ) => setAttributes( { height: value } ) }
					/>
					{ ! isWoo && (
						<MediaUploadCheck>
							<MediaUpload
								onSelect={ onSelectImages }
								allowedTypes={ [ 'image' ] }
								multiple
								gallery
								value={ images.map( ( img ) => img.id ) }
								render={ ( { open } ) => (
									<Button variant="secondary" onClick={ open }>
										{ hasImages
											? __( 'Edit Gallery Images', 'simple-image-gallery' )
											: __( 'Select Gallery Images', 'simple-image-gallery' ) }
									</Button>
								) }
							/>
						</MediaUploadCheck>
					) }
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>{ renderPreview() }</div>
		</>
	);
}
