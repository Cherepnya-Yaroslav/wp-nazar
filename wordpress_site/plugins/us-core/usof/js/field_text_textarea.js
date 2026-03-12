/**
 * USOF Field: Text / Textarea
 */
! function( $, undefined ) {
	var _window = window,
		_undefined = undefined;

	if ( _window.$usof === _undefined ) {
		return;
	}

	$usof.field[ 'text' ] = $usof.field[ 'textarea' ] = {
		/**
		 * Initializes the object.
		 */
		init: function() {
			var self = this;
			// Events
			self.$row.on( 'click', '.usof-example', self._setExampleValue.bind( self ) );
			// Note: debounce is used to get the correct value when paste text
			self.$input.on( 'change paste keyup', $ush.debounce( function() {
				self.trigger( 'change', [ self.getValue() ] );
			} ) );
		},

		/**
		 * Set example value
		 *
		 * @private
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_setExampleValue: function( e ) {
			this.setValue( $( e.target ).closest( '.usof-example' ).html() || '' );
		}
	};
}( jQuery );
