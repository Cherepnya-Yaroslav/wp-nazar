/**
 * USOF Field: Autocomplete
 */
! function( $, undefined ) {

	// Private variables that are used only in the context of this function, it is necessary to optimize the code
	var _window = window,
		_undefined = undefined;

	if ( _window.$usof === _undefined ) {
		return;
	}

	/**
	 * @private
	 * @type constants
	 * @var {{}} Event KeyCodes
	 */
	var _KEYCODES_ = {
		ENTER: 13,
		BACKSPACE: 8
	};

	$usof.field[ 'autocomplete' ] = {
		/**
		 * Initializes the object
		 */
		init: function() {
			var self = this;

			// Variables
			self.disableScrollLoad = false;
			// Prefix for get params
			self._prefix = 'params:';
			// Delay for search requests
			self._typingDelay = 0.5;

			/**
			 * @var {{}} Default settings structure
			 */
			var defaultSettings = {
				ajax_query_args: {
					action: 'unknown',
					_nonce: ''
				},
				multiple: false,
				sortable: false,
				params_separator: ','
			};

			// Elements
			self.$container = $( '.usof-autocomplete', self.$row );
			self.$toggle = $( '.usof-autocomplete-toggle', self.$container );
			self.$options = $( '.usof-autocomplete-options', self.$container );
			self.$search = $( 'input[type="text"]', self.$options );
			self.$list = $( '.usof-autocomplete-list', self.$container );
			self.$message = $( '.usof-autocomplete-message', self.$container );
			self.$value = $( '> .usof-autocomplete-value', self.$container );

			// Load settings
			self._settings = $.extend( defaultSettings, self.$container[0].onclick() || {} );
			// self.$container.removeAttr( 'onclick' );


			// List of all parameters
			self.items = {};
			$( '[data-value]', self.$list ).each( function( _, item ) {
				var $item = $( item );
				self.items[ $item.data( 'value' ) ] = $item;
			} );

			// Events
			if ( ! self._settings.multiple ) {
				self.$options.on( 'click', '.usof-autocomplete-selected', function() {
					var isShow = self.$toggle.hasClass( 'show' );
					self._events.toggleList.call( self, { type: isShow ? 'blur' : 'focus' } );
					if ( ! isShow ) {
						if ( !! self.pid ) {
							clearTimeout( self.pid );
						}
						// TODO: Update to `$ush.timeout()` after implementation #3163
						self.pid = setTimeout( function() {
							self.$search.focus();
							clearTimeout( self.pid );
						}, 0 );
					}
				} );
			} else {
				// For multiple
				self.$options
					.on( 'click', '.usof-autocomplete-selected-remove', self._events.remove.bind( self ) );
			}

			self.$list.off()
				.on( 'mousedown', '[data-value]', self._events.selected.bind( self ) )
				.on( 'scroll', self._events.scroll.bind( self ) );
			self.$search.off()
				.on( 'keyup', self._events.keyup.bind( self ) )
				.on( 'input', self._events.searchDelay.bind( self ) )
				.on( 'focus blur', self._events.toggleList.bind( self ) );

			self._initValues.call( self );
			self.$container
				.toggleClass( 'multiple', self._settings.multiple );

			if ( self._settings.multiple && self._settings.sortable ) {
				// Init Drag and Drop plugin
				self.dragdrop = new $usof.dragDrop( self.$options, {
					itemSelector: '> .usof-autocomplete-selected'
				} );
				// Watch events
				self.dragdrop
					.on( 'dragend', self._events.dragdrop.dragend.bind( self ) );
			}
		},

		/**
		 * @var {Boolean} State loaded
		 */
		loaded: false, // loaded state

		/**
		 * Handlers
		 *
		 * @private
		 */
		_events: {
			/**
			 * @var {{}} Drag and Drop Handlers
			 */
			dragdrop: {
				/**
				 * Set the value in the desired order
				 *
				 * @event handler
				 * @param {$usof.dragDrop} target $usof.dragDrop
				 * @param {Event} e The Event interface represents an event which takes place in the DOM
				 */
				dragend: function( target, e ) {
					var value = [],
						items = $( '> .usof-autocomplete-selected', target.$container ).toArray() || [],
						field = $( target.$container ).closest( '.type_autocomplete' ).data( 'usofField' );
					for ( var k in items ) {
						if ( items[ k ].hasAttribute( 'data-key' ) ) {
							value.push( items[ k ].getAttribute( 'data-key' ) );
						}
					}
					value = (
						value.length
							? value.join( field._settings.params_separator )
							: ''
					);
					if ( field instanceof $usof.field ) {
						field.setValue( value );
					}
				}
			},

			/**
			 * Remove selected
			 *
			 * @event handler
			 * @param {Event} e The Event interface represents an event which takes place in the DOM
			 */
			remove: function( e ) {
				e.preventDefault();
				var self = this,
					$target = $( e.currentTarget ),
					$selected = $target.closest( '.usof-autocomplete-selected' ),
					key = $selected.data( 'key' );
				self._removeValue.call( self, key );
				$( '[data-value="' + key + '"]', self.$list ).removeClass( 'selected' );
				$selected.remove();
			},

			/**
			 * Delayed search to avoid premature queries
			 *
			 * @event handler
			 * @param {Event} e The Event interface represents an event which takes place in the DOM
			 */
			searchDelay: function( e ) {
				if ( ! e.currentTarget.value ) {
					return;
				}
				var self = this;
				if ( !! self._typingTimer ) {
					clearTimeout( self._typingTimer );
				}
				// TODO: Update to `$ush.timeout()` after implementation #3163
				self._typingTimer = setTimeout( function() {
					self._events.search.call( self, e );
					clearTimeout( self._typingTimer );
				}, 1000 * self._typingDelay );
			},

			/**
			 * Filtering results when entering characters in the search field
			 *
			 * @event handler
			 * @param {Event} e The Event interface represents an event which takes place in the DOM
			 */
			search: function( e ) {
				var self = this,
					$input = $( e.currentTarget ),
					value = ( $.trim( $input.val() ).toLowerCase() ).replace( /\=|\"|\s/, '' ),
					$items = $( '[data-value]', self.$list ),
					$groups = $( '[data-group]', self.$list ),
					/**
					 * Filters parameters by search text
					 *
					 * @private
					 * @param {jQuery} $items
					 * @var {Function} Filters parameters by search text
					 */
					filter = function( $items ) {
						$items
							.addClass( 'hidden' )
							.filter( '[data-text^="'+ value +'"], [data-text*="'+ value +'"]' )
							.removeClass( 'hidden' );
						$groups.each( function() {
							var $group = $( this );
							$group.toggleClass( 'hidden', ! $( '[data-value]:not(.hidden)', $group ).length );
						});
					};

				// Check value
				if ( ! value || value.length < 1 ) {
					$items.removeClass( 'hidden' );
					return;
				}

				// Filter by search text
				filter.call( self, $items );

				// Enable scrolling data loading
				self.disableScrollLoad = false;

				// Search preload
				self._ajax.call( self, function( items ) {
					// Filter by search text
					filter.call( self, $( '> *', self.$list ) );
					// Messages no results found
					if ( value && ! $( '[data-value]:not(.hidden)', self.$list ).length ) {
						self._showMessage.call( self, self._settings.no_results_found );
					} else {
						self._clearMessage.call( self );
						self.$toggle.addClass( 'show' );
					}
				} );
			},

			/**
			 * Selected option
			 *
			 * @event handler
			 * @param {Event} e The Event interface represents an event which takes place in the DOM
			 */
			selected: function( e ) {
				var self = this,
					$target = $( e.currentTarget ),
					selectedValue = $target.data( 'value' ) || '';
				if ( $target.hasClass( 'selected' ) && self._settings.multiple ) {
					// Remove item
					self._removeValue.call( self, selectedValue );
					$( '[data-key="' + selectedValue + '"]', self.$options ).remove();
					$target.removeClass( 'selected' );
				} else if ( self._addValue.call( self, selectedValue ) ) {
					if ( ! self._settings.multiple ) {
						$( '.usof-autocomplete-selected', self.$options ).remove();
						$( '[data-value]', self.$list ).removeClass( 'selected' );
					}
					self.$toggle.removeClass( 'show' );
					$target.addClass( 'selected' );

					// Added item
					self.$search
						.val( '' )
						.before( self._getSelectedTemplate.call( self, selectedValue ) );
				}
			},

			/**
			 * When scrolling a sheet, load the parameters
			 *
			 * @event handler
			 * @param {Event} e The Event interface represents an event which takes place in the DOM
			 */
			scroll: function( e ) {
				var self = this,
					$target = $( e.currentTarget );
				if (
					! self.disableScrollLoad
					&& ! self.loaded
					&& ( $target.scrollTop() + $target.height() ) >= ( e.currentTarget.scrollHeight - 1 )
				) {
					self._ajax.call( self, function( items ) {
						if ( $.isEmptyObject( items ) ) {
							self.disableScrollLoad = true;
						}
					} );
				}
			},

			/**
			 * Input event handler for Search
			 *
			 * @event handler
			 * @param {Event} e The Event interface represents an event which takes place in the DOM
			 */
			keyup: function( e ) {
				var self = this;
				if ( e.keyCode === _KEYCODES_.ENTER ) {
					// If you press enter and there are matching elements, then selected option
					var search = $.trim( self.$search.val() ),
						$selected = $( '[data-text="'+ search +'"]:visible:first', self.$list );
					if ( ! $selected.length ) {
						$selected = $( '[data-value]:visible:first', self.$list );
					}
					if ( $selected.length ) {
						$selected.trigger( 'click' );
					}
				}
				if ( e.keyCode === _KEYCODES_.BACKSPACE ) {
					if ( ! $.trim( self.$search.val() ) ) {
						self._clearMessage.call( self );
						$( '.hidden', self.$list ).removeClass( 'hidden' );
						self.$toggle.addClass( 'show' );
					}
				}
			},

			/**
			 * Show/Hide list
			 *
			 * @event handler
			 * @param {Event} e The Event interface represents an event which takes place in the DOM
			 */
			toggleList: function( e ) {
				var self = this,
					isFocus = ( e.type === 'focus' ),
					pid = $ush.timeout( function() {
						self.$toggle.toggleClass( 'show', isFocus );
						$ush.clearTimeout( pid );
					}, ( isFocus ? 0 : 200 /* the delay for the blur event is necessary for the selection script to work out */ ) );
				// If there is no search text, then all parameters are show
				if ( ! $.trim( self.$search.val() ) ) {
					$( '[data-value].hidden, [data-group].hidden', self.$list ).removeClass( 'hidden' );
				}
			}
		},

		/**
		 * Load and search option
		 *
		 * @private
		 * @param function callback
		 */
		_ajax: function( callback ) {
			var self = this;
			if ( self.loaded ) {
				return;
			}

			var query_args = self._settings.ajax_query_args;
			// If the handler is not installed, then cancel the request
			if (
				(
					! query_args.hasOwnProperty( 'action' )
					|| query_args.action === 'unknown'
				)
				&& $.isFunction( callback )
			) {
				return callback.call( self, {} );
			}

			// Request data
			var data = $.extend( query_args || {}, {
				offset: $( '[data-value]:visible', self.$list ).length,
				search: $.trim( self.$search.val() ),
			});

			// Checking the last offset, it cannot be repeated repeating say that all data is loaded
			if ( self._offset && self._offset === data.offset ) {
				return;
			}
			self._offset = data.offset;

			self.loaded = true;
			self.$container.addClass( 'loaded' );
			self._clearMessage.call( self );

			self._offset = data.offset;

			// If the value is then add 1 to take into account the zero element of the array
			if ( data.offset ) {
				data.offset += 1;
			}

			/**
			 * Add option to sheet
			 *
			 * @param {Node} $el
			 * @param {String} name
			 * @param {String} value
			 * @var {Function} Add option to sheet
			 */
			var insertItem = function( $el, name, value ) {
				if ( ! self.items.hasOwnProperty( value ) ) {
					var text = ( name || '' ).replace( /\s/, '' ).toLowerCase(),
						$item = $( '<div data-value="'+ $ush.stripTags( value ) +'" data-text="'+ $ush.stripTags( text ) +'" tabindex="3">'+ name +'</div>' );
					$el.append( $item );
					self.items[ value ] = $item;
				}
			};

			// Get data
			$.get( ajaxurl, data, function( res ) {
				self.loaded = false;
				self.$container.removeClass( 'loaded' );
				self._clearMessage.call( self );

				if ( ! res.success ) {
					self._showMessage.call( self, res.data.message );
					return;
				}

				// Add to the list of new parameters
				$.each( res.data.items, function( value, name ) {
					if ( $.isPlainObject( name ) ) {
						$.each( name, function( _value, _name ) {
							var $groupList = $( '[data-group="'+ value +'"]:first', self.$list );
							if ( ! $groupList.length ) {
								$groupList = $( '<div class="usof-autocomplete-list-group" data-group="'+ value +'"></div>' );
								self.$list.append( $groupList );
							}
							insertItem.call( self, $groupList, _name, _value );
						} );
					} else {
						insertItem.call( self, self.$list, name, value );
					}
				} );

				// Run callback function
				if ( $.isFunction( callback ) ) {
					callback.call( self, res.data.items );
				}

				// We’ll run an event for watches the data update
				self.trigger( 'data.loaded', res.data.items );
			}, 'json' );
		},

		/**
		 * Initializes the values
		 *
		 * @private
		 */
		_initValues: function() {
			var self = this,
				// Parameters which are not in the list and need to be loaded
				loadParams = [],
				initValues = ( self.$value.val() || '' ).split( self._settings.params_separator ) || [];

			// Remove selecteds
			$( '.usof-autocomplete-selected', self.$options ).remove();

			// Selection of parameters during initialization
			initValues.map( function( key ) {
				if ( ! key ) {
					return;
				}
				var $item = $( '[data-value="' + key + '"]:first', self.$list )
					.addClass( 'selected' );
				if ( $item.length ) {
					self.$search.before( self._getSelectedTemplate.call( self, key ) );
				} else {
					loadParams.push( key );
				}
			} );

			// Loading and selection of parameters which are not in the list but must be displayed
			if ( loadParams.length ) {
				self.$search.val( self._prefix + loadParams.join( self._settings.params_separator ) );
				self._ajax.call( self, function( items ) {
					// Reset previously selected parameters to guarantee the desired order
					$( '[data-key]', self.$options ).remove();
					$( '.selected', self.$list ).removeClass( 'selected' );

					// Selecting parameters by an array of identifiers, this guarantees the desired order
					$( initValues ).each( function( _, key ) {
						if ( self.items.hasOwnProperty( key ) && self.items[ key ] instanceof $ ) {
							self.items[ key ].addClass( 'selected' );
							self.$search.before( self._getSelectedTemplate.call( self, key ) );
						}
					} );
				} );

				self.$search.val( '' );
			}
		},

		/**
		 * Show the message
		 *
		 * @private
		 * @param {String} text The message text
		 */
		_showMessage: function( text ) {
			var self = this;
			self.$list.addClass( 'hidden' );
			self.$message
				.text( text )
				.removeClass( 'hidden' );
		},

		/**
		 * Clear this message
		 *
		 * @private
		 */
		_clearMessage: function() {
			var self = this;
			self.$list.removeClass( 'hidden' );
			self.$message
				.addClass( 'hidden' )
				.text( '' );
		},

		/**
		 * Add a parameter to the result
		 *
		 * @param {String} key The unique key
		 * @return {Boolean} Returns true if the value was added successfully, otherwise false
		 */
		_addValue: function( key ) {
			var self = this,
				isNotEnabled = false,
				values = [],
				value = key;
			if ( self._settings.multiple ) {
				values = ( self.$value.val() || '' ).split( self._settings.params_separator );
				for ( var k in values ) {
					if ( values[ k ] === key ) {
						isNotEnabled = true;
						break;
					}
				}
				if ( ! isNotEnabled ) {
					values.push( key );
					value = ( values || [] ).join( self._settings.params_separator ).replace( /^\,/, '' );
				}
			}
			if ( ! isNotEnabled ) {
				self.$value.val( value );
				self.trigger( 'change', [ value ] );
				return true;
			}
			return false;
		},

		/**
		 * Removing a parameter from the result
		 *
		 * @private
		 * @param {String} key The key
		 */
		_removeValue: function( key ) {
			var self = this,
				values = ( self.$value.val() || '' ).toLowerCase().split( self._settings.params_separator ),
				index = values.indexOf( '' + key );
			if ( index !== -1 ) {
				delete values[ index ];
				// Reset indexes
				values = values.filter( function( item ) {
					return item !== _undefined;
				} );
				self.$value.val( values.join( self._settings.params_separator ) );
			}
			self.trigger( 'change', [ self.getValue() ] );
		},

		/**
		 * Get the selected template
		 *
		 * @private
		 * @param {String} key The key
		 * @return {String}
		 */
		_getSelectedTemplate: function( key ) {
			var $selected = $( '[data-value="' + key + '"]:first', this.$list );
			if ( ! $selected.length ) {
				return '';
			}
			return '<span class="usof-autocomplete-selected" data-key="' + key + '">\
				' + $selected.html() + ' <a href="javascript:void(0)" title="Remove" class="usof-autocomplete-selected-remove ui-icon_delete"></a>\
			</span>';
		},

		/**
		 * Get value
		 *
		 * @private
		 * @return {String}
		 */
		getValue: function() {
			var self = this;
			return ( self.$value instanceof $ ) ? self.$value.val() : '';
		},

		/**
		 * Set values
		 *
		 * @private
		 * @param {String} value The value
		 * @param {Boolean} quiet The quiet
		 */
		setValue: function( value, quiet ) {
			var self = this;
			self.$value.val( value );
			self._initValues.call( self );
			if ( ! quiet ) {
				self.trigger( 'change', [ value ] );
			}
		}
	};
}( jQuery );
