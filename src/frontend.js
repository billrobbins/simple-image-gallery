import './frontend.css';

/**
 * Simple Image Gallery — frontend scroll behavior.
 *
 * Translates vertical wheel/trackpad scroll into horizontal scroll
 * on .sig-gallery containers.
 */

document.addEventListener( 'DOMContentLoaded', initGalleries );

function initGalleries() {
	const galleries = document.querySelectorAll( '.sig-gallery' );
	galleries.forEach( initGallery );
}

/**
 * Attach the scroll-to-horizontal behavior to a single gallery element.
 *
 * @param {HTMLElement} gallery
 */
function initGallery( gallery ) {
	gallery.addEventListener( 'wheel', onWheel, { passive: false } );
}

/**
 * Handle wheel events: redirect deltaY to scrollLeft.
 *
 * @param {WheelEvent} event
 */
function onWheel( event ) {
	const gallery = /** @type {HTMLElement} */ ( event.currentTarget );

	// Only intercept if there is overflow to scroll horizontally.
	const hasHorizontalOverflow = gallery.scrollWidth > gallery.clientWidth;
	if ( ! hasHorizontalOverflow ) {
		return;
	}

	event.preventDefault();

	// Use deltaY for vertical scroll wheels; fall back to deltaX for
	// trackpads that emit horizontal delta directly.
	const delta = Math.abs( event.deltaY ) >= Math.abs( event.deltaX )
		? event.deltaY
		: event.deltaX;

	gallery.scrollLeft += delta;
}
