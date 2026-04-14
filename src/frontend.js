/**
 * Simple Image Gallery - Frontend script.
 * Handles lightbox functionality for the gallery.
 */
import './frontend.css';

/**
 * Create an SVG element for lightbox icons.
 *
 * @param {string} pathMarkup The inner SVG path/shape markup.
 * @return {SVGElement} The SVG element.
 */
function createSvgIcon( pathMarkup ) {
	const svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
	svg.setAttribute( 'width', '24' );
	svg.setAttribute( 'height', '24' );
	svg.setAttribute( 'viewBox', '0 0 24 24' );
	svg.setAttribute( 'fill', 'none' );
	svg.setAttribute( 'stroke', 'currentColor' );
	svg.setAttribute( 'stroke-width', '1.5' );

	// Parse the path markup safely using a temporary container.
	const temp = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
	temp.innerHTML = pathMarkup;
	while ( temp.firstChild ) {
		svg.appendChild( temp.firstChild );
	}

	return svg;
}

/**
 * Build the lightbox DOM using safe DOM methods (no innerHTML on document elements).
 *
 * @return {HTMLElement} The lightbox root element.
 */
function buildLightboxDOM() {
	const root = document.createElement( 'div' );
	root.className = 'sig-lightbox';
	root.setAttribute( 'role', 'dialog' );
	root.setAttribute( 'aria-modal', 'true' );
	root.setAttribute( 'aria-label', 'Image lightbox' );

	const backdrop = document.createElement( 'div' );
	backdrop.className = 'sig-lightbox__backdrop';
	root.appendChild( backdrop );

	const content = document.createElement( 'div' );
	content.className = 'sig-lightbox__content';
	root.appendChild( content );

	const imageWrap = document.createElement( 'div' );
	imageWrap.className = 'sig-lightbox__image-wrap';
	content.appendChild( imageWrap );

	const img = document.createElement( 'img' );
	img.className = 'sig-lightbox__image';
	img.src = '';
	img.alt = '';
	imageWrap.appendChild( img );

	const closeBtn = document.createElement( 'button' );
	closeBtn.className = 'sig-lightbox__close';
	closeBtn.setAttribute( 'aria-label', 'Close lightbox' );
	closeBtn.type = 'button';
	closeBtn.appendChild( createSvgIcon( '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>' ) );
	content.appendChild( closeBtn );

	const prevBtn = document.createElement( 'button' );
	prevBtn.className = 'sig-lightbox__nav sig-lightbox__nav--prev';
	prevBtn.setAttribute( 'aria-label', 'Previous image' );
	prevBtn.type = 'button';
	prevBtn.appendChild( createSvgIcon( '<polyline points="15 18 9 12 15 6"></polyline>' ) );
	content.appendChild( prevBtn );

	const nextBtn = document.createElement( 'button' );
	nextBtn.className = 'sig-lightbox__nav sig-lightbox__nav--next';
	nextBtn.setAttribute( 'aria-label', 'Next image' );
	nextBtn.type = 'button';
	nextBtn.appendChild( createSvgIcon( '<polyline points="9 6 15 12 9 18"></polyline>' ) );
	content.appendChild( nextBtn );

	const counter = document.createElement( 'div' );
	counter.className = 'sig-lightbox__counter';
	content.appendChild( counter );

	return root;
}

class SIGLightbox {
	constructor( galleryEl ) {
		this.gallery = galleryEl;
		this.images = JSON.parse( galleryEl.dataset.images || '[]' );
		this.currentIndex = 0;
		this.lightbox = null;
		this.isOpen = false;
		this.touchStartX = 0;

		this.init();
	}

	init() {
		this.lightbox = buildLightboxDOM();
		document.body.appendChild( this.lightbox );

		this.bindLightboxEvents();
		this.bindGalleryClicks();
		this.bindKeyboard();
	}

	bindLightboxEvents() {
		this.lightbox.querySelector( '.sig-lightbox__close' ).addEventListener( 'click', () => this.close() );
		this.lightbox.querySelector( '.sig-lightbox__backdrop' ).addEventListener( 'click', () => this.close() );
		this.lightbox.querySelector( '.sig-lightbox__nav--prev' ).addEventListener( 'click', () => this.prev() );
		this.lightbox.querySelector( '.sig-lightbox__nav--next' ).addEventListener( 'click', () => this.next() );

		// Touch swipe support.
		const content = this.lightbox.querySelector( '.sig-lightbox__content' );
		content.addEventListener( 'touchstart', ( e ) => {
			this.touchStartX = e.changedTouches[ 0 ].screenX;
		}, { passive: true } );
		content.addEventListener( 'touchend', ( e ) => {
			const diff = e.changedTouches[ 0 ].screenX - this.touchStartX;
			if ( Math.abs( diff ) > 50 ) {
				if ( diff > 0 ) {
					this.prev();
				} else {
					this.next();
				}
			}
		}, { passive: true } );
	}

	bindGalleryClicks() {
		const items = this.gallery.querySelectorAll( '.sig-gallery__item' );
		items.forEach( ( item ) => {
			item.addEventListener( 'click', () => {
				const index = parseInt( item.dataset.index, 10 );
				this.open( index );
			} );
		} );
	}

	bindKeyboard() {
		document.addEventListener( 'keydown', ( e ) => {
			if ( ! this.isOpen ) {
				return;
			}
			if ( e.key === 'Escape' ) {
				this.close();
			} else if ( e.key === 'ArrowLeft' ) {
				this.prev();
			} else if ( e.key === 'ArrowRight' ) {
				this.next();
			}
		} );
	}

	open( index ) {
		this.currentIndex = index;
		this.updateImage();
		this.lightbox.classList.add( 'sig-lightbox--open' );
		this.isOpen = true;
		document.body.style.overflow = 'hidden';
	}

	close() {
		this.lightbox.classList.remove( 'sig-lightbox--open' );
		this.isOpen = false;
		document.body.style.overflow = '';
	}

	prev() {
		this.currentIndex = ( this.currentIndex - 1 + this.images.length ) % this.images.length;
		this.updateImage();
	}

	next() {
		this.currentIndex = ( this.currentIndex + 1 ) % this.images.length;
		this.updateImage();
	}

	updateImage() {
		const image = this.images[ this.currentIndex ];
		if ( ! image ) {
			return;
		}

		const img = this.lightbox.querySelector( '.sig-lightbox__image' );
		const counter = this.lightbox.querySelector( '.sig-lightbox__counter' );

		// Fade transition.
		img.style.opacity = '0';
		setTimeout( () => {
			img.src = image.fullUrl || image.url;
			img.alt = image.alt || '';
			img.onload = () => {
				img.style.opacity = '1';
			};
		}, 150 );

		counter.textContent = `${ this.currentIndex + 1 } / ${ this.images.length }`;

		// Hide nav buttons if only one image.
		const prevBtn = this.lightbox.querySelector( '.sig-lightbox__nav--prev' );
		const nextBtn = this.lightbox.querySelector( '.sig-lightbox__nav--next' );
		const singleImage = this.images.length <= 1;
		prevBtn.style.display = singleImage ? 'none' : '';
		nextBtn.style.display = singleImage ? 'none' : '';
	}
}

/**
 * Initialize all galleries on the page.
 */
function initGalleries() {
	const galleries = document.querySelectorAll( '.sig-gallery' );
	galleries.forEach( ( gallery ) => {
		new SIGLightbox( gallery );
	} );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initGalleries );
} else {
	initGalleries();
}
