/**
 * Support for init USOF fields in Visual Composer groups
 */
! function( $, undefined ) {
	"use strict";

	// Private variables that are used only in the context of this function, it is necessary to optimize the code.
	var _window = window;

	// Check for is set object
	_window.$usof = _window.$usof || {};

	/**
	 * This handler is required to initialize the USOF fields in each new element of the group.
	 * Note: This handler is an internal callback mechanism that is not documented and is subject to change.
	 *
	 * @private
	 * @type callback
	 *
	 * @param {Node} $newParam This is a new group param.
	 * @param {String} action The action name.
	 */
	_window._usVcParamGroupAfterAddParam = function( $newParam, action ) {
		if ( action == 'new' || action == 'clone' ) {
			// Finds all USOF fields.
			$( '.usof-form-row[data-name]', $newParam )
				.each( function( _, node ) {
					var $node = $( node );
					// If the field is already initialized, then skip it.
					if ( $node.data( 'usofField' ) instanceof $usof.field ) {
						return;
					}
					// Init of USOF fields that were added to the group.
					$node.usofField();
					$node.data( 'usofField' ).trigger( 'beforeShow' );
				} );
		}
	};
	// Finds all fields of Visual Composer type `param_group`.
	$( '.vc_ui-panel-window.vc_active .wpb_el_type_param_group' )
		.each( function( _, node ) {
			// Slight delay to get data after initialization.
			var pid = setTimeout( function() {
				var vcParamObject = $( node ).data( 'vcParamObject' ) || {};
				if ( vcParamObject.options === undefined || ! vcParamObject.options ) {
					vcParamObject.options = {};
				}
				if ( vcParamObject.options.param === undefined || ! vcParamObject.options.param ) {
					vcParamObject.options.param = {};
				}
				if ( vcParamObject.options.param.callbacks === undefined || ! vcParamObject.options.param.callbacks ) {
					vcParamObject.options.param.callbacks = {};
				}
				// Add a handler name each time a group element is added.
				vcParamObject.options.param.callbacks.after_add = '_usVcParamGroupAfterAddParam';
				clearTimeout( pid );
			}, 10 );
		} );
}( jQuery );
