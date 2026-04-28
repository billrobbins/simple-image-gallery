import './frontend.css';

const KEYBOARD_SCROLL_STEP = 200;

const SCROLL_KEYS = {
	ArrowRight: KEYBOARD_SCROLL_STEP,
	ArrowLeft: -KEYBOARD_SCROLL_STEP,
};

function initGallery( gallery ) {
	gallery.addEventListener( 'keydown', ( event ) => {
		const delta = SCROLL_KEYS[ event.key ];
		if ( delta === undefined ) {
			return;
		}
		event.preventDefault();
		gallery.scrollBy( { left: delta, behavior: 'smooth' } );
	} );
}

function initGalleries() {
	document.querySelectorAll( '.sig-gallery' ).forEach( initGallery );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initGalleries );
} else {
	initGalleries();
}
