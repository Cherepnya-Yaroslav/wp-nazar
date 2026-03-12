/**
 * USOF Field: Color for Visual Composer
 */
! function( $, undefined ) {
	"use strict";
	$( '.vc_ui-panel-window.vc_active .type_color' ).each( function() {
		var usofField = $( this ).usofField();
		if ( usofField instanceof $usof.field ) {
			// Exclude `design_options` since initialization comes from USOF controls
			if ( usofField.$input.closest( '.type_design_options' ).length ) {
				return;
			}
			usofField.trigger( 'beforeShow' );
			usofField.on( 'change', function( field ) {
				// Note: A separate hidden field is important because Visual Composer creates events that can loop US_Colpick
				$( 'input.wpb_vc_param_value:first', field.$row )
					.val( field.getValue() )
					.attr( 'name', field.name )
					.trigger( 'change' );
			} );
		}
	} );
}( jQuery );
