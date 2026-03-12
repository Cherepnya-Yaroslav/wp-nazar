/**
 * USOF Field: Image Radio for Visual Composer
 */
! function( $, undefined ) {
	"use strict";
	$( '.vc_ui-panel-window.vc_active .usof-imgradio' ).each( function() {
		var $this = $( this ),
			$input = $this.find( 'input[type="hidden"]' );
		$this
			.find( 'input[type="radio"]' )
			.on( 'change', function() {
				$input
					.val( $.trim( this.value ) )
					.trigger( 'change' );
			} );
	} );
}( jQuery );
