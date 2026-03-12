/**
 * USOF Field: Select
 */
! function( $, undefined ) {
	var _window = window,
		_document = document;

	if ( _window.$usof === undefined ) {
		return;
	}

	$usof.field[ 'select' ] = {
		/**
		 * Initializes the given options
		 *
		 * @param {{}} options The options
		 */
		init: function( options ) {
			var self = this;

			// Move parent functions to "parent" namespace: init => parentInit
			self.parentInit( options );

			// Elements
			self.$container = $( '.usof-select', self.$row );
			self.$hint = $( '.usof-form-row-hint-text', self.$row );

			// Variables
			self.hintsJson = {};

			// Load hints
			var $hintsJson = $( '.usof-form-row-hint-json', self.$row );
			if ( $hintsJson.length ) {
				self.hintsJson = $hintsJson[ 0 ].onclick() || {};
				$hintsJson.remove();
			}

			// Events
			self.$input.on( 'change', function() {
				self._changeSelect(); // apply select changes
				self._toggleGridLayoutDesc(); // dynamic description toggles
			} );

			// Set double value for css selectors
			self.$container
				.attr( 'selected-value', self.$input.val() );

			self.$input.trigger( 'change' ); // apply select change
		},

		/**
		 * Apply select change
		 *
		 * @private
		 */
		_changeSelect: function() {
			var self = this,
				value = '' + self.$input.val(),
				$selectedOption = self.$input.find( ":selected" ),
				selectedDataID = $selectedOption.data( 'id' ),
				selectedDataTitle = $selectedOption.data( 'title' );

			self.$container
				.attr( 'selected-value', value );

			// Setting Editr URL
			if ( selectedDataID && ( '' + selectedDataID ).match( /\d+/ ) ) {
				value = '' + selectedDataID;
			}
			if ( ! self.hintsJson.no_posts ) {
				if ( value.length && value.match( /\d+/ ) ) {
					var hint = '';
					if ( self.hintsJson.hasOwnProperty( 'edit_url' ) ) {
						var regex = /(<a [^{]+)({{post_id}})([^{]+)({{hint}})([^>]+>)/,
							editTitle = self.hintsJson.edit;
						if ( selectedDataTitle ) {
							editTitle = self.hintsJson.edit_specific + ' ' + selectedDataTitle;
						}
						hint = self.hintsJson.edit_url.replace( regex, '$1' + value + '$3' + editTitle + '$5' );
					}
					self.$hint.html( hint );
				} else {
					self.$hint.html( '' );
				}
			}
		},

		/**
		 * Dynamic description toggles for Grig Layout
		 * Implemented compatibility USBuilder and Visual Composer
		 *
		 * @private
		 */
		_toggleGridLayoutDesc: function() {
			var self = this;
			if ( ! self.$row.hasClass( 'for_grid_layouts' ) ) {
				return;
			}
			var value = self.getValue(),
				isVC = self.$row.hasClass( 'us_select_for_vc' ),
				isNumericValue = $.isNumeric( value ),
				$addDesc = $( '.us-grid-layout-desc-add', isVC ? self.$row.parent() : self.$row ),
				$editLink = $( '.us-grid-layout-desc-edit', isVC ? self.$row.parent() : self.$row );
			if ( isNumericValue ) {
				$( '.edit-link', $editLink )
					.attr( 'href', ( self.$container.data( 'edit_link' ) || '' ).replace( '%d', value ) );
			}
			$addDesc[ isNumericValue ? 'addClass' : 'removeClass' ]( 'hidden' );
			$editLink[ isNumericValue ? 'removeClass' : 'addClass' ]( 'hidden' );
		},

		/**
		 * Set the value
		 *
		 * @param {String} value
		 * @param {Boolean} quiet The quiet
		 */
		setValue: function( value, quiet ) {
			var self = this;
			// If there is no transmitted value, then we get the first available
			if ( ! $( 'option[value="'+ value +'"]', self.$input ).length ) {
				value = $( 'option:first', self.$input ).attr( 'value' ) || '';
			}

			// Move parent functions to "parent" namespace: setValue => parentSetValue
			self.parentSetValue( value, quiet );
			self.$input.trigger( 'change' ); // apply select change
		}
	};
}( jQuery );
