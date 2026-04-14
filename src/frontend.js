/**
 * Simple Image Gallery - Frontend script.
 * Handles lightbox functionality for the gallery.
 */
import './frontend.css';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Create an SVG icon element with the given child elements.
 *
 * @param {Array<{tag: string, attrs: Object}>} children SVG child element definitions.
 * @return {SVGElement} The SVG element.
 */
function createSvgIcon( children ) {
	const svg = document.createElementNS( SVG_NS, 'svg' );
	const svgAttrs = { width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5' };
	for ( const [ key, value ] of Object.entries( svgAttrs ) ) {
		svg.setAttribute( key, value );
	}

	for ( const { tag, attrs } of children ) {
		const el = document.createElementNS( SVG_NS, tag );
		for ( const [ key, value ] of Object.entries( attrs ) ) {
			el.setAttribute( key, value );
		}
		svg.appendChild( el );
	}

	return svg;
}

const ICON_CLOSE = [
	{ tag: 'line', attrs: { x1: '18', y1: '6', x2: '6', y2: '18' } },
	{ tag: 'line', attrs: { x1: '6', y1: '6', x2: '18', y2: '18' } },
];
const ICON_PREV = [ { tag: 'polyline', attrs: { points: '15 18 9 12 15 6' } } ];
const ICON_NEXT = [ { tag: 'polyline', attrs: { points: '9 6 15 12 9 18' } } ];

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
	closeBtn.appendChild( createSvgIcon( ICON_CLOSE ) );
	content.appendChild( closeBtn );

	const prevBtn = document.createElement( 'button' );
	prevBtn.className = 'sig-lightbox__nav sig-lightbox__nav--prev';
	prevBtn.setAttribute( 'aria-label', 'Previous image' );
	prevBtn.type = 'button';
	prevBtn.appendChild( createSvgIcon( ICON_PREV ) );
	content.appendChild( prevBtn );

	const nextBtn = document.createElement( 'button' );
	nextBtn.className = 'sig-lightbox__nav sig-lightbox__nav--next';
	nextBtn.setAttribute( 'aria-label', 'Next image' );
	nextBtn.type = 'button';
	nextBtn.appendChild( createSvgIcon( ICON_NEXT ) );
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

		// Cache frequently accessed elements.
		this.imgEl = this.lightbox.querySelector( '.sig-lightbox__image' );
		this.counterEl = this.lightbox.querySelector( '.sig-lightbox__counter' );
		this.prevBtn = this.lightbox.querySelector( '.sig-lightbox__nav--prev' );
		this.nextBtn = this.lightbox.querySelector( '.sig-lightbox__nav--next' );

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

		// Fade transition.
		this.imgEl.style.opacity = '0';
		setTimeout( () => {
			this.imgEl.src = image.fullUrl || image.url;
			this.imgEl.alt = image.alt || '';
			this.imgEl.onload = () => {
				this.imgEl.style.opacity = '1';
			};
		}, 150 );

		this.counterEl.textContent = `${ this.currentIndex + 1 } / ${ this.images.length }`;

		// Hide nav buttons if only one image.
		const singleImage = this.images.length <= 1;
		this.prevBtn.style.display = singleImage ? 'none' : '';
		this.nextBtn.style.display = singleImage ? 'none' : '';
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
