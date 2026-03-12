/**
 * USOF Fields: Checkbox & Check Table
 */
! function( $, undefined ) {
	"use strict";
	$( '.vc_ui-panel-window.vc_active .type_checkboxes' ).each( function() {
		( new $usof.field( this ) ).init( this );
	} );
}( jQuery );
