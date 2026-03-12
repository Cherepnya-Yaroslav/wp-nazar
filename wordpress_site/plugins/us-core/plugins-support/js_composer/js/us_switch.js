/**
 * USOF Field: Switch for Visual Composer
 */
! function( $, undefined ) {
	"use strict";
	$( '.vc_ui-panel-window.vc_active [data-name].type_switch' ).each( function() {
		 ( new $usof.field( this ) ).init( this )
	} );
}( jQuery );
