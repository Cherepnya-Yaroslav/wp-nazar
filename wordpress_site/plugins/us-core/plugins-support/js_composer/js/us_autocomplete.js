/**
 * USOF Field: Autocomplete for Visual Composer
 */
! function( $, undefined ) {
	"use strict";
	$( '.vc_ui-panel-window.vc_active .type_autocomplete' ).each( function() {
		( new $usof.field( this ) ).init( this );
	} );
}( jQuery );
