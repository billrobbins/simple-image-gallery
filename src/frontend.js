import './frontend.css';

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initGalleries );
} else {
	initGalleries();
}

function initGalleries() {
	document.querySelectorAll( '.sig-gallery' ).forEach( initGallery );
}

const KEYBOARD_SCROLL_STEP = 200;

function initGallery( gallery ) {
	gallery.addEventListener( 'keydown', ( event ) => {
		if ( event.key === 'ArrowRight' ) {
			event.preventDefault();
			gallery.scrollBy( { left: KEYBOARD_SCROLL_STEP, behavior: 'smooth' } );
		} else if ( event.key === 'ArrowLeft' ) {
			event.preventDefault();
			gallery.scrollBy( { left: -KEYBOARD_SCROLL_STEP, behavior: 'smooth' } );
		}
	} );
}
