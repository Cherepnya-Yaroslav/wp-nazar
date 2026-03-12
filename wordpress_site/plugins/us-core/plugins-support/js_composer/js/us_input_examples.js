/**
 * Support for adding examples to the field for Visual Composer
 */
! function( $, undefined ) {
	$( document ).on( 'click', '.usof-example', function( e ) {
		e.preventDefault();
		e.stopPropagation();

		var $target = $( e.target ).closest( 'span' ),
			$input = $target
				.closest( '.edit_form_line:not(.usof-not-live)' )
				.find( 'input[type="text"]' ),
			value = $target.html();

		$input.val( value ).trigger( 'change' );
	} );
}( jQuery );
