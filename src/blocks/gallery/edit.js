/**
 * Gallery block editor component.
 */
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import {
	PanelBody,
	ToggleControl,
	Button,
	Placeholder,
	__experimentalNumberControl as NumberControl,
	SelectControl,
	Flex,
	FlexBlock,
	FlexItem,
} from '@wordpress/components';

const ALLOWED_MEDIA_TYPES = [ 'image' ];

const HEIGHT_UNITS = [
	{ label: 'px', value: 'px' },
	{ label: 'vh', value: 'vh' },
	{ label: 'svh', value: 'svh' },
	{ label: 'dvh', value: 'dvh' },
	{ label: 'em', value: 'em' },
	{ label: 'rem', value: 'rem' },
	{ label: '%', value: '%' },
];

export default function Edit( { attributes, setAttributes } ) {
	const { images, useProductGallery, galleryHeight, galleryHeightUnit } = attributes;

	const onSelectImages = ( newImages ) => {
		const formatted = newImages.map( ( img ) => ( {
			id: img.id,
			url: img.sizes?.large?.url || img.url,
			fullUrl: img.sizes?.full?.url || img.url,
			alt: img.alt || '',
		} ) );
		setAttributes( { images: formatted } );
	};

	const removeImage = ( index ) => {
		const updated = [ ...images ];
		updated.splice( index, 1 );
		setAttributes( { images: updated } );
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Gallery Settings', 'simple-image-gallery' ) }>
					<ToggleControl
						label={ __( 'Use WooCommerce Product Gallery', 'simple-image-gallery' ) }
						help={ __( 'Pull images from the product gallery when used on a product page.', 'simple-image-gallery' ) }
						checked={ useProductGallery }
						onChange={ ( value ) => setAttributes( { useProductGallery: value } ) }
					/>
					<div className="sig-height-control">
						<span className="sig-height-control__label">
							{ __( 'Gallery Height', 'simple-image-gallery' ) }
						</span>
						<Flex>
							<FlexBlock>
								<NumberControl
									value={ galleryHeight }
									onChange={ ( value ) => setAttributes( { galleryHeight: parseFloat( value ) || 0 } ) }
									min={ 0 }
									step={ galleryHeightUnit === 'px' ? 10 : 1 }
								/>
							</FlexBlock>
							<FlexItem>
								<SelectControl
									value={ galleryHeightUnit }
									options={ HEIGHT_UNITS }
									onChange={ ( value ) => setAttributes( { galleryHeightUnit: value } ) }
									__nextHasNoMarginBottom
								/>
							</FlexItem>
						</Flex>
					</div>
				</PanelBody>
			</InspectorControls>

			<div className="sig-editor-gallery">
				{ useProductGallery ? (
					<Placeholder
						icon="format-gallery"
						label={ __( 'Product Gallery', 'simple-image-gallery' ) }
						instructions={ __( 'Images will be loaded from the WooCommerce product gallery on the frontend.', 'simple-image-gallery' ) }
					/>
				) : (
					<>
						{ images.length > 0 && (
							<div className="sig-editor-gallery__preview">
								{ images.map( ( image, index ) => (
									<div key={ image.id || index } className="sig-editor-gallery__item">
										<img src={ image.url } alt={ image.alt } />
										<button
											type="button"
											className="sig-editor-gallery__remove"
											onClick={ () => removeImage( index ) }
											aria-label={ __( 'Remove image', 'simple-image-gallery' ) }
										>
											&times;
										</button>
									</div>
								) ) }
							</div>
						) }
						<MediaUploadCheck>
							<MediaUpload
								onSelect={ onSelectImages }
								allowedTypes={ ALLOWED_MEDIA_TYPES }
								multiple
								gallery
								value={ images.map( ( img ) => img.id ) }
								render={ ( { open } ) => (
									images.length > 0 ? (
										<Button variant="secondary" onClick={ open } className="sig-editor-gallery__add-btn">
											{ __( 'Edit Gallery', 'simple-image-gallery' ) }
										</Button>
									) : (
										<Placeholder
											icon="format-gallery"
											label={ __( 'Simple Image Gallery', 'simple-image-gallery' ) }
											instructions={ __( 'Select images to create a horizontal scroll gallery with lightbox.', 'simple-image-gallery' ) }
										>
											<Button variant="primary" onClick={ open }>
												{ __( 'Select Images', 'simple-image-gallery' ) }
											</Button>
										</Placeholder>
									)
								) }
							/>
						</MediaUploadCheck>
					</>
				) }
			</div>
		</>
	);
}
