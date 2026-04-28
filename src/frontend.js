import './frontend.css';

/**
 * Simple Image Gallery — frontend scroll behavior.
 *
 * Translates vertical wheel/trackpad scroll into horizontal scroll
 * on .sig-gallery containers.
 */

document.addEventListener( 'DOMContentLoaded', initGalleries );

function initGalleries() {
	document.querySelectorAll( '.sig-gallery' ).forEach( initGallery );
}

/** Scroll distance per keyboard arrow press (px). */
const KEYBOARD_SCROLL_STEP = 200;

/**
 * Attach scroll-to-horizontal behavior to a single gallery element.
 * Caches the overflow state and refreshes it on resize to avoid
 * forced layout reflow on every wheel event.
 *
 * @param {HTMLElement} gallery
 */
function initGallery( gallery ) {
	let hasOverflow = gallery.scrollWidth > gallery.clientWidth;

	const observer = new ResizeObserver( () => {
		hasOverflow = gallery.scrollWidth > gallery.clientWidth;
	} );
	observer.observe( gallery );

	gallery.addEventListener(
		'wheel',
		( event ) => {
			if ( ! hasOverflow ) {
				return;
			}
			event.preventDefault();
			const delta = Math.abs( event.deltaY ) >= Math.abs( event.deltaX )
				? event.deltaY
				: event.deltaX;
			gallery.scrollLeft += delta;
		},
		{ passive: false }
	);

	gallery.addEventListener( 'keydown', ( event ) => {
		if ( event.key === 'ArrowRight' ) {
			event.preventDefault();
			gallery.scrollLeft += KEYBOARD_SCROLL_STEP;
		} else if ( event.key === 'ArrowLeft' ) {
			event.preventDefault();
			gallery.scrollLeft -= KEYBOARD_SCROLL_STEP;
		}
	} );
}
