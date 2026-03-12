/**
 * Available spaces
 *
 * _window.$usb - USBuilder class instance
 * _window.$usbcore - Mini library of various methods
 * _window.$usbdata - Data for import into the USBuilder
 * _window.$usof - UpSolution CSS Framework
 * _window.$ush - US Helper Library
 *
 * Note: Double underscore `__funcname` is introduced for functions that are created through `$ush.debounce(...)`.
 */
! function( $, undefined ) {

	// Private variables that are used only in the context of this function, it is necessary to optimize the code
	var _window = window,
		_document = document,
		_undefined = undefined;

	// Math API
	var abs = Math.abs,
		ceil = Math.ceil;

	// Check for is set objects
	_window.$ush = _window.$ush || {};
	_window.$usbdata = _window.$usbdata || {};

	/**
	 * @private
	 * @var {{}} Private storage of all data objects
	 */
	var _$$cache = {};

	/**
	 * @class Data storage class
	 * @param {String} namespace
	 */
	var USBData = function( namespace ) {
		self = this;
		// Variables
		self._$data = {}; // the data storage location
		self._namespace = namespace; // the namespace the class belongs to
	};

	/**
	 * @var {USBData} Prototype USBData
	 */
	usbDataPrototype = USBData.prototype;

	/**
	 * Check for the presence of a key in the data
	 *
	 * @param {String} key Unique key for data
	 * @return {Boolean} Returns True if the entry exists, False otherwise
	 */
	usbDataPrototype.has = function( key ) {
		return ! $ush.isUndefined( this._$data[ key ] );
	};

	/**
	 * Get data from cache
	 *
	 * @param {String} key Unique key for data
	 * @param {Function|Mixed} value The value to be set if there is no value
	 * @return {Mixed} Returns values from cache or `undefined`
	 */
	usbDataPrototype.get = function( key, value ) {
		var self = this;
		if ( ! self.has( key ) ) {
			// Get default data from a callback function
			if ( $.isFunction( value ) ) {
				value = value.call( self );
			}
			if ( arguments.length === 2 ) {
				self._$data[ key ] = value;
			}
		}
		return self._$data[ key ];
	};

	/**
	 * Set data from cache
	 *
	 * @param {String} key Unique key for data
	 * @param {Function|Mixed} value The value to be stored in the cache
	 * @return self
	 */
	usbDataPrototype.set = function() {
		var self = this;
		self.get.apply( self, $ush.toArray( arguments ) );
		return self;
	};

	/**
	 * Remove data by key
	 *
	 * @param {String} key Unique key for data
	 * @return self
	 */
	usbDataPrototype.remove = function( key ) {
		var self = this,
			args = $ush.toArray( arguments );
		for ( var i in args ) {
			if ( self.has( args[ i ] ) ) {
				delete self._$data[ args[ i ] ];
			}
		}
		return self;
	};

	/**
	 * Flushes an instance from global storage
	 */
	usbDataPrototype.flush = function() {
		var self = this;
		if ( ! $ush.isUndefined( _$$cache[ self._namespace ] ) ) {
			delete _$$cache[ self._namespace ];
		}
	};

	/**
	 * @var {{}} The functionality for expand objects
	 */
	$usbcore = {};

	/**
	 * Compares the plain object
	 *
	 * @param {{}} firstObject The first object
	 * @param {{}} secondObject The second object
	 * @return {Boolean} If the objects are equal it will return True, otherwise False
	 */
	$usbcore.comparePlainObject = function() {
		var args = arguments;
		for ( var i = 1; i > -1; i-- ) {
			if ( ! $.isPlainObject( args[ i ] ) ) {
				return false;
			}
		}
		return JSON.stringify( args[ /* first */0 ] ) === JSON.stringify( args[ /* second */1 ] );
	};

	/**
	 * Removing passed properties from an object
	 *
	 * @param {{}} data The input data
	 * @param {String|[]} props The property or properties to remove
	 * @return {{}} Returns a cleaned up new object
	 */
	$usbcore.clearPlainObject = function( data, props ) {
		var self = this;
		if ( ! $.isPlainObject( data ) ) {
			data = {};
		}
		if ( $ush.isUndefined( props ) ) {
			return data;
		}
		// Props to a single type
		if ( ! $.isArray( props ) ) {
			props = [ '' + props ];
		}
		// Clone data to get rid of object references
		data = $ush.clone( data );
		// Remove all specified properties from an object
		for ( var k in props ) {
			var prop = props[ k ];
			if ( ! data.hasOwnProperty( prop ) ) {
				continue;
			}
			delete data[ prop ];
		}
		return data;
	}

	/**
	 * Find a value in data
	 *
	 * @param {String} value The value to be found.
	 * @param {{}|[]} data The object to check example: {one:'one',two:'two'}`, `['one','two']`
	 * @return {Boolean} Returns the index of the value on success, otherwise -1.
	 */
	$usbcore.indexOf = function( value, data ) {
		var self = this;
		if ( $.isPlainObject( data ) ) {
			data = Object.values( data );
		}
		if ( $.isArray( data ) ) {
			return data.indexOf( $.isNumeric( value ) ? value : '' + value );
		}
		return -1;
	};

	/**
	 * Deep search for a value along a path in a simple object
	 *
	 * @param {{}} dataObject Simple data object for search
	 * @param {String} path Dot-delimited path to get value from object
	 * @param {Mixed} _default Default value when no result
	 * @return {Mixed}
	 */
	$usbcore.deepFind = function( dataObject, path, _default ) {
		var self = this;
		// Remove all characters except the specified ones
		// Note: Some shortcodes use `-` as separator, example: `[us-name...][us_name...]`
		path = ( '' + path )
			.replace( /[^A-z\d\-\_\.]/g, '' )
			.trim();
		if ( ! path ) {
			return _default;
		}
		// Get the path as an array of keys
		if ( path.indexOf( '.' ) > -1 ) {
			// Split string into array of paths
			path = path.split( '.' );
		} else {
			path = [ path ];
		}
		// Get the result based on an array of keys
		var result = $.isPlainObject( dataObject ) ? dataObject : {};
		for ( k in path ) {
			result = result[ path[ k ] ];
			if ( $ush.isUndefined( result ) ) {
				return _default;
			}
		}
		// Return the final result
		return result;
	};

	// Prototype mixin for all classes work with events
	$usbcore.mixins = {};
	$usbcore.mixins.events = {
		/**
		 * Attach a handler to an event for the class instance
		 *
		 * @param {String} eventType A string contain event type
		 * @param {Function} handler A functionto execute each time the event is triggered
		 * @param {Boolean} one A function that is executed only once when an event is triggered
		 * @return self
		 */
		on: function( eventType, handler, one ) {
			var self = this;
			if ( self.$$events === _undefined ) {
				self.$$events = {};
			}
			if ( self.$$events[ eventType ] === _undefined ) {
				self.$$events[ eventType ] = [];
			}
			self.$$events[ eventType ].push( {
				handler: handler,
				one: !! one,
			} );
			return self;
		},
		/**
		 * Attach a handler to an event for the class instance. The handler is executed at most once
		 *
		 * @param {String} eventType A string contain event type
		 * @param {Function} handler A function to execute each time the event is triggered
		 * @return self
		 */
		one: function( eventType, handler ) {
			return this.on( eventType, handler, /* one */true );
		},
		/**
		 * Remove a previously-attached event handler from the class instance
		 *
		 * @chainable
		 * @param {String} eventType A string contain event type
		 * @param {Function} [handler] The functionthat is to be no longer executed
		 * @return self
		 */
		off: function( eventType, handler ) {
			var self = this;
			if (
				self.$$events === _undefined
				|| self.$$events[ eventType ] === _undefined
			) {
				return self;
			}
			if ( handler !== _undefined ) {
				for ( var handlerPos in self.$$events[ eventType ] ) {
					if ( handler === self.$$events[ eventType ][ handlerPos ].handler ) {
						self.$$events[ eventType ].splice( handlerPos, 1 );
					}
				}
			} else {
				self.$$events[ eventType ] = [];
			}
			return self;
		},
		/**
		 * Execute all handlers and behaviours attached to the class instance for the given event type
		 *
		 * @chainable
		 * @param {String} eventType A string contain event type
		 * @param {[]} extraParams Additional parameters to pass along to the event handler
		 * @return self
		 */
		trigger: function( eventType, extraParams ) {
			var self = this;
			if (
				self.$$events === _undefined
				|| self.$$events[ eventType ] === _undefined
				|| self.$$events[ eventType ].length === 0
			) {
				return self;
			}
			var args = arguments,
				params = ( args.length > 2 || ! $.isArray( extraParams ) )
					? [].slice.call( args, 1 )
					: extraParams;
			for ( var i = 0; i < self.$$events[ eventType ].length; i++ ) {
				var event = self.$$events[ eventType ][ i ];
				event.handler.apply( event.handler, params );
				if ( !! event.one ) {
					self.off( eventType, event.handler );
				}
			}
			return self;
		}
	};

	/**
	 * Determines whether the specified elm is node type
	 *
	 * @param {Node|Mixed} node The node from document
	 * @return {Boolean} True if the specified elm is node type, False otherwise
	 */
	$usbcore.isNode = function( node ) {
		return !! node && node.nodeType;
	};

	/**
	 * Get the size of the element and its position relative to the viewport
	 *
	 * @param {Node} node The node from document
	 * @return {{}}
	 */
	$usbcore.$rect = function( node ) {
		return this.isNode( node )
			? node.getBoundingClientRect()
			: {};
	};

	/**
	 * Adds the specified class(es) to each element in the set of matched elements
	 *
	 * @param {Node} node The node from document
	 * @param {String} className One or more classes (separated by spaces) to be toggled for each element in the matched set
	 * @return self
	 */
	$usbcore.$addClass = function( node, className ) {
		var self = this;
		if ( self.isNode( node ) && className ) {
			node.classList.add( className );
		}
		return self;
	};

	/**
	 * Remove a single class or multiple classes from each element in the set of matched elements
	 *
	 * @param {Node} node The node from document
	 * @param {String} className One or more classes (separated by spaces) to be toggled for each element in the matched set
	 * @return self
	 */
	$usbcore.$removeClass = function( node, className ) {
		var self = this;
		if ( self.isNode( node ) && className ) {
			( '' + className ).split( /\s/ ).map( function( itemClassName ) {
				if ( ! itemClassName ) {
					return;
				}
				node.classList.remove( itemClassName );
			} );
		}
		return self;
	};

	/**
	 * Add or remove one or more classes from each element in the set of matched elements,
	 * depend on either the class's presence or the value of the state argument
	 *
	 * @param {Node} node The node from document
	 * @param {String} className One or more classes (separated by spaces) to be toggled for each element in the matched set
	 * @param {Boolean} state A boolean (not just truthy/falsy) value to determine whether the class should be added or removed
	 * @return self
	 */
	$usbcore.$toggleClass = function( node, className, state ) {
		var self = this;
		if ( self.isNode( node ) && className ) {
			self[ !! state ? '$addClass' : '$removeClass' ]( node, className );
		}
		return self;
	};

	/**
	 * Determine whether any of the matched elements are assigned the given class
	 *
	 * @param {Node} node The node from document
	 * @param {String} className The class name one or more separated by a space
	 * @return {Boolean} True, if there is at least one class, False otherwise
	 */
	$usbcore.$hasClass = function( node, className ) {
		var self = this;
		if ( self.isNode( node ) && className ) {
			var classList = ( '' + className ).split( /\s/ );
			for ( var i in classList ) {
				className = '' + classList[ i ];
				if ( ! className ) {
					continue;
				}
				if ( self.indexOf( className, ( node.className || '' ).split( /\s/ ) ) > -1 ) {
					return true;
				}
			}
		}
		return false;
	};

	/**
	 * Get or Set the attribute value for the passed node
	 *
	 * @param {Node} node The node from document
	 * @param {String} name The attribute name
	 * @param {String} value The value
	 * @return {Mixed}
	 */
	$usbcore.$attr = function( node, name, value ) {
		var self = this;
		if ( ! self.isNode( node ) || ! name ) {
			return;
		}
		// Set value to attribute.
		if ( ! $ush.isUndefined( value ) ) {
			node.setAttribute( name, value );
			return self;
		}
		// Get value in attribute
		else if ( !! node[ 'getAttribute' ] ) {
			return node.getAttribute( name ) || '';
		}
		return;
	};

	/**
	 * Remove element
	 *
	 * @param {Node} node The node from document
	 * @return self
	 */
	$usbcore.$remove = function( node ) {
		var self = this;
		if ( self.isNode( node ) ) {
			node.remove();
		}
		return self;
	};

	/**
	 * Copy the passed text to the clipboard
	 *
	 * @param {String} text The text to copy
	 * @return {Boolean}
	 */
	$usbcore.copyTextToClipboard = function( text ) {
		var self = this;
		try {
			// Add a temporary field for the record
			var textarea = _document.createElement( 'textarea' );
			textarea.value = '' + text;
			self.$attr( textarea, 'readonly', '' );
			self.$attr( textarea, 'css', 'position:absolute;top:-9999px;left:-9999px' );
			_document.body.append( textarea );
			// Copy text to clipboard
			textarea.select();
			_document.execCommand( 'copy' );
			// The unselect data
			if ( _window.getSelection ) {
				_window.getSelection().removeAllRanges();
			} else if ( _document.selection ) {
				_document.selection.empty();
			}
			// Remove temporary field from document
			self.$remove( textarea );
			return true;
		} catch ( err ) {
			return false;
		}
	};

	/**
	 * Get a dedicated cache instance
	 *
	 * @param {String} namespace The unique namespace
	 * @return {USBData} Returns the USBData class
	 */
	$usbcore.cache = function( namespace ) {
		var self = this;
		if ( ! $.isPlainObject( _$$cache ) ) {
			_$$cache = {};
		}
		if ( $ush.isUndefined( _$$cache[ namespace ] ) ) {
			_$$cache[ namespace ] = new USBData( namespace );
		}
		if ( $ush.isUndefined( namespace ) ) {
			console.log( 'Error: Namespace not set', [ namespace ] );
		}
		return _$$cache[ namespace ];
	};

	/**
	* Redirect messages from a frame to an object event
	*
	* @param {Event} e The Event interface represents an event which takes place in the DOM
	* @param void
	* @private
	*/
	$usbcore._onMessage = function( e ) {
		var data, self = this;
		try {
			data = JSON.parse( e.data );
		} catch ( err ) {
			return;
		}
		if ( data instanceof Array && data[ /* namespace */ 0 ] === 'usb' && data[ /* event */ 1 ] !== _undefined ) {
			self.trigger( data[ /* event */ 1 ], data[ /* arguments */ 2 ] || [] );
		}
	};

	// Export to window
	_window.$usbcore = $usbcore;

	/**
	 * @private
	 * @type constants
	 * @var {{}} The type of data history used
	 */
	var _HISTORY_TYPE_ = {
		REDO: 'redo',
		UNDO: 'undo'
	};

	/**
	 * @private
	 * @type constants
	 * @var {{}} Actions that are applied when content changes
	 */
	var _CHANGED_ACTION_ = {
		CALLBACK: 'callback', // recovery via callback function
		CREATE: 'create', // create new shortcode and add to content
		MOVE: 'move', // move shortcode
		REMOVE: 'remove', // remove shortcode from content
		UPDATE: 'update' // update shortcode in content
	};

	/**
	 * @private
	 * @type constants
	 * @var {{}} Direction constants
	 */
	var _DIRECTION_ = {
		BOTTOM: 'bottom',
		TOP: 'top'
	};

	/**
	 * @private
	 * @type constant
	 * @var {RegExp} Regular expression for finding builder IDs
	 */
	var _REGEXP_USBID_ATTR_ = /(\s?usbid="([^\"]+)?")/g;

	/**
	 * @private
	 * @type constant
	 * @var {RegExp} Regular expression for check and extract alias from usbid
	 */
	var _REGEXP_USBID_ALIAS_ = /^([\w\-]+:\d+)\|([a-z\d\-]+)$/;

	/**
	 * @private
	 * @var {{}} Default data models
	 */
	var _default = {
		// Default page data object
		pageData: {
			content: '', // page content
			customCss: '', // page Custom CSS
			pageMeta: {}, // page Meta Data
			fields: {} // page fields post_title, post_status, post_name etc
		},
		// Default object of change history
		changesHistory: {
			redo: [], // data redo stack
			tasks: [], // all tasks to recover
			undo: [] // data undo stack
		},
		// Default config for the builder
		config: {
			shortcode: {
				// List of container shortcodes (with a close tag)
				containers: [],
				// List of shortcodes whose value is content
				edit_content: {},
				// List of default values for shortcodes
				default_values: {},
				// The a list of strict relations between shortcodes
				relations: {},
			},

			// List of usof field types for which to use throttle
			useThrottleForFields: [],

			// List of usof field types for which the update interval is used
			useLongUpdateForFields: [],

			// Available shortcodes and their titles
			elm_titles: {},

			// Templates shortcodes or html
			template: {},

			// Default parameters for AJAX requests
			ajaxArgs: {},

			// Get screen sizes of responsive states
			breakpoints: {},

			// Default placeholder (Used in import shortcodes)
			placeholder: '',

			// Post types for selection in Grid element (Used in import shortcodes)
			grid_post_types: [],

			// Meta key for post custom css
			keyCustomCss: 'usb_post_custom_css', // default

			// Link to preview page
			previewUrl: '',

			// A single place for the names of classes that are used in different places in the builder
			className: {
				// A class that indicates that the element is in the state of load from the server
				elmLoad: 'usb-elm-loading'
			}
		}
	};

	/**
	 * @class Main us-builder class
	 * @param {String} container The main container
	 * TODO: Create a navigator for the panel. This will reduce the amount of code and apply the settings
	 */
	var USBuilder = function( container ) {
		var self = this;

		/* Base elements
		--------------------------------------------------------------------------*/
		self.$document = $( _document );
		self.$body = $( 'body' );

		/* Main container
		--------------------------------------------------------------------------*/
		self.$container = $( container );
		self.$notifyPrototype = $( '.usb-notification', self.$container );

		/* Panel elements
		--------------------------------------------------------------------------*/
		self.$panel = $( '.usb-panel', self.$container );
		self.$panelBody = $( '.usb-panel-body', self.$panel );
		self.$panelElms = $( '.usb-panel-elms', self.$panel );
		self.$panelImportContent = $( '.usb-panel-import-content', self.$panel );
		self.$panelImportTextarea = $( '.usb-panel-import-content textarea:first', self.$panel );
		self.$panelMessages = $( '.usb-panel-messages', self.$panel );
		self.$panelPageCustomCss = $( '.usb-panel-page-custom-css', self.$panel );
		self.$panelPageSettings = $( '.usb-panel-page-settings', self.$panel );
		self.$panelSearchElms = $( '[data-search-text]', self.$panel );
		self.$panelSearchField = $( 'input[name=search]', self.$panel );
		self.$panelSearchNoResult = $( '.usb-panel-elms-search-noresult', self.$panel );
		self.$panelTitle = $( '.usb-panel-header-title', self.$panel );
		self.$panelAddItemsTabs = $( '.usb-panel-add-items', self.$panel );
			// Panel elements > Actions
			self.$panelActionElmAdd = $( '.usb_action_elm_add', self.$panel );
			self.$panelActionPageCustomCss = $( '.usb_action_show_page_custom_css', self.$panel );
			self.$panelActionPageSettings = $( '.usb_action_show_page_settings', self.$panel );
			self.$panelActionRedo = $( '.usb_action_redo', self.$panel );
			self.$panelActionSaveChanges = $( '.usb_action_save_changes', self.$panel );
			self.$panelActionpastedSaveContent = $( '.usb_action_pasted_save_content', self.$panel );
			self.$panelActionShowMenu = $( '.usb_action_show_menu', self.$panel );
			self.$panelActionToggleResponsiveMode = $( '.usb_action_toggle_responsive_mode', self.$panel );
			self.$panelActionUndo = $( '.usb_action_undo', self.$panel );

		/* Navigator elements
		--------------------------------------------------------------------------*/
		self.$navigator = $( '.usb-navigator', self.$container );
		self.$navigatorBody = $( '.usb-navigator-body', self.$navigator );
			// Navigator elements > Actions
			self.$navigatorActionHide = $( '.usb_action_navigator_hide', self.$navigator );
			self.$navigatorActionSwitch = $( '.usb_action_navigator_switch', self.$panel );
			self.$navigatorActionExpandAll = $( '.usb_action_navigator_expand_all', self.$navigator );

		/* Templates tab
		--------------------------------------------------------------------------*/
		self.$templates = $( '.usb-templates', self.$panel );
		self.$templatesCategory = $( '.usb-template', self.$templates );
		self.$templatesItem = $( '.usb-template-item', self.$templates );
		self.$templatesLoadedError = $( '.usb-templates-error', self.$templates );

		/* Preview elements
		--------------------------------------------------------------------------*/
		self.$preview = $( '.usb-preview', self.$container );
		self.$iframe = $( 'iframe', self.$preview );
		self.$iframeWrapper = $( '.usb-preview-iframe-wrapper', self.$preview );

		/* Preview toolbar elements
		--------------------------------------------------------------------------*/
		self.$previewToolbar = $( '.usb-preview-toolbar', self.$preview );
		self.$toolbarResponsiveStates = $( '[data-responsive-state]', self.$previewToolbar );

		// The add information from `UserAgent` to bind styles to specific browsers or browser versions
		$( 'html' ).attr( 'data-useragent', $ush.ua );

		// Variables
		self._elmsFieldset = {};
		self._fieldsets = {}; // other fieldsets
		self._hotkeyStates = {}; // all hotkey states
		self.iframe = self.$iframe[/* first */0] || {};
		self.iframe.isLoad = false;
		self.pageData = $ush.clone( _default.pageData ); // Empty default data object

		/**
		 * Private temp data
		 * TODO: Move to $usbcore.cache
		 *
		 * @private
		 */
		self._$temp = {
			_latestShortcodeUpdates: {}, // Latest updated shortcode data (The cache provides correct data when multiple threads `debounce` or `throttle` are run)
			changesHistory: $ush.clone( _default.changesHistory ), // Data change history stack
			generatedIds: [], // List of generated IDs
			isActiveRecoveryTask: false, // This is a flag saying data recovery activity
			isFieldsetsLoaded: false, // This param will be True when fieldsets are loaded otherwise it will be False
			isInputCustomCss: false, // Flag for enter custom styles in the editor
			isProcessSave: false, // The AJAX process of save data on the backend
			savedPageData: $ush.clone( _default.pageData ), // Save the last saved page data
			transit: null, // Transit data
			xhr: {} // XMLHttpRequests
		};

		/**
		 * Private data object for import templates
		 * TODO: Move to $usbcore.cache
		 *
		 * @private
		 */
		self._$template = {
			$categorySections: {}, // list section categories
			transit: _document.querySelector( '.usb-template-transit' ), // get target for transition
			isTemplateLoaded: {}, // this param will be True when templates are loaded by category {id}:{status}. Example: `fn:true`
		};

		/**
		 * Public temp data
		 * TODO: Move to $usbcore.cache
		 *
		 * @private
		 */
		self._temp = {};

		/**
		 * @var {String} Default responsive state
		 */
		self.defaultResponsiveState = 'default';

		/**
		 * The main container that is the root of the current page
		 */
		self.mainContainer = 'container';

		/**
		 * The variable store the current mode
		 *
		 * @private
		 * @var {String} Builder mode: 'editor', 'preview', 'drag:add', 'drag:move'
		 */
		self._mode = self.isShowPanel()
			? 'editor'
			: 'preview';

		/**
		 * @var {String} Selected element (shortcode) usbid, e.g. 'us_btn:1'
		 */
		self.selectedElmId;

		/**
		 * @var {String} Active fieldset for an element
		 */
		self.activeElmFieldset = null;

		/**
		 * @var {Node} Active fieldset DOM element
		 */
		self.$activeElmFieldset = null;

		/**
		 * Load us-builder config
		 * Note: The object stores all received config from the backend,
		 * this is a single entry point for config
		 */
		self._config = $ush.clone( _default.config );
		if ( self.$container.is( '[onclick]' ) ) {
			self._config = $.extend( self._config, self.$container[0].onclick() || {} );
			self.$container.removeAttr( 'onclick' );
		}

		// This event is needed to get various data from the iframe
		_window.onmessage = $usbcore._onMessage.bind( self );

		/*
		 * When the user is trying to load another page, or reloads current page
		 * show a confirmation dialog when there are unsaved changes
		 */
		_window.onbeforeunload = function( e ) {
			if ( self.isPageChanged() ) {
				e.preventDefault();
				// The return string is needed for browser compat
				// See https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
				return self.getTextTranslation( 'page_leave_warning' );
			}
		};

		/**
		 * @private
		 * @var {{}} Bondable events
		 */
		self._events = {
			// Event handlers for fieldsets
			toggleTabs: self.$$fieldsets._toggleTabs.bind( self ) // specific location
		};

		// List of available events
		// TODO: Optimize and get rid of this list of events
		[
			// Global changes
			'contentChange',
			'modeChange',
			'shortcodeChanged',

			// Handlers for device toolbar
			'hideResponsiveToolbar',
			'switchResponsiveStates',

			// Handlers for panel
			'panelResetSearch',
			'panelSearchElms',
			'panelSwitch',
			'pastedSaveContent',
			'pastedСhangeContent',
			'saveChanges',
			'submitPreviewChanges',
			'toggleResponsiveMode',

			// Handlers for navigator
			'navigatorDuplicateElm',
			'navigatorExpand',
			'navigatorExpandAll',
			'navigatorRemoveElm',
			'navigatorScrollTo',
			'navigatorSelectedElm',
			'navigatorShowPreloader',
			'switchNavigator',

			// Handlers for data history
			'historyChanged',
			'redoChange',
			'undoChange',

			// Handlers for panel screens
			'panelShowImportContent',
			'showPageCustomCss',
			'showPageSettings',

			// Handlers for Drag & Drop
			'dragstart', // standard `dragstart` browser event handler
			'endDrag',
			'maybeDrag',
			'maybeStartDrag',
			'panelShowAddElms',

			// Handlers for fieldsets
			'afterHideField',
			'changeDesignField',
			'changeField',
			'changePageCustomCss',
			'changePageMeta',
			'changePageSettings',
			'syncFieldResponsiveState',

			// Handlers for templates tab
			'loadTemplatesConfig',
			'toggleTemplatesCategories',

			// Other handlers
			'closeNotification',
			'elmCopy',
			'elmDelete',
			'elmDuplicate',
			'elmLeave',
			'elmMove',
			'elmSelected',
			'iframeLoad',
			'setParamsForPageSettings',
			'keydown' // standard `keydown` browser event handler

		].map( function( event ) {
			if ( event && $.isFunction( self[ '_' + event ] ) ) {
				self._events[ event ] = self[ '_' + event ].bind( self );
			}
		} );

		// Subscription to private events
		// TODO: Optimize and get rid of these permissions
		[
			'contentChange',			// handler is triggered every time the html on the preview page has changed
			'elmCopy',					// handler of copy shortcode to clipboard
			'elmDelete',				// handler when delete element
			'elmDuplicate',				// handler when duplicate element
			'elmSelected',				// handler of select an element, and get an id
			'endDrag',					// completion handler is drag and drop in iframe
			'historyChanged', 			// handler for changes in data history
			'modeChange',				// watches mode change
			'navigatorScrollTo',		// handler for scroll to navigator item
			'navigatorShowPreloader',	// handler for show duplicate preloader
			'redoChange',				// recovery data handler from preview page (command|ctrl+v)
			'shortcodeChanged',			// event is called every time the shortcode is changed
			'undoChange'				// recovery data handler from preview page (command|ctrl+z)
		].map( function( method ) {
			if ( !! self._events[ method ] && $.isFunction( self._events[ method ] ) ) {
				self.on( method, self._events[ method ] );
			}
		} );

		// Events
		self.$iframe
			// Temporary - add highlight to first row
			.on( 'load', $ush.debounce( self._events.iframeLoad, 1 ) );

		self.$iframe // initialize load the iframe
			.attr( 'src', self.$iframe.data( 'src' ) || '' )
			.removeAttr( 'data-src' );

		self.$document
			// Reset drag start defaults
			.on( 'dragstart', self._events.dragstart )
			// Close notification handler
			.on( 'click', '.usb_action_notification_close', self._events.closeNotification )
			// Hide responsive states toolbar
			.on( 'click', '.usb_action_responsive_toolbar_hide', self._events.hideResponsiveToolbar )
			// Capture keyboard shortcuts
			.on( 'keydown', self._events.keydown );

		self.$previewToolbar
			// Handler for switch responsive states on the toolbar
			.on( 'click', '[data-responsive-state]', self._events.switchResponsiveStates );

		self.$panel
			// Toggles the USOF tabs of the settings panel
			.on( 'click', '.usof-tabs-item', self._events.toggleTabs )
			// Show/Hide panel
			.on( 'click', '.usb-panel-switcher', self._events.panelSwitch )
			// Show a list of elements to add
			.on( 'click', '.usb_action_elm_add', self._events.panelShowAddElms )
			// Show/Hide responsive mode
			.on( 'click', '.usb_action_toggle_responsive_mode', self._events.toggleResponsiveMode )
			// Save changes to the backend
			.on( 'click', '.usb_action_save_changes', self._events.saveChanges )
			// Search box character input handler
			.on( 'input', 'input[name=search]', $ush.debounce( self._events.panelSearchElms, 1 ) )
			// Handler for reset search in Panel
			.on( 'click', '.usb_action_panel_reset_search', self._events.panelResetSearch )
			// Show import content `Paste Row/Section`
			.on( 'click', '.usb_action_show_import_content', self._events.panelShowImportContent )
			// Handler for changes in the import content.
			.on( 'change input blur', '.usb-panel-import-content textarea', self._events.pastedСhangeContent )
			// Handler for save pasted content button.
			.on( 'click', '.usb_action_pasted_save_content', self._events.pastedSaveContent )
			// Handler for show custom css input for the page
			.on( 'click', '.usb_action_show_page_custom_css', self._events.showPageCustomCss )
			// Handler for show page settings.
			.on( 'click', '.usb_action_show_page_settings', self._events.showPageSettings )
			// Undo/Redo handlers
			.on( 'click', '.usb_action_undo', self._events.undoChange )
			.on( 'click', '.usb_action_redo', self._events.redoChange )
			// Handler for create revision and show a preview page
			.on( 'submit', 'form#wp-preview', self._events.submitPreviewChanges )
			// Handler for load and show a templates
			.on( 'click', '.usb-templates-loaded', self._events.loadTemplatesConfig )
			.on( 'click', '.usb-template-title', self._events.toggleTemplatesCategories )
			// Handler for switch navigator
			.on( 'click', '.usb_action_navigator_switch', self._events.switchNavigator );

		self.$navigator
			// Handler for hide the navigator
			.on( 'click', '.usb_action_navigator_hide', self.hideNavigator.bind( self ) )
			// Handler for open or close all containers in the navigator
			.on( 'click', '.usb_action_navigator_expand_all', self._events.navigatorExpandAll )
			// Handler for open or close container in the navigator
			.on( 'click', '.usb_action_navigator_expand', self._events.navigatorExpand )
			// Handler for selected element via navigator
			.on( 'click', '.usb-navigator-item-header', $ush.debounce( self._events.navigatorSelectedElm, 0.5 ) )
			// Handler for duplicate element via navigator
			.on( 'click', '.usb_action_navigator_duplicate_elm', self._events.navigatorDuplicateElm )
			// Handler for remove element via navigator
			.on( 'click', '.usb_action_navigator_remove_elm', self._events.navigatorRemoveElm );

		// Show the section "Add elements" (Default)
		self.panelShowAddElms();

		// Get navigator item template
		var $itemTemplate = $( '#usb-tmpl-navigator-item', self.$navigator );
		self._navigatorItemTemplate = $itemTemplate.html() || '';
		$itemTemplate.remove();

		// Set MacOS shortcuts
		if ( $ush.isMacOS ) {
			$( '[data-macos-shortcuts]', self.$container )
				.each( function( _, node ) {
					var $node = $( node );
					$node.text( $node.data( 'macos-shortcuts' ) );
				} );
		}
	};

	/**
	 * @var {USBuilder} Prototype USBuilder
	 */
	var $usbPrototype = USBuilder.prototype;

	/**
	 * Transports for send messages between windows or objects
	 */
	$.extend( $usbPrototype, $usbcore.mixins.events, {
		/**
		 * Send message to iframe
		 *
		 * @param {String} eventType A string contain event type
		 * @param {[]} extraParams Additional parameters to pass along to the event handler
		 * @chainable
		 */
		postMessage: function( eventType, extraParams ) {
			var self = this;
			if ( ! self.iframe.isLoad ) {
				return;
			}
			self.iframe.contentWindow.postMessage( JSON.stringify( [ /* namespace */'usb', eventType, extraParams ] ) );
		},

		/**
		 * Forward events through document
		 *
		 * @param {String} eventType A string contain event type
		 * @param {[]} extraParams Additional parameters to pass along to the event handler
		 * @chainable
		 */
		triggerDocument: function( eventType, extraParams ) {
			this.$document.trigger( /* namespace */'usb.' + eventType, extraParams );
		}
	});

	/**
	 * @private
	 * @type constants
	 * @var {{}} Types of notifications
	 */
	var _NOTIFY_TYPE_ = {
		ERROR: 'error',
		INFO: 'info',
		SUCCESS: 'success'
	};

	/**
	 * Functionality for implement notifications
	 */
	$.extend( $usbPrototype, {

		/**
		 * Show notify
		 *
		 * @param {String} message The message
		 * @param {String} type The type
		 *
		 * TODO: Add display multiple notifications as a list!
		 */
		notify: function( message, type ) {
			var self = this,
				// Time after which the notification will be remote
				autoCloseDelay = 4000, // 4 seconds
				// Get prototype
				$notification = self.$notifyPrototype
					.clone()
					.removeClass( 'hidden' );
			// Set notification type
			if ( !! type && $usbcore.indexOf( type, _NOTIFY_TYPE_ ) > -1 ) {
				$notification
					.addClass( 'type_' + type );
			}
			// If the notification type is not an error, then add a close timer
			if ( type !== _NOTIFY_TYPE_.ERROR ) {
				$notification
					.addClass( 'auto_close' )
					.data( 'handle', $ush.timeout( function() {
						$notification
							.find( '.usb_action_notification_close' )
							.trigger( 'click' );
					}, autoCloseDelay ) );
			}
			// Add message to notification
			$notification
				.find( 'span' )
				.html( '' + message );
			// Show notification
			self.$panel
				.append( $notification );
		},

		/**
		 * Close notification handler
		 *
		 * @private
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_closeNotification: function( e ) {
			var $notification = $( e.target ).closest( '.usb-notification' ),
				handle = $notification.data( 'handle' );
			if ( !! handle ) {
				$ush.clearTimeout( handle );
			}
			$notification
				.fadeOut( 'fast', function() {
					$notification.remove();
				} );
		},

		/**
		 * Closes all notification
		 */
		closeAllNotification: function() {
			var self = this;
			$( '.usb-notification', self.$body )
				.fadeOut( 'fast', function() {
					$( this ).remove();
				} );
		}
	} );

	/**
	 * Functional for implement responsive states
	 */
	$.extend( $usbPrototype, {

		/**
		 * Determines if show responsive toolbar
		 *
		 * @return {Boolean} True if show responsive toolbar, False otherwise
		 */
		isShowResponsiveToolbar: function() {
			return this.$preview.hasClass( 'responsive_mode' );
		},

		/**
		 * Hide responsive toolbar
		 *
		 * @private
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_hideResponsiveToolbar: function( e ) {
			var self = this;
			if ( ! self.isShowResponsiveToolbar() ) {
				return;
			}
			// Hide responsive toolbar
			self.toggleResponsiveToolbar( /* resposive state */false );
			// Set the preview state
			self.setResponsiveState(/* default */);
			// Forward events through document
			self.triggerDocument( 'syncResponsiveState' /* default */ );
		},

		/**
		 * Handler for switch responsive states on the toolbar
		 *
		 * @private
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_switchResponsiveStates: function( e ) {
			var self = this,
				responsiveState = $usbcore.$attr( e.target, 'data-responsive-state' );
			self.setResponsiveState( responsiveState );
			// Forward events through document
			self.triggerDocument( 'syncResponsiveState', responsiveState );
		},

		/**
		 * Show/Hide responsive toolbar
		 *
		 * @param {Boolean} mode The responsive state
		 */
		toggleResponsiveToolbar: function( state ) {
			var self = this;
			self.$preview
				.toggleClass( 'responsive_mode', state );
			self.$panelActionToggleResponsiveMode
				.toggleClass( 'active', state );
		},

		/**
		 * Set the preview responsive state
		 *
		 * @param {String} [responsiveState] responsive state (if you do not pass the parameter, the default type will be set)
		 */
		setResponsiveState: function( responsiveState ) {
			var self = this;

			// Check the correctness of the passed parameter
			if ( $.inArray( responsiveState, self.config( 'responsiveStates', [] ) ) === -1 ) {
				responsiveState = self.defaultResponsiveState;
			}

			// Check the changes
			if (
				! self.isShowResponsiveToolbar()
				&& self._$temp.currentResponsiveState === responsiveState
			) {
				return;
			}
			self._$temp.currentResponsiveState = responsiveState;

			// Highlight the current state
			self.$toolbarResponsiveStates
				.removeClass( 'active' )
				.filter( '[data-responsive-state="'+ responsiveState +'"]:first' )
				.addClass( 'active' );

			// Set the current mod
			self.$iframeWrapper
				.usMod( 'responsive_state',
					( responsiveState === self.defaultResponsiveState )
						? /* remove mod */false
						: responsiveState
				);

			// Apply max-width to the iframe
			self.$iframe
				.css( 'max-width', self.config( 'breakpoints.' + responsiveState + '.breakpoint', '100%' ) );
		},

		/**
		 * Get the current responsive state
		 *
		 * @return {String} responsive state slug
		 */
		getCurrentResponsiveState: function() {
			var self = this;
			return self._$temp.currentResponsiveState || self.defaultResponsiveState;
		}
	} );

	/**
	 * Functionality for handling private events
	 */
	$.extend( $usbPrototype, {

		/**
		 * Keyboard shortcut capture handler
		 * Note: When the developer panel is open, it keydown may not work due to focus outside the document
		 *
		 * @private
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_keydown: function( e ) {
			if ( e.type !== 'keydown' ) {
				return;
			}

			var self = this,
				// Define hotkey states
				isUndo = ( ( e.metaKey || e.ctrlKey ) && ! e.shiftKey && e.which === 90 ), // `(command|ctrl)+z` combination
				isRedo = ( ( e.metaKey || e.ctrlKey ) && e.shiftKey && e.which === 90 ); // `(command|ctrl)+shift+z` combination

			/**
			 * @var {{}} Define and save hotkey states
			 */
			self._hotkeyStates = {
				undo: isUndo,
				redo: isRedo
			};

			if ( isUndo ) {
				self.trigger( 'undoChange' );
			}
			if ( isRedo ) {
				self.trigger( 'redoChange' );
			}

			// Exclude events the context of which form elements
			if (
				( isUndo || isRedo )
				&& $.inArray( ( e.target.tagName || '' ).toLowerCase(), [ 'input', 'textarea' ] ) > -1
			) {
				e.preventDefault();
			}
		},

		/**
		 * The handler that is called every time the mode is changed
		 *
		 * @private
		 * @event handler
		 * @param {String} newMode
		 * @param {String} oldMode
		 */
		_modeChange: function( newMode, oldMode ) {
			this.postMessage( 'doAction', 'hideHighlight' ); // the hide all highlights
		},

		/**
		 * Handler when the select an element
		 *
		 * @private
		 * @event handler
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 */
		_elmSelected: function( id ) {
			var self = this;
			if (
				! self.isMode( 'editor' )
				|| ! self.doesElmExist( id )
			) {
				return;
			}

			// Set the active element in navigator
			self.navigatorSetActive( id, /* expand parents */true );

			if ( self.selectedElmId === id ) {
				return;
			}

			if ( self.doesElmExist( id ) ) {
				// Reset scroll after fieldset init
				self.one( 'afterInitFieldset', function() {
					self.$panelBody[0].scrollTo( /*x*/0, /*y*/0 );
				} );
				self.initElmFieldset( id ); // show fieldset for element
			} else {
				// The hide all highlights
				self.postMessage( 'doAction', 'hideHighlight' );
			}
		},

		/**
		 * Handler when the duplicate element
		 *
		 * @private
		 * @event handler
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 */
		_elmDuplicate: function( id ) {
			var self = this;
			if ( ! self.isValidId( id ) ) {
				return;
			}
			var // Determine the need to update include the parent
				isUpdateIncludeParent = self.isUpdateIncludeParent( id ),
				// Get parent ID
				parentId = self.getElmParentId( id ),
				// Get shortcode string
				strShortcode = self.getElmShortcode( id ) || '',
				newId; // new spare ID

			strShortcode = strShortcode
				// Remove all `el_id` from the design_options
				.replace( /(\s?el_id="([^\"]+)")/gi, '' )
				// Replace all ids
				.replace( /usbid="([^\"]+)"/gi, function( _, elmId ) {
					elmId = self.getSpareElmId( elmId );
					if ( ! newId ) {
						newId = elmId;
					}
					return 'usbid="'+ elmId +'"';
				} );

			if ( ! strShortcode || ! newId ) return;

			// Determine index for duplicate
			var index = 0,
				siblingsIds = self.getElmSiblingsId( id ) || [];
			for ( var i in siblingsIds ) {
				if ( siblingsIds[ i ] === id ) {
					index = ++i;
					break;
				}
			}

			// Added shortcode to content
			if ( ! self._addShortcodeToContent( parentId, index, strShortcode ) ) {
				return;
			}

			var // Position to add on the preview page
				position = 'after',
				isContainer = self.isElmContainer( id );

			// Add temporary loader
			self.postMessage( 'showPreloader', [ id, position, isContainer, /* preloader id */newId ] );

			// Get a rendered shortcode
			self._renderShortcode( /* request id */newId, {
				data: {
					content: isUpdateIncludeParent
						? self.getElmShortcode( parentId )
						: strShortcode
				},
				success: function( res ) {
					// Remove temporary loader
					self.postMessage( 'hidePreloader', newId );
					if ( ! res.success ) {
						return;
					}
					var html = '' + res.data.html;
					// Show all elements that have animations
					html = html.replace( /(us_animate_this)/g, "$1 start" );

					// Add new shortcde to preview page
					if ( isUpdateIncludeParent ) {
						self.postMessage( 'updateSelectedElm', [ parentId, html ] );
					} else {
						self.postMessage( 'insertElm', [ id, position, html ] );
						// Init its JS if needed
						self.postMessage( 'maybeInitElmJS', newId );
					}

					// Commit to save changes to history
					self.commitChangeToHistory( newId, _CHANGED_ACTION_.CREATE );

					// Send a signal to add a duplicate
					self.trigger( 'contentChange' );
				},
				abort: function( abortId ) {
					self.postMessage( 'hidePreloader', abortId );
				}
			} );
		},

		/**
		 * Handler for copy shortcode to clipboard
		 *
		 * @private
		 * @event handler
		 * @param {String} id Shortcode's usbid, e.g. "vc_row:1"
		 */
		_elmCopy: function( id ) {
			var self = this;
			if ( ! self.isValidId( id ) ) {
				return;
			}
			// Copy row shortcode to clipboard
			$usbcore.copyTextToClipboard( self.getElmShortcode( id ) );
		},

		/**
		 * Handler when the delete element
		 *
		 * @private
		 * @event handler
		 * @param {String} removeId Shortcode's usbid, e.g. "us_btn:1"
		 */
		_elmDelete: function( removeId ) {
			var self = this;
			if ( ! self.isValidId( removeId ) ) {
				return;
			}

			// The check if this is the last column then delete the parent row*
			if (
				self.isChildElmContainer( removeId )
				&& self.getElmSiblingsId( removeId ).length === 1
			) {
				removeId = self.getElmParentId( removeId );
			}

			// Remove the element
			self.removeElm( removeId );
		},

		/**
		 * Loads a preview
		 *
		 * @private
		 * @event handler
		 */
		_iframeLoad: function() {
			var self = this;
			self.iframe.isLoad = true;
			if ( ! self.iframe.contentDocument ) {
				return;
			}

			// Remove reboot class if installed
			if ( self.$iframe.hasClass('reboot') ) {
				self.$iframe.removeClass( 'reboot' );
			}

			// Get iframe window
			var iframeWindow = self.iframe.contentWindow;

			// If meta parameters are set for preview we ignore data save
			if ( ( iframeWindow.location.search || '' ).indexOf( '&meta' ) !== -1 ) {
				return;
			}

			// The hide all highlights
			self.postMessage( 'doAction', 'hideHighlight' );

			/**
			 * Note: The data is unrelated because the preview can be reloaded to show the changes
			 * @var {{}} Import data and save the current and last saved object
			 */
			self.pageData = $ush.clone( ( iframeWindow.$usbdata || {} ).pageData || {}, _default.pageData );
			self._$temp.savedPageData = $ush.clone( self.pageData );

			// After load iframe connect the navigator
			if ( ! self.isEmptyContent() ) {
				self.$navigatorActionSwitch.removeClass( 'disabled' );
			}

			// Check if there is a css set the label
			if ( !! self.pageData.customCss ) {
				self.$panelActionPageCustomCss
					.addClass( 'css_not_empty' );
			}

			// Load all deferred fieldsets
			$ush.timeout( self._loadDeferredFieldsets.bind( self ), 100 );

			// Event after load the frame and all data
			self.trigger( 'iframeLoaded' );
		},

		/**
		 * Reload preview page
		 * Note: The code is moved to a separate function since `debounced` must be initialized before call
		 *
		 * @private
		 * @type debounced
		 */
		__iframeReload: $ush.debounce( function() {
			var self = this;
			self.$iframe.addClass( 'reboot' );
			self.iframe.src = self.config( 'previewUrl', '' ) + '&' + $.param( { meta: self.pageData.pageMeta || {} } );
		}, 1 ),

		/**
		 * Handler when content changes on the preview page
		 * Note: All handler calls must be after change `$usb.pageData.content`!
		 *
		 * @private
		 * @event handler
		 */
		_contentChange: function() {
			var self = this;

			// The Disabled/Enable save button
			var isPageChanged = self.isPageChanged();
			self.$panelActionSaveChanges
				.toggleClass( 'disabled', ! isPageChanged )
				.prop( 'disabled', ! isPageChanged );

			// The Disabled/Enable switch navigation button
			var isEmptyContent = self.isEmptyContent();
			if ( isEmptyContent ) {
				self.hideNavigator(); // hide the navigator
			}
			self.$navigatorActionSwitch
				.toggleClass( 'disabled', isEmptyContent );

			// Redraw the element tree in navigator
			if ( ! isEmptyContent && self.isShowNavigator() ) {
				$ush.debounce_fn_1ms( self.redrawNavigator.bind( self ) );
			}
		},

		/**
		 * Handler for changed in shortcode
		 *
		 * @param {{}} data The updated data
		 * @event handler
		 */
		_shortcodeChanged: function( data ) {
			if ( ! $.isPlainObject( data ) ) {
				return;
			}
			var self = this;
			// Reactive update of the id attribute display in the navigator
			if ( self.isShowNavigator() && data.name === 'el_id' ) {
				if ( data.value ) {
					data.value = '#' + data.value;
				}
				$( '[data-for="' + data.id + '"] .for_attr_id:first', self.$navigatorBody )
					.text( data.value );
			}
		},

		/**
		 * This handler is called every time the column|column_inner in change
		 *
		 * @private
		 * @param {String} rootContainerId The root container id
		 */
		_vcColumnChange: function( rootContainerId ) {
			// TODO: Here add an algorithm for calculate the width of the columns and
			// save the sizes in the shortcode settings and transfer to the
			// render handler

			// The handler is called every time the column/column_inner in change
			this.postMessage( 'vcColumnChange', /* row|row_inner id */rootContainerId );
		},

		/**
		 * Deferred execution function after a specified time
		 *
		 * @private
		 * @type debounced
		 */
		__debounce_2s: $ush.debounce( $ush.fn, 2000/* 2sec */ ),

		/**
		 * Handler for сhange in custom css
		 *
		 * @private
		 * @event handler
		 * @param {$usof.field} usofField
		 * @param {String} pageCustomCss This is the actual value for any change
		 */
		_changePageCustomCss: function( usofField, pageCustomCss ) {
			var self = this;
			// If Undo or Redo is used then we will cancel the execution
			// of the logic, since the built-in history will be used
			if ( self.hotkeys( 'undo', /* or */ 'redo' ) ) {
				return;
			}

			/**
			 * @var {{}} Reference to a temporary object
			 */
			var temp = self._$temp,
				/**
				 * @param {String} customCss Page Custom CSS.
				 * @param {{}} originalTask This is a link to an object in history that can be modified.
				 * @var {Function} Set custom styles to the builder and preview
				 */
				setPageCustomCss = function( customCss, originalTask ) {
					if (
						$.type( customCss ) !== 'string'
						|| self.pageData.customCss == customCss
					) {
						return;
					}

					// Style updates to editors and history when restore data from history
					if ( self.isActiveRecoveryTask() && $.isPlainObject( originalTask ) ) {
						self._fieldsets.pageCustomCss.setValue( customCss );
						originalTask.data = '' + self.pageData.customCss;
					}

					// Update page custom css.
					self.pageData.customCss = customCss;
					// Update styles on the preview page
					self.postMessage( 'updatePageCustomCss', customCss );
					// Send a signal to update element field
					self.__contentChange.call( self );
					// Check if there is a css set the label
					self.$panelActionPageCustomCss
						.toggleClass( 'css_not_empty', !! customCss );
				};

			// Save the state before the update
			if ( ! temp.isInputCustomCss ) {
				self.commitDataToHistory( self.pageData.customCss, setPageCustomCss );
				temp.isInputCustomCss = true;
			} else {
				// Reset custom styles input flag after input is complete
				self.__debounce_2s( function() {
					temp.isInputCustomCss = false;
				} );
			}

			// Set custom styles to the builder and preview
			setPageCustomCss( pageCustomCss );
		},

		/**
		 * Handler for сhange in custom css
		 *
		 * @private
		 * @event handler
		 * @param {$usof.field} field
		 * @param {Mixed} value
		 */
		_changePageSettings: function( field, value ) {
			if ( ! ( field instanceof $usof.field ) ) {
				return;
			}
			var self = this,
				name = field.name;
			// Update page field
			self.pageData.fields[ name ] = value;
			if ( name === 'post_title' ) {
				// Update the title of the builder page
				_document.title = self.config( 'adminPageTitleMask', value ).replace( '%s', value );
				// Update all title on the preview page
				self.postMessage( 'updateElmContent', [ /* selectors */'.post_title,head > title', value, /* method */'text' ] );
			}
			// Send a signal to update element field
			self.__contentChange.call( self );
		},

		/**
		 * Handler for сhange in page meta data
		 * Note: The second parameter in the method is passed a value, but this may differ
		 * from ` arguments[1] !== usofField.getValue()` by data type. Example: `1,2` !== [1,2]
		 *
		 * @private
		 * @event handler
		 * @param {$usof.field} usofField
		 */
		_changePageMeta: function( usofField ) {
			if ( ! ( usofField instanceof $usof.field ) ) {
				return;
			}

			var self = this,
				name = usofField.name, // get field name
				value = usofField.getValue();

			// Check the parameter changes
			if ( self.pageData.pageMeta[ name ] === value ) {
				return;
			}

			// Update the value for the name
			self.pageData.pageMeta[ name ] = value;

			// Reload Preview Page (Data change check happens inside the method)
			if ( !! usofField.$row.data( 'usb-preview' ) ) {
				// Reload the page after save
				self._$temp.isReloadPreviewAfterSave = true;
				self.__iframeReload();
			}

			// Send a signal to update element field
			self.__contentChange.call( self );
		}
	});

	/**
	 * Functionality for add new elements via Drag & Drop
	 */
	$.extend( $usbPrototype, {

		// The number of pixels when drag after which the movement will be initialized
		_dragStartDistance: 5, // the recommended value of 3, which will be optimal for all browsers, was found out after tests

		/**
		 * Show the section "Add elements"
		 *
		 */
		panelShowAddElms: function() {
			var self = this,
				$actionElmAdd = self.$panelActionElmAdd;
			if ( $actionElmAdd.hasClass( 'active' ) ) {
				return;
			}

			self.clearPanel(); // hide all sections
			self.navigatorResetActive(); // reset an active element in navigator
			self.postMessage( 'doAction', 'hideHighlight' );

			// Set focus to search field
			// Note: Focus does not work when the developer console is open!
			$ush.timeout( function() {
				self.$panelSearchField
					.focus();
			}, 1 );

			// Get add button
			$actionElmAdd // set active class to add button
				.addClass( 'active' );
			self.$panelAddItemsTabs // show all list elements
				.removeClass('hidden');

			// Set the panel header title
			self.setPanelTitle( /* get action title */$actionElmAdd.attr( 'title' ) );
			self.$document
				// Track events for Drag & Drop
				.on( 'mousedown', self._events.maybeStartDrag )
				.on( 'mousemove', self._events.maybeDrag )
				.on( 'mouseup', self._events.endDrag );
			// Reset all data by default for more reliable operation
			self.setTemp( 'drag', {
				startX: 0, // x-axis start position
				startY: 0 // y-axis start position
			} );
		},

		/**
		 * Alias for `self._events`
		 *
		 * @event handler
		 */
		_panelShowAddElms: function() {
			var self = this;
			self.panelShowAddElms.call( self );
		},

		/**
		 * Hide the section "Add elements"
		 *
		 * @private
		 */
		_hidePanelAddElms: function() {
			var self = this;
			self.$panelActionElmAdd // remove active class from button
				.removeClass( 'active' );
			self.$panelAddItemsTabs // hide all elements
				.addClass('hidden');
			self.$document
				// Remove events
				.off( 'mousedown', self._events.maybeStartDrag )
				.off( 'mousemove', self._events.maybeDrag )
				.off( 'mouseup', self._events.endDrag );
			// Flush all data for drag
			self.flushTemp( 'drag' );
		},

		/**
		 * Get a new unique id for an element
		 *
		 * @return {String} The unique id e.g. "us_btn:1"
		 */
		getNewElmId: function() {
			return ( this.getTemp( 'drag' ) || {} )[ 'newElmId' ] || '';
		},

		/**
		 * Get the event data for send iframe
		 *
		 * @private
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 * @return {{}} The event data
		 */
		_getEventData: function( e ) {
			var self = this;
			if ( ! self.iframe.isLoad ) {
				return;
			}
			// Get data on the coordinates of the mouse for iframe and relative to this iframe
			var rect = $usbcore.$rect( self.iframe ),
				iframeWindow = self.iframe.contentWindow,
				data = {
					clientX: e.clientX,
					clientY: e.clientY,
					eventX: e.pageX - rect.x,
					eventY: e.pageY - rect.y,
					pageX: ( e.pageX + iframeWindow.scrollX ) - rect.x,
					pageY: ( e.pageY + iframeWindow.scrollY ) - rect.y,
				};
			// Additional check of values for errors
			for ( var prop in data ) {
				var value = data[ prop ] || NaN;
				if ( isNaN( value ) || value < 0 ) {
					data[ prop ] = 0;
				} else {
					data[ prop ] = ceil( data[ prop ] );
				}
			}
			return data;
		},

		/**
		 * Determines if parent drag
		 *
		 * @return {Boolean} True if drag, False otherwise
		 */
		isParentDragging: function() {
			return !! this._$temp.isParentDragging;
		},

		/**
		 * Show the transit
		 *
		 * @param {String} type The type element
		 */
		showTransit: function( type ) {
			var self = this;
			if ( ! type ) {
				return;
			}

			// The destroy an object if it is set
			if ( self.hasTransit() ) {
				self.hideTransit();
			}

			// If type is an `id` then we get from `id` type
			if ( self.isValidId( type ) ) {
				type = self.getElmType( type );
			}

			// Get a node by attribute type
			var target = _document.querySelector( '[data-type="'+ type +'"]' );

			// Show templates transit for get rect
			if ( self.isTemplateImport( type ) ) {
				target = self._$template.transit;
				self._showTemplatesTransit();
			}

			if ( ! $usbcore.isNode( target ) ) {
				return;
			}

			// Object with intermediate data for transit
			var transit = {
				rect: $usbcore.$rect( target ),
				scrollAcceleration: 0, // scroll acceleration while drag
				scrollDirection: _undefined, // scroll directions while drag
				target: target.cloneNode( /* deep */true ) // copy of target to transit
			};

			$usbcore // Remove class `hidden` if element is hidden
				.$removeClass( transit.target, 'hidden' );

			// Hide templates transit
			self._hideTemplatesTransit();

			// Set the height and width of the transit element
			[ 'width', 'height' ].map( function( prop ) {
				var value = ceil( transit.rect[ prop ] );
				transit.target.style[ prop ] = value
					? value + 'px'
					: 'auto';
			} );

			$usbcore // Add a css class to apply basic styles
				.$addClass( transit.target, 'elm_transit' )
				.$addClass( transit.target, ! self.isMode( 'drag:add' ) ? 'mode_drag_move' : '' );

			// Add transit element to document
			_document.body.append( transit.target );

			// Save transit to _$temp
			self._$temp.transit = transit;
		},

		/**
		 * Determines if transit
		 *
		 * @return {Boolean} True if transit, False otherwise
		 */
		hasTransit: function() {
			return !! this._$temp.transit;
		},

		/**
		 * Determines if drag scroll
		 *
		 * @return {Boolean} True if drag scroll, False otherwise
		 */
		hasDragScrolling: function() {
			return $usbcore.indexOf( ( this._$temp.transit || {} ).scrollDirection, [ _DIRECTION_.TOP, _DIRECTION_.BOTTOM ] ) > -1;
		},

		/**
		 * Set the transit position
		 * Note: The method is called many times, so performance is important here!
		 *
		 * @param {Number} pageX The event.pageX
		 * @param {Number} pageY The event.pageY
		 */
		setTransitPosition: function( pageX, pageY ) {
			var self = this;
			if (
				! self.hasTransit()
				|| ! self.isMode( 'drag:add', 'drag:move' )
			) {
				return;
			}
			var transit = self._$temp.transit || {};
			if ( ! $usbcore.isNode( transit.target ) ) {
				return;
			}

			// Get indents to transit center
			var isDragAdd = self.isMode( 'drag:add' ),
				transitHeight = transit.rect.height,
				transitTop = $ush.parseInt( isDragAdd ? pageY - ( transitHeight / 2 ) : pageY ),
				transitLeft = $ush.parseInt( isDragAdd ? pageX - ( transit.rect.width / 2 ) : pageX );

			// Set transit center in under cursor
			transit.target.style.top = transitTop.toFixed( 3 ) + 'px';
			transit.target.style.left = transitLeft.toFixed( 3 ) + 'px';

			if ( ! self.iframe.isLoad ) {
				return;
			}

			// Control auto-scroll preview when drag
			var remainderToEnd = 0, // Remainder to scroll end point (up|down)
				scrollDirection, // No value does not start animation
				viewportBottom = $ush.parseInt( _window.innerHeight - transitHeight );

			// Get direction to scroll preview
			if ( pageY < transitHeight ) {
				remainderToEnd = abs( pageY - transitHeight );
				scrollDirection = _DIRECTION_.TOP;

			} else if ( pageY > viewportBottom ) {
				remainderToEnd = abs( pageY - viewportBottom );
				scrollDirection = _DIRECTION_.BOTTOM;
			}

			// Note: After pass every `step` pixels, the speed will increase by x1 ( speed / scrollAcceleration )
			var scrollAcceleration = ceil( abs( remainderToEnd / /* acceleration step in px */30 ) );

			// Transit data updates and scroll control
			if (
				scrollDirection !== transit.scrollDirection
				|| scrollAcceleration !== transit.scrollAcceleration
			) {
				transit.scrollDirection = scrollDirection;
				transit.scrollAcceleration = scrollAcceleration;
				self.postMessage( 'doAction', [
					/* method */'_scrollDragging',
					/* params */[ scrollDirection, scrollAcceleration ]
				] );
			}
		},

		/**
		 * Hide the transit
		 */
		hideTransit: function() {
			var self = this,
				transit = self._$temp.transit || {};
			if (
				! self.hasTransit()
				|| ! $usbcore.isNode( transit.target )
			) {
				return;
			}
			self.stopDragScrolling(); // stop a drag scroll
			$usbcore.$remove( transit.target );
			delete self._$temp.transit;
		},

		/**
		 * Determines the start of move elements
		 * This should be a single method to determine if something needs to be moved or not
		 *
		 * @private
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_maybeStartDrag: function( e ) {
			var self = this;
			// If there is no target, then terminate the method
			if ( ! self.iframe.isLoad || ! e.target ) {
				return;
			}
			var found,
				iteration = 0,
				target = e.target;
			// The check if the goal is a new element
			while ( ! ( found = !! $usbcore.$attr( target, 'data-type' ) ) && iteration++ < /*max number of iterations*/100 ) {
				if ( ! target.parentNode ) {
					found = false;
					break;
				}
				target = target.parentNode;
			}
			// If it was possible to determine the element, then we will save all the data into a temporary variable
			if ( found ) {
				// Set temp data
				self.setTemp( 'drag', {
					startDrag: true,
					startX: e.pageX || 0,
					startY: e.pageY || 0,
					target: target,
				} );
			}
		},

		/**
		 * Note: The method is called many times, so performance is important here!
		 *
		 * @private
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_maybeDrag: function( e ) {
			var self = this,
				temp = self.getTemp( 'drag' );
			if ( ! temp.startDrag || ! temp.target ) {
				return;
			}

			// Get offsets from origin along axis X and Y
			var diffX = abs( temp.startX - e.pageX ),
				diffY = abs( temp.startY - e.pageY );

			// The check the distance of the mouse drag and if it is more than
			// the specified one, then activate all the necessary methods
			if ( diffX > self._dragStartDistance || diffY > self._dragStartDistance ) {
				if ( self.isMode( 'editor' ) ) {

					// Flush active move data
					$usbcore.cache( 'dragProcessData' ).flush();

					// Set state parent drag
					self._$temp.isParentDragging = true;
					// Select mode of add elements
					self.setMode( 'drag:add' );
					// Get target type
					var tempTargetType = $usbcore.$attr( temp.target, 'data-type' );
					// Get new element ID ( Save to `temp` is required for `self.getNewElmId()` )
					temp.newElmId = self.getSpareElmId( tempTargetType );
					// Show the transit
					self.showTransit( tempTargetType, e.pageX, e.pageY );
					// Add helpers classes for visual control
					$usbcore
						.$addClass( temp.target, 'elm_add_shadow' )
						.$addClass( _document.body, 'elm_add_draging' );
				}
				// Firefox blocks events between current page and iframe so will use `onParentEventData`
				// Other browsers in iframe intercepts events
				if ( $ush.isFirefox && self.isParentDragging() ) {
					var eventData = self._getEventData( e );
					if ( eventData.pageX ) {
						self.postMessage( 'onParentEventData', [ '_maybeDrop', eventData ] );
					}
				}

				// Set the transit element position
				self.setTransitPosition( e.pageX, e.pageY );
			}
		},

		/**
		 * End a drag
		 *
		 * @private
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_endDrag: function( e ) {
			var self = this;
			if ( ! self.iframe.isLoad ) {
				return;
			}

			// Get temp data
			var temp = self.getTemp( 'drag' );

			// Remove classes
			if ( $usbcore.isNode( temp.target ) ) {
				$usbcore
					.$removeClass( temp.target, 'elm_add_shadow' )
					.$removeClass( _document.body, 'elm_add_draging' );
			}

			// Case relevant only for FF when a new element has been dropped above
			// the panel and should not be added to the page
			if (
				self.isShowPanel()
				&& $ush.isFirefox
				&& self.getCurrentPreviewOffset().x >= e.clientX
			) {
				// Clear all asset and temp data to drag:add
				self._clearDragAssets();
				return;
			}

			// Check is parent drag
			if ( ! self.isParentDragging() ) {
				self.flushTemp( 'drag' );
				return;
			}

			// Create the new element
			if ( !! temp.parentId && !! temp.currentId ) {
				var currentIndex = $ush.parseInt( temp.currentIndex );

				// Get base parentId without alias
				if ( self.isAliasElmId( temp.parentId ) ) {
					temp.parentId = self.removeAliasFromId( temp.parentId );
				}

				// If the target has a template id, then continue processing as a template
				var templateId = $usbcore.$attr( temp.target, 'data-template-id' );
				if ( templateId ) {
					var templateCategoryId = $( temp.target )
						.closest( '.usb-template' )
						.data( 'template-category-id' );

					// Insert template in content and preview
					self.insertTemplate( templateCategoryId, templateId, temp.parentId, currentIndex );

				} else {
					// Create and add a new element
					self.createElm( self.getElmType( temp.currentId ), temp.parentId, currentIndex );
				}

				// If the final container is a TTA section then open this section
				if ( self.isElmSection( temp.parentId ) ) {
					self.postMessage( 'doAction', [ 'openSectionById', temp.parentId ] );
				}
			}

			// Firefox blocks events between current page and frame so will use onParentEventData
			// Other browsers in iframe intercepts events
			if ( $ush.isFirefox ) {
				self.postMessage( 'onParentEventData', '_endDrag' );
			}

			// Clear all asset and temp data to drag:add
			self._clearDragAssets();
		},

		/**
		 * Clear all asset and temp data to `drag:add`
		 *
		 * @private
		 */
		_clearDragAssets: function() {
			var self = this;
			self.hideTransit();
			self._$temp.isParentDragging = false;
			self.flushTemp( 'drag' );
			self.setMode( 'editor' );
			// Clear all asset and temporary data to move
			self.postMessage( 'doAction', 'clearDragAssets' );
		},

		/**
		 * Remove a drag scroll data
		 */
		removeDragScrollData: function() {
			delete ( this._$temp.transit || {} ).scrollDirection;
		},

		/**
		 * Stop a drag scroll
		 */
		stopDragScrolling: function() {
			var self = this,
				transit = self._$temp.transit || {};
			if ( ! self.hasDragScrolling() ) {
				return;
			}
			self.removeDragScrollData(); // remove a drag scroll data
			self.postMessage( 'doAction', '_scrollDragging' );
		},

		/**
		 * Standard `dragstart` browser event handler
		 *
		 * @private
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM.
		 * @return {Boolean} If the event occurs in context `MediaFrame`, then we will enable it, otherwise we will disable it
		 */
		_dragstart: function( e ) {
			return !! $( e.target ).closest( '.media-frame' ).length;
		}
	} );

	/**
	 * Functionality for the implementation of the Panel
	 */
	$.extend( $usbPrototype, {

		/**
		 * Hide all sections in main panel
		 */
		clearPanel: function() {
			var self = this;
			self._destroyElmFieldset(); // destroy a set of fields for an element
			self._hidePanelAddElms(); // hide the section "Add elements"
			self._hidePanelImportContent(); // hide the import content (Paste Row/Section)
			self._hidePanelMessages(); // hide the section "Messages"
			self._hidePanelPageCustomCss(); // hide the panel page custom css
			self._hidePanelPageSettings(); // hide the panel page settings
		},

		/**
		 * Determines if show main panel
		 *
		 * @return {Boolean} True if show panel, False otherwise
		 */
		isShowPanel: function() {
			return ! this.$body.hasClass( 'hide_sidebars' )
		},

		/**
		 * Set the panel header title
		 *
		 * @param {String} title The title
		 */
		setPanelTitle: function ( title ) {
			this.$panelTitle.html( '' + title );
		},

		/**
		 * Get the current preview iframe offset
		 *
		 * @return {{}} Returns the offset along the X and Y axes
		 */
		getCurrentPreviewOffset: function() {
			var rect = $usbcore.$rect( this.iframe );
			return {
				y: rect.y || 0,
				x: rect.x || 0
			};
		},

		/**
		 * Send setResponsiveState event to main document
		 * Note: The code is moved to a separate function since `debounced` must be initialized before call
		 *
		 * @private
		 * @type debounced
		 */
		__setResponsiveState: $ush.debounce( function() {
			var self = this;
			self.triggerDocument.call( self, 'syncResponsiveState', self.getCurrentResponsiveState() );
		}, 100 ),

		/**
		 * Load all deferred field sets or specified by name
		 *
		 * @private
		 * @param {String} name The fieldset name
		 */
		_loadDeferredFieldsets: function( name ) {
			var self = this;

			self.$panel
				.addClass( 'data_loading' );

			var // Data to send the request
				data = {},
				// AJAX request ID
				requestId = 'loadDeferredFieldsets';

			// Add a name to the data object for the request and change the name
			// for the request ID to ensure that data is received asynchronously
			if ( ! $ush.isUndefined( name ) ) {
				data.name = name;
				requestId += '.name';
				self.$panel
					.addClass( 'waiting_mode' );
			}

			// Load the element and initialize it
			self.ajax( /* request id */requestId, {
				data: $.extend( data, {
					_nonce: self.config( '_nonce' ),
					action: self.config( 'action_get_deferred_fieldsets' ),
				} ),
				success: function( res ) {
					if ( ! res.success ) {
						return;
					}
					var fieldsets = $.isPlainObject( res.data )
						? res.data
						: {};

					for ( var name in fieldsets ) {
						if ( !! self._elmsFieldset[ name ] ) {
							continue;
						}
						self._elmsFieldset[ name ] = fieldsets[ name ];
						self.trigger( 'fieldsetLoaded', [ name ] ); // send a signal about the load of fieldsets
					}

					/*
					 * `data_loading` - Background data load
					 * `waiting_mode` - Fieldset load pending
					 */
					var removeClasses = 'data_loading';
					if ( ! data.name ) {
						self._$temp.isFieldsetsLoaded = true; // load all fieldsets
						removeClasses += ' waiting_mode';
					} else {
						removeClasses = ' waiting_mode';
					}
					self.$panel
						.removeClass( removeClasses );
				}
			} );
		},

		/**
		 * Initializes the elm fieldset
		 *
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 * @param {Function} callback Callback function that will be called after load the fieldset
		 */
		initElmFieldset: function( id, callback ) {
			var self = this;
			if ( ! self.doesElmExist( id ) ) {
				return;
			}

			// Get element name
			var name = self.getElmName( id ),
				elmsSupported = self.config( 'elms_supported', /* default */[] ),
				elmTitle = self.config( 'elm_titles.' + name, /* default */name ); // get element title

			// If there is no title, then the element does not support editing with the Live Builder
			if (
				! $.isArray( elmsSupported )
				|| $usbcore.indexOf( name, elmsSupported ) < 0
			) {
				// Set shortcode title to header title
				self.setPanelTitle( elmTitle );
				// Display message on panel
				self.showMainPanelMessage( self.getTextTranslation( 'editing_not_supported' ) );
				// Set the active item in navigator
				self.navigatorSetActive( id, /* expand parent */true );
				// Show highlight for editable element
				self.postMessage( 'doAction', [ 'showEditableHighlight', id ] );
				return;
			}

			// Trying to get a fieldset from a document
			if ( ! self._elmsFieldset[ name ] ) {
				$( '#usb-tmpl-fieldsets .usb-panel-fieldset[data-name]', self.$panel )
					.each( function( _, node ) {
						self._elmsFieldset[ $( node ).data( 'name' ) ] = node.outerHTML;
					} )
					.remove();
			}

			// If the fieldsets have not been loaded yet, wait for the load and then show the fieldset
			if ( ! self._elmsFieldset[ name ] && ! self._$temp.isFieldsetsLoaded ) {
				self.setPanelTitle( elmTitle );
				self // Watches the load of fieldsets
					.one( 'fieldsetLoaded', function( loadedName ) {
						if ( name !== loadedName ) return;
						self._showElmFieldset( id );
					} );
				// Load a set outside the general stream
				self._loadDeferredFieldsets( name );
				return;
			}

			self._showElmFieldset( id ); // show panel edit settings for shortcode
		},

		/**
		 * Show panel edit settings for shortcode
		 *
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 */
		_showElmFieldset: function( id ) {
			var self = this;
			if ( ! self.doesElmExist( id ) ) {
				return;
			}

			// Get element name and values for it
			var name = self.getElmName( id ),
				values = self.getElmValues( id ) || {};

			if ( ! name ) {
				return;
			}

			// Remove the `waiting_mode` class if any
			if ( self.$panel.hasClass( 'waiting_mode' ) ) {
				self.$panel
					.removeClass( 'waiting_mode' );
			}

			self.clearPanel(); // hide all sections

			// Load assets required to initialize the code editor
			if ( self.config( 'dynamicFieldsetAssets.codeEditor', [] ).indexOf( name ) > -1 ) {
				self._loadAssetsForCodeEditor();
			}

			// Set value to variables
			self.selectedElmId = id;
			self.$activeElmFieldset = $( self._elmsFieldset[ name ] );
			self.$panelBody.prepend( self.$activeElmFieldset );
			self.activeElmFieldset = new $usof.GroupParams( self.$activeElmFieldset );

			// Set shortcode title to header title
			self.setPanelTitle( self.getElmTitle( id ) );

			// Set value to fieldsets
			self.$activeElmFieldset.addClass( 'inited usof-container' );
			self.activeElmFieldset.setValues( values, /* quiet mode */true );

			// Forward events through document on item selection
			if ( self.isShowResponsiveToolbar() ) {
				self.__setResponsiveState();
			}

			// Initialization check and watch on field events
			// Note: The id is passed explicitly as a parameter because the callback function can be
			// called with a delay, especially when selecting elements quickly `.bind( self, id )`
			for ( var fieldId in self.activeElmFieldset.fields ) {
				var field = self.activeElmFieldset.fields[ fieldId ];
				field
					.on( 'change', self._events.changeField.bind( self, id ) )
					.on( 'afterHide', self._events.afterHideField )
					// The event only exists in the `design_options`
					.on( 'changeDesignField', self._events.changeDesignField.bind( self, id ) )
					// Responsive state sync event
					.on( 'syncResponsiveState', self._events.syncFieldResponsiveState )
					// Delegate an event from the TinyMCE to a built-in handler (keydown comes from the TinyMCE iframe)
					.on( 'tinyMCE.Keydown', function( /* usofField */_, /* event */e ) {
						self._events.keydown( e );
					} );
			}

			// Initialization check and watch on group events
			for ( var groupName in ( self.activeElmFieldset.groups || {} ) ) {
				self.activeElmFieldset.groups[ groupName ]
				// TODO: There shouldn't be a debounce here, you need to check all events and remove it
				.on( 'change', $ush.debounce( self._events.changeField.bind( self, id ), 1 ) );
			}

			// Adds tabs data
			if ( self.activeElmFieldset.isGroupParams ) {
				self.activeElmFieldset.$tabsItems = $( '.usof-tabs-item', self.$activeElmFieldset );
				self.activeElmFieldset.$tabsSections = $( '.usof-tabs-section', self.$activeElmFieldset );
				// Run the method to check for visible fields and control the show of tabs
				self.$$fieldsets.autoShowingTabs.call( self );
			}

			self.trigger( 'afterInitFieldset' ); // trigger of the completed fieldset

			// Show highlight for editable element
			self.postMessage( 'doAction', [ 'showEditableHighlight', id ] );
		},

		/**
		 * Destroy a set of fields for an element
		 *
		 * @private
		 */
		_destroyElmFieldset: function() {
			var self = this;
			if ( ! self.activeElmFieldset ) {
				return;
			}
			// Remove a node
			if ( self.$activeElmFieldset instanceof $ ) {
				self.$activeElmFieldset.remove();
			}
			// Remove all handlers
			self.$document.off( 'usb.syncResponsiveState' );
			// Hide highlight for editable element
			self.postMessage( 'doAction', 'hideEditableHighlight' );
			// Destroy all data
			self.selectedElmId = null;
			self.activeElmFieldset = null;
			self.$activeElmFieldset = null;
		},

		/**
		 * Normalization of instructions
		 * Note: `instructions = true` - force an ajax request to get the element code
		 *
		 * @private
		 * @param {Mixed} instructions Instructions for preview elements
		 * @return {Mixed}
		 */
		_normalizeInstructions: function( instructions ) {
			// The convert to an array of instructions
			if ( !! instructions && ! $.isArray( instructions ) && instructions !== true ) {
				instructions = $.isPlainObject( instructions )
					? [ instructions ]
					: [];
			}
			return instructions;
		},

		/**
		 * Field changes for a design_options
		 * TODO: Update after USOF2 implementation!
		 *
		 * Note: The selectedElmId is passed explicitly as a parameter because the callback
		 * function can be called with a delay, especially when selecting elements quickly
		 *
		 * @private
		 * @param {String} selectedElmId Shortcode's usbid, e.g. "us_btn:1"
		 * @param {$usof.field|$usof.Group} field
		 * @param {$usof.field} designField
		 */
		_changeDesignField: function( selectedElmId, field, designField ) {
			if ( field.type !== 'design_options' ) {
				return;
			}
			this._changeField( selectedElmId, designField, designField.getValue(), /* skip save option */true );
		},

		/**
		 * Handler for selection responsive state in $usof.Field
		 * TODO: Update after USOF2 implementation!
		 *
		 * @private
		 * @param {$usof.field|$usof.Group} field
		 * @param {String} responsiveState
		 */
		_syncFieldResponsiveState: function( field, responsiveState ) {
			var self = this;
			// Show/Hide responsive toolbar
			self.toggleResponsiveToolbar( !! responsiveState );
			// Set the preview responsive state
			self.setResponsiveState( responsiveState );
		},

		/**
		 * Send a signal to update element field
		 * Note: The code is moved to a separate function since `debounced` must be initialized before call
		 *
		 * @private
		 * @param {[]} args Array of arguments for the trigger
		 * @type debounced
		 */
		__contentChange: $ush.debounce( function( args ) {
			this.trigger( 'contentChange', args );
		}, 1 ),

		/**
		 * Controls the number of columns in a row
		 * Note: The code is moved to a separate function since `debounced` must be initialized before call
		 *
		 * @private
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 * @param {Mixed} layout The layout
		 * @type debounced
		 */
		__updateColumnsLayout: $ush.debounce( function( id, layout ) {
			this._updateColumnsLayout( id, layout );
		}, 1 ),

		/**
		 * Update the shortcode with a frequency of 1ms
		 * Note: The code is moved to a separate function since `throttled` must be initialized before call
		 *
		 * @private
		 * @param {Function} fn The function to be executed
		 * @type throttled
		 */
		__updateShortcode: $ush.throttle( $ush.fn, 1, /* no_trailing */true ),

		/**
		 * Update content after 150ms
		 * Note: The code is moved to a separate function since `debounced` must be initialized before call
		 *
		 * @private
		 * @param {Function} fn The function to be executed
		 * @type debounced
		 */
		__updateShortcode_long: $ush.debounce( $ush.fn, 150 ),

		/**
		 * Update of instructions from a delay of 1s
		 * Note: The code is moved to a separate function since `throttled` must be initialized before call
		 *
		 * @private
		 * @param {Function} fn The function to be executed
		 * @type throttled
		 */
		__updateOnInstructions_long: $ush.throttle( $ush.fn, 1000/* 1 second */ ),

		/**
		 * Field changes for a fieldsets
		 * TODO: Update after USOF2 implementation!
		 *
		 * Note: The selectedElmId is passed explicitly as a parameter because the callback
		 * function can be called with a delay, especially when selecting elements quickly
		 *
		 * @private
		 * @event handler
		 * @param {String} selectedElmId Shortcode's usbid, e.g. "us_btn:1"
		 * @param {$usof.field|$usof.Group} usofField
		 * @param {Mixed} _ The usofField value
		 * @param {Boolean} _skipSave Skip save option
		 */
		_changeField: function( selectedElmId, usofField, _, _skipSave ) {
			var self = this;

			// Run the method to check for visible fields and control the show of tabs
			self.$$fieldsets.autoShowingTabs.call( self );

			// If there is no editable element, then exit the method
			if ( ! selectedElmId || selectedElmId !== self.selectedElmId ) {
				return;
			}

			var isGroup = usofField instanceof $usof.Group,
				isField = usofField instanceof $usof.field;

			// If the object is not a field or a group then exit the method
			if ( ! ( isField || isGroup ) ) {
				return;
			}

			var // Get new param value
				value = usofField.getValue(),
				// Get field type
				fieldType = ( isField ? usofField.type : 'group' ),
				// Get usb-params from field or group
				usbParams = usofField[ isField ? '$row' : '$field' ].data( 'usb-params' ) || {},
				// The get and normalization of instructions
				instructions = self._normalizeInstructions( usbParams['usb_preview'] );

			/**
			 * @type {{}} The data stack for the current change call
			 */
			var _currentData = {
				elmType: self.getElmType( selectedElmId ), // the element type
				fieldType: fieldType, // the field type
				id: selectedElmId, // the ID of selected element
				instructions: instructions, // the instructions for updating the preview
				isChangeDesignOptions: ( fieldType === 'design_options' ), // the design options updates
				// Note: Only a field can have a responsive value, not a group
				isResponsiveValue: ( isField ? usofField.isResponsiveValue( value ) : false ), // the responsive values
				name: ( usofField.name || usofField.groupName ), // the field name
				usofField: usofField, // the field object reference
				value: value, // the new value
			};

			// Execute callback functions if any
			if ( $.isArray( instructions ) ) {
				// Get a list of callback functions for parameters
				var previewCallbacks = $.isPlainObject( _window.$usbdata.previewCallbacks )
					? _window.$usbdata.previewCallbacks
					: {};
				for ( var i in instructions ) {
					var funcName = ( _currentData.elmType + '_' + _currentData.name ).toLowerCase();
					if (
						! instructions[ i ][ 'callback' ]
						|| ! $.isFunction( previewCallbacks[ funcName ] )
					) {
						continue;
					}
					try {
						instructions = previewCallbacks[ funcName ]( _currentData.value ) || /* default */true;
					} catch ( err ) {
						self._debugLog( 'Error executing callback function in instructions', err );
					}
				}
				// The normalization of instructions
				_currentData.instructions = self._normalizeInstructions( instructions );
			}

			/**
			 * @var {Boolean} Determine the progress of the recovery task
			 */
			_currentData.isActiveRecoveryTask = self.isActiveRecoveryTask();

			/**
			 * Update shortcode
			 *
			 * @private
			 * @param {{}} _currentData Current call data stack
			 * @return {{}} Returns the old and updated shortcode
			 */
			var _updateShortcode = function( _currentData ) {
				var originalId = _currentData.id,
					oldShortcode = self.getElmShortcode( originalId );
				if ( ! oldShortcode || _skipSave ) {
					return {};
				}

				var shortcodeObj = self.parseShortcode( oldShortcode ),
					/**
					 * Shortcode which stores the type as content
					 * Note: `content` is a reserved name which implies that the values are the content of the
					 * shortcode for example: [example]content[/example]
					 */
					isShortcodeContent = (
						_currentData.fieldType === 'editor'
						|| _currentData.name === 'content'
					);

				// Attribute updates
				var atts = self.parseAtts( shortcodeObj.atts );
				if (
					isShortcodeContent
					|| (
						_currentData.usofField.getDefaultValue() === _currentData.value
						// Exclude a group so the value contains all settings
						&& _currentData.fieldType !== 'group'
					)
				) {
					delete atts[ _currentData.name ];
				} else {
					atts[ _currentData.name ] = _currentData.value;
				}
				shortcodeObj.atts = self.buildAtts( atts );

				// Set value as shortcode content
				if ( isShortcodeContent ) {
					shortcodeObj.content = _currentData.value;
				}

				// Converts a shortcode object to a string
				var newShortcode = self.buildShortcode( shortcodeObj ),
					hasChanged = ( oldShortcode !== newShortcode && ! _currentData.isActiveRecoveryTask ),
					oldParentShortcode; // the parent shortcode for the events of the year, children change, but the parent needs to be updated

				// Get parent shortcode data
				if ( _currentData.instructions === true && self.isUpdateIncludeParent( originalId ) ) {
					_currentData.id = self.getElmParentId( _currentData.id );
					oldParentShortcode = self.getElmShortcode( _currentData.id );
				}

				// Save shortcode to page content
				if ( hasChanged ) {
					self.pageData.content = ( '' + self.pageData.content )
						.replace( oldShortcode, newShortcode );
					// Send a signal to update element field
					self.__contentChange.call( self );
				}

				// Get parent and update it
				if ( oldParentShortcode ) {
					oldShortcode = oldParentShortcode;
					newShortcode = self.getElmShortcode( _currentData.id );
				}

				// Change columns layout according to the row setting
				if ( hasChanged && _currentData.elmType.indexOf( 'vc_row' ) === 0 && _currentData.name === 'columns' ) {
					self.__updateColumnsLayout( _currentData.id, _currentData.value );
				}

				// If the content of the shortcode has changed, commit to the change history
				if ( hasChanged ) {
					/**
					 * Save last changes to cache (It is important to get the data before call `_updateShortcode`)
					 * Note: The cache provides correct data when multiple threads `debounce` or `throttle` are run.
					 * TODO: Find solution to race problem (get/update, update/get) from using timeout
					 */
					self._$temp._latestShortcodeUpdates = {
						content: oldShortcode,
						preview: self.getElmOuterHtml( _currentData.id )
					};

					var commitArgs = [ _currentData.id, _CHANGED_ACTION_.UPDATE ];

					// Determining the field type whether the spacing is needed or not
					commitArgs.push( self.config( 'useThrottleForFields', [] ).indexOf( _currentData.usofField.type ) > -1 );

					// Add external end-to-end data
					if ( oldParentShortcode ) {
						commitArgs.push( { originalId: originalId } );
					}

					// Commit to save changes to history
					self.commitChangeToHistory.apply( self, commitArgs );
				}

				// Force changes to apply css
				// TODO:Fix after implement USOF2
				if ( ! hasChanged && ! _currentData.isActiveRecoveryTask && _currentData.isChangeDesignOptions ) {
					hasChanged = true;
				}

				return {
					changed: hasChanged,
					new: newShortcode,
					old: oldShortcode
				};
			};

			/**
			 * @type {USBData} Data class instance
			 */
			var cache = $usbcore.cache( '_changeField' );

			// Update the shortcode with a specified delay and receive data from the server
			if ( _skipSave !== true && instructions === true && ! _currentData.isActiveRecoveryTask ) {
				// Note: It is important to call this method when update each param
				// in order to take into account all changes
				var _shortcode = _updateShortcode( _currentData );

				// Note: If there is an item update, let's remember it, because the parameter can
				// depend on the activation of other parameters, which will cause the event queue,
				// and only the last one will be handled. We should not lose the update as it is
				// usually a complex structure change
				if ( _shortcode.changed && instructions === true ) {
					cache.set( 'shortcodeChanged', instructions );
				}

				self.__updateShortcode_long( function() {
					if ( ! _shortcode.changed && ! cache.get( 'shortcodeChanged' ) ) {
						return;
					}
					cache.flush(); // Flushes an instance

					// Show the load
					self.postMessage( 'showPreloader', _currentData.id );
					// Get a rendered shortcode
					self._renderShortcode( /* request id */'_renderShortcode', {
						data: {
							content: _shortcode.new
						},
						success: function( res ) {
							// At this point, there is no need to post message `hidePreloader`
							// since the element is loader and will be replaced with a new code
							if ( ! res.success ) {
								return;
							}
							var html = ( ''+res.data.html )
								// Enable animation appearance
								.replace( /(class=".*?animate_this)/i, "$1 start" );
							self.postMessage( 'updateSelectedElm', [ _currentData.id, html ] );
							// The shortcode change events
							self.trigger( 'shortcodeChanged', _currentData );
						}
					} );
				} );
			}

			// Update the shortcode at a specified frequency
			else if ( instructions !== true ) {
				/**
				 * Update on instructions and data
				 *
				 * @private
				 * @param {{}} _currentData Current call data stack
				 */
				var _updateOnInstructions = function( _currentData ) {
					var _shortcode = _updateShortcode( _currentData );
					// If the shortcode data has not changed or there are no instructions,
					// then we will complete the execution at this stage
					if ( ! _shortcode.changed || $ush.isUndefined( _currentData.instructions ) ) {
						return;
					}
					// Converts a value string representation to an plain object
					if ( _currentData.isResponsiveValue ) {
						_currentData.value = _currentData.usofField.toPlainObject( _currentData.value );
					}
					// Spot update styles, classes or other parameters
					self.postMessage( 'onPreviewParamChange', [
						_currentData.id,
						_currentData.instructions,
						_currentData.value,
						_currentData.fieldType,
						_currentData.isResponsiveValue
					] );
					// The shortcode change events
					self.trigger( 'shortcodeChanged', _currentData );
				};

				/**
				 * Select a wrapper to apply an interval or delay
				 *
				 * @private
				 */
				var _switchUpdateOnInstructions = function() {
					if ( _skipSave === true ) {
						return;
					}
					// The update occurs at a long interval
					if ( self.config( 'useLongUpdateForFields', [] ).indexOf( _currentData.usofField.type ) > -1 ) {
						self.__updateOnInstructions_long( _updateOnInstructions.bind( self, _currentData ) );
					} else {
						// Instant data update
						_updateOnInstructions( _currentData );
					}
				};

				// Check if we are doing preview changes for design options
				if ( _currentData.isChangeDesignOptions ) {
					var _value = unescape( '' + _currentData.value );
					// Get the ID of an attachment to check for loaded
					var attachmentId = $ush.parseInt( ( _value.match( /"background-image":"(\d+)"/ ) || [] )[1] );
					if ( attachmentId && ! self.getAttachmentUrl( attachmentId ) ) {
						// In case the design options have background image and it's info wasn't loaded yet ...
						// ... fire preview change event only after trying to load the image info
						( self.getAttachment( attachmentId ) || { fetch: $.noop } ).fetch( {
							success: _switchUpdateOnInstructions
						} );
					} else {
						_switchUpdateOnInstructions();
					}

					// For fields with type other than design options, just fire preview change event
				} else {
					_switchUpdateOnInstructions();
				}
			}
		},

		/**
		 * Field handler after hidden for a fieldsets
		 * TODO: Update after USOF2 implementation!
		 *
		 * @private For fieldsets
		 * @event handler
		 * @param $usof.field usofField The field object
		 */
		_afterHideField: function( usofField ) {
			if ( usofField instanceof $usof.field && usofField.inited ) {
				// Set default value for hidden field
				usofField.setValue( usofField.getDefaultValue(), /* not quiet */false );
			}
		},

		/**
		 * Switch show/hide panel
		 *
		 * @private
		 * @event handler
		 */
		_panelSwitch: function() {
			var self = this,
				doActionArgs = 'hideEditableHighlight';

			// Set (show/hide)_sidebars
			self.$body.toggleClass( 'hide_sidebars', self.isShowPanel() );

			var isShow = self.isShowPanel();
			if ( isShow && self.selectedElmId ) {
				doActionArgs = [ 'showEditableHighlight', self.selectedElmId ];
			}
			self.postMessage( 'doAction', doActionArgs );
			self.setMode( isShow ? 'editor' : 'preview' );
			self.postMessage( 'changeSwitchPanel' ); // send a message about change the panel display
		},

		/**
		 * Search box character input handler
		 *
		 * @private
		 * @event handler
		 */
		_panelSearchElms: function() {
			var self = this,
				$input = self.$panelSearchField,
				isFoundResult = true,
				value = ( $input[0].value || '' ).trim().toLowerCase();
			$input // Reset button display control
				.next( '.usb_action_panel_reset_search' )
				.toggleClass( 'hidden', ! value );
			// By default, hide all elements that are included in the search
			self.$panelSearchElms
				.toggleClass( 'hidden', !! value );
			if ( value ) {
				// Show all elements that contain a search string in their title
				isFoundResult = !! self.$panelSearchElms
					.filter( '[data-search-text^="' + value + '"], [data-search-text*="' + value + '"]' )
					.removeClass( 'hidden' )
					.length;
			}
			// Control the output of lists and headers
			$( '.usb-panel-elms-list', self.$panelElms )
				.each( function( _, list ) {
					var isEmptyList = ! $( '[data-search-text]:not(.hidden)', list ).length;
					$( list )
						.toggleClass( 'hidden', isEmptyList )
						.prev( '.usb-panel-elms-header' )
						.toggleClass( 'hidden', isEmptyList );
				} );
			// The output of an empty result message
			self.$panelSearchNoResult
				.toggleClass( 'hidden', isFoundResult );
		},

		/**
		 * Reset search in Panel
		 *
		 * @private
		 * @event handler
		 */
		_panelResetSearch: function() {
			var self = this,
				$input = self.$panelSearchField;
			if ( ! $input.val() ) {
				return;
			}
			$input.val( '' ).trigger( 'input' );
		},

		/**
		 * Show the main panel messages
		 *
		 * @param {String} text
		 */
		showMainPanelMessage: function( text ) {
			var self = this;
			self.clearPanel(); // hide all sections
			self.navigatorResetActive(); // reset an active element in navigator
			self.$panelMessages
				.removeClass( 'hidden' )
				.html( text );
		},

		/**
		 * Hide the panel messages
		 *
		 * @private
		 */
		_hidePanelMessages: function() {
			this.$panelMessages
				.addClass( 'hidden' )
				.html( '' );
		},

		/**
		 * Toggle Responsive Mode
		 *
		 * @private
		 * @event handler
		 */
		_toggleResponsiveMode: function() {
			var self = this;
			// Show/Hide responsive toolbar
			self.toggleResponsiveToolbar( ! self.isShowResponsiveToolbar() );
			// Set the default responsive state
			self.setResponsiveState(/* default */);
			// Forward events through document
			self.triggerDocument( 'syncResponsiveState'/*, 'default' */ );
		},

		/**
		 * Show import content (Paste Row/Section)
		 *
		 * @private
		 * @event handler
		 */
		_panelShowImportContent: function() {
			var self = this;
			self.clearPanel(); // hide all sections
			self.navigatorResetActive(); // reset an active element in navigator
			self.$panelImportContent.removeClass( 'hidden' );
			// Clear field and set focus to it
			self.$panelImportTextarea
				.val( '' )
				.focus()
				.removeClass( 'validate_error' );
			// Disable save button
			self.$panelActionpastedSaveContent
				.prop( 'disabled', true )
				.addClass( 'disabled' );
			// Update panel title
			self.setPanelTitle( self.getTextTranslation( 'paste_row' ) );
		},

		/**
		 * Hide import content (Paste Row/Section)
		 *
		 * @private
		 */
		_hidePanelImportContent: function() {
			this.$panelImportContent.addClass( 'hidden' );
		},

		/**
		 * Pasted content change handler
		 *
		 * @private
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_pastedСhangeContent: function( e ) {
			var self = this;
			// Close all notifications
			self.closeAllNotification();

			var target = e.target,
				pastedContent = target.value.trim();

			// Remove usbid's from pasted content
			if ( pastedContent.indexOf( 'usbid=' ) !== -1 ) {
				pastedContent = pastedContent.replace( _REGEXP_USBID_ATTR_, '' );
			}

			// Save the cleaned content
			if ( target.value !== pastedContent ) {
				target.value = pastedContent;
			}

			// Remove helper classes
			$( target ).removeClass( 'validate_error' );

			// Enable save button
			self.$panelActionpastedSaveContent
				.prop( 'disabled', ! pastedContent )
				.toggleClass( 'disabled', ! pastedContent );
		},

		/**
		 * Save pasted content
		 *
		 * @private
		 * @event handler
		 */
		_pastedSaveContent: function() {
			var self = this,
				// Elements
				$textarea = self.$panelImportTextarea,
				$saveButton = self.$panelActionpastedSaveContent,
				// Get pasted content
				pastedContent = ( $textarea.val() || '' );

			if ( ! pastedContent ) {
				// Disable save button
				$saveButton
					.prop( 'disabled', true )
					.addClass( 'disabled' );
				return;
			}

			// Remove html from start and end pasted сontent
			pastedContent = self.removeHtmlWrap( pastedContent );

			// The check the correctness of the entered shortcode
			var isValid = ! (
				!/^\[vc_row([\s\S]*)\/vc_row\]$/gim.test( pastedContent )
				|| pastedContent.indexOf( '[vc_column' ) === -1
			);

			// Added helper classes
			$textarea.toggleClass( 'validate_error', ! isValid );

			// If there is an error, we will display a notification and complete the process
			if ( ! isValid ) {
				self.notify( self.getTextTranslation( 'invalid_data' ), _NOTIFY_TYPE_.ERROR );
				return;
			}

			// Disable the input field at the time of add content
			$textarea
				.prop( 'disabled', true )
				.addClass( 'disabled' );

			// Disable save button
			$saveButton
				.addClass( 'loading disabled' )
				.prop( 'disabled', true );

			// Add a unique usbid for each shortcode
			var elmId;
			pastedContent = pastedContent.replace( /\[(\w+)/g, function( match, tag, offset ) {
				var id = self.getSpareElmId( tag );
				// Save the ID of the first shortcode, which should be `vc_row`
				if ( 0 === offset ) {
					elmId = id;
				}
				return match + ' usbid="' + id + '"';
			} );

			// Get default image
			var placeholder = self.config( 'placeholder', '' );

			// Search and replace use:placeholder
			pastedContent = pastedContent.replace( /use:placeholder/g, placeholder );

			// Replace images for new design options
			pastedContent = pastedContent.replace( /css="([^\"]+)"/g, function( matches, match ) {
				if ( match ) {
					var jsoncss = ( decodeURIComponent( match ) || '' )
						.replace( /("background-image":")(.*?)(")/g, function( _, before, id, after ) {
							return before + ( $ush.parseInt( id ) || placeholder ) + after;
						} );
					return 'css="%s"'.replace( '%s', encodeURIComponent( jsoncss ) );
				}
				return matches;
			} );

			// Check the post_type parameter
			pastedContent = pastedContent.replace( /\s?post_type="(.*?)"/g, function( match, post_type ) {
				if ( self.config( 'grid_post_types', [] ).indexOf( post_type ) === - 1 ) {
					return ' post_type="post"'; // default post_type
				}
				return match;
			} );

			// TODO: Determine the need for this filter
			// Remove [us_post_content..] if post type is not us_content_template
			// if ( self.data.post_type !== 'us_content_template' ) {
			// 	pastedContent = pastedContent.replace( /(\[us_post_content.*?])/g, '' );
			// }

			// Render pasted content
			self._renderShortcode( /* request id */'_renderPastedContent', {
				data: {
					content: pastedContent,
					isReturnContent: true, // Add content to the result (This can be useful for complex changes)
				},
				// Successful request handler
				success: function( res ) {
					if ( ! res.success || ! res.data.html ) {
						return;
					}

					// Commit to save changes to history
					self.commitChangeToHistory( elmId, _CHANGED_ACTION_.CREATE );

					// Add pasted content to `self.pageData.content`
					self.pageData.content += (
						res.data.content || pastedContent.replace( /(grid_layout_data="([^"]+)")/g, 'items_layout=""' )
					);

					// Add html to the end of the document.
					self.postMessage( 'insertElm', [ self.mainContainer, 'append', res.data.html, /* scroll into view */true ] );
					// Send a signal to move element
					self.trigger( 'contentChange' );
				},
				// Handler to be called when the request finishes (after success and error callbacks are executed)
				complete: function( _, textStatus ) {
					var isSuccess = textStatus === 'success';

					// Disable the loader and block m or display the button depend on its status
					$saveButton
						.prop( 'disabled', isSuccess )
						.removeClass( 'loading' )
						.toggleClass( 'disabled', isSuccess );

					// Enable input field
					$textarea
						.prop( 'disabled', false )
						.removeClass( 'disabled' );

					// Clear data on successful request
					if ( isSuccess ) {
						$textarea.val('');
					}
				}
			} );
		},

		/**
		 * Show the panel page custom css
		 *
		 * @private
		 * @event handler
		 */
		_showPageCustomCss: function() {
			var self = this;
			// Load the code editor only after initialize the iframe,
			// due to load assets on demand from the iframe
			if ( ! self.iframe.isLoad ) {
				self
					.off( 'iframeLoaded', self._events.showPageCustomCss )
					.one( 'iframeLoaded', self._events.showPageCustomCss );
				return;
			}

			// Load assets required to initialize the code editor
			self._loadAssetsForCodeEditor();

			// Fields initialization for page_custom_css
			if ( ! ( self._fieldsets.pageCustomCss instanceof $usof.field ) ) {
				var pageCustomCss = new $usof.field( $( '.type_css', self.$panelPageCustomCss )[/* first */0] );
				pageCustomCss.init( pageCustomCss.$row );
				pageCustomCss.setValue( self.pageData.customCss );
				pageCustomCss.on( 'change', $ush.debounce( self._events.changePageCustomCss, 1 ) );
				self._fieldsets.pageCustomCss = pageCustomCss;
			}

			self.clearPanel(); // hide all sections
			self.navigatorResetActive(); // reset an active element in navigator
			self.$panelPageCustomCss.removeClass( 'hidden' );
			self.$panelActionPageCustomCss.addClass( 'active' );

			// Update panel title
			self.setPanelTitle( self.getTextTranslation( 'page_custom_css' ) );

			// Set the cursor at the end of exist content
			try {
				var cmInstance = self._fieldsets.pageCustomCss.editor.codemirror;
				cmInstance.focus();
				cmInstance.setCursor( cmInstance.lineCount(), /* start position */0 );
			} catch( err ) {}
		},

		/**
		 * Load assets required to initialize the code editor
		 *
		 * @private
		 */
		_loadAssetsForCodeEditor: function() {
			var self = this,
				codeEditorAssets = ( _window.$usbdata.deferredAssets || {} )['codeEditor'] || '';
			if ( codeEditorAssets ) {
				self.$body.append( codeEditorAssets );
				delete _window.$usbdata.deferredAssets['codeEditor'];
			}
		},

		/**
		 * Hide the panel page custom css
		 *
		 * @private
		 */
		_hidePanelPageCustomCss: function() {
			var self = this;
			self.$panelPageCustomCss.addClass( 'hidden' );
			self.$panelActionPageCustomCss.removeClass( 'active' );
		},

		/**
		 * Show the panel page settings
		 *
		 * @private
		 * @event handler
		 */
		_showPageSettings: function () {
			var self = this;
			// Fields initialization for page fields
			if ( ! ( self._fieldsets.pageFields instanceof $usof.GroupParams ) ) {
				var pageFields = new $usof.GroupParams( $( '.for_page_fields', self.$panelPageSettings )[/* first */0] );
				for ( var k in pageFields.fields ) {
					pageFields.fields[ k ].on( 'change', $ush.debounce( self._events.changePageSettings, 1 ) );
				}
				self._fieldsets.pageFields = pageFields;
			}
			// Fields initialization for meta data
			if ( ! ( self._fieldsets.pageMeta instanceof $usof.GroupParams ) ) {
				var pageMeta = new $usof.GroupParams( $( '.usb-panel-page-meta', self.$panelPageSettings )[/* first */0] );
				for ( var k in pageMeta.fields ) {
					pageMeta.fields[ k ].on( 'change', $ush.debounce( self._events.changePageMeta, 1 ) );
				}
				self._fieldsets.pageMeta = pageMeta;
			}

			// Set params for fieldsets in page settings
			self._setParamsForPageSettings();

			self.clearPanel(); // hide all sections
			self.navigatorResetActive(); // reset an active element in navigator
			self.$panelPageSettings.removeClass( 'hidden' );
			self.$panelActionPageSettings.addClass( 'active' );
			// Update panel title
			self.setPanelTitle( self.getTextTranslation( 'page_settings' ) );
		},

		/**
		 * Set params for fieldsets in page settings
		 *
		 * @private
		 */
		_setParamsForPageSettings: function() {
			var self = this;
			if ( ! self.iframe.isLoad ) {
				self.one( 'iframeLoaded', self._events.setParamsForPageSettings );
				self.$panelPageSettings // add a preloader for loading data
					.addClass( 'data_loading' );
				return;
			}
			// Object references for code optimization
			var pageData = self.pageData,
				pageMeta = self._fieldsets.pageMeta,
				pageFields = self._fieldsets.pageFields;
			// Set values for page fields
			if ( pageFields instanceof $usof.GroupParams ) {
				pageFields.setValues( pageData.fields, /* quiet mode */true );
				pageData.fields = pageFields.getValues(); // Note: Force for data type compatibility
			}
			// Set values for meta data
			if ( pageMeta instanceof $usof.GroupParams ) {
				pageMeta.setValues( pageData.pageMeta, /* quiet mode */true );
				pageData.pageMeta = pageMeta.getValues(); // Note: Force for data type compatibility
			}
			self.$panelPageSettings
				.removeClass( 'data_loading' );
		},

		/**
		 * Hide the panel page settings
		 *
		 * @private
		 */
		_hidePanelPageSettings: function() {
			var self = this;
			self.$panelPageSettings.addClass( 'hidden' );
			self.$panelActionPageSettings.removeClass( 'active' );
		},

		/**
		 * Save post content changes
		 *
		 * @private
		 * @event handler
		 */
		_saveChanges: function() {
			var self = this;
			if (
				! self.isPageChanged()
				|| self._$temp.isProcessSave
			) {
				return;
			}
			// Set the save execution flag
			self._$temp.isProcessSave = true;
			// Disable button and enable load
			self.$panelActionSaveChanges
				.prop( 'disabled', true )
				.addClass( 'loading' );
			var // Updated data
				data = {
					// The available key=>value:
					//	post_content: '',
					//	post_status: '' ,
					//	post_title: '',
					//	pageMeta: [ key => value ]
					pageMeta: {},
				};
			// Add updated content
			if ( self.isContentChanged() ) {
				data.post_content = self.pageData.content;
			}
			if ( self.isPageFieldsChanged() ) {
				for ( var prop in self.pageData.fields ) {
					data[ prop ] = self.pageData.fields[ prop ];
 				}
			}
			// Add updated meta data
			if ( self.isPageMetaChanged() ) {
				for ( var prop in self.pageData.pageMeta ) {
					data.pageMeta[ prop ] = self.pageData.pageMeta[ prop ];
				}
			}
			if ( self.isPageCustomCssChanged() ) {
				data.pageMeta[ self.config( 'keyCustomCss', '' ) ] = self.pageData.customCss;
			}
			// Send data to server
			self.ajax( /* request id */'_saveChanges', {
				data: $.extend( data, {
					_nonce: self.config( '_nonce' ),
					action: self.config( 'action_save_post' ),
				} ),
				// Handler to be called if the request succeeds
				success: function( res ) {
					if ( ! res.success ) {
						return;
					}
					self.notify( self.getTextTranslation( 'page_updated' ), _NOTIFY_TYPE_.SUCCESS );
					// Reload preview page
					if ( !! self._$temp.isReloadPreviewAfterSave && self.isPageMetaChanged() ) {
						// Reset value after page reload.
						self._$temp.isReloadPreviewAfterSave = false;
						self.iframe.src = self.config( 'previewUrl' );
					}
					// Save the last page data.
					self._$temp.savedPageData = $ush.clone( self.pageData );
				},
				// Handler to be called when the request finishes (after success and error callbacks are executed)
				complete: function() {
					self.$panelActionSaveChanges
						.removeClass( 'loading' )
						.addClass( 'disabled' );
					self._$temp.isProcessSave = false;
				}
			} );
		},

		/**
		 * Handler for create revision and show a preview page
		 * Note: Going to the change preview page creates the revision for which data is needed `post_conent`
		 *
		 * @private
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_submitPreviewChanges: function( e ) {
			var self = this;
			// Add data before send
			$( 'textarea[name="post_content"]', e.target )
				.val( self.pageData.content );
			// Add data for custom page css (Metadata)
			$( 'textarea[name='+ self.config( 'keyCustomCss', '' ) +']', e.target )
				.val( self.pageData.customCss );
		},

	} );

	/**
	 * Functionality for the navigator
	 */
	$.extend( $usbPrototype, {

		/**
		 * Determines if show navigator
		 *
		 * @return Returns true if the navigator is show, otherwise false
		 */
		isShowNavigator: function() {
			return this.$navigator.hasClass( 'show' );
		},

		/**
		 * Show navigator
		 */
		showNavigator: function() {
			var self = this;
			if ( self.isEmptyContent() ) {
				return;
			}
			self.$navigator.addClass( 'show' );
			self.$navigatorActionSwitch.addClass( 'active' );

			self.redrawNavigator(); // redraw the element tree in navigator
		},

		/**
		 * Hide navigator
		 *
		 * @event handler
		 */
		hideNavigator: function() {
			var self = this;
			self.$navigator.removeClass( 'show' );
			self.$navigatorActionSwitch.removeClass( 'active' );
		},

		/**
		 * Handler for navigator display switch
		 *
		 * @private
		 * @event handler
		 */
		_switchNavigator: function() {
			var self = this;
			self[ self.isShowNavigator() ? 'hideNavigator' : 'showNavigator' ]();
		},

		/**
		 * Handler for scroll to navigator item
		 *
		 * Note: Scroll to the element only when the element is outside
		 * the visible part of the window
		 *
		 * @private
		 * @event handler
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 */
		_navigatorScrollTo: function( id ) {
			var self = this;
			if (
				! self.isShowNavigator()
				|| ! self.isValidId( id )
			) {
				return;
			}

			var $body = self.$navigatorBody,
				$item = $( '[data-for="' + id + '"]', $body );

			if ( ! $item.length ) {
				return;
			}

			// If the element is not outside the view, then exit
			var rect = $usbcore.$rect( $item[0] );
			if ( ! ( rect.top < 0 || rect.bottom > ( $body.height() || rect.height ) ) ) {
				return;
			}
			// Get the navigator header height
			var headerHeight = $( '.usb-navigator-header', self.$navigator ).height();
			$body[0].scrollTo( /*x*/0, /*y*/rect.top + $body.scrollTop() - headerHeight ); // scroll to item
		},

		/**
		 * Show duplicate preloader
		 *
		 * @private
		 * @event handler
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 */
		_navigatorShowPreloader: function( id ) {
			var self = this;
			if (
				! self.isShowNavigator()
				|| ! self.doesElmExist( id )
			) {
				return;
			}

			// Get item node and create clone node
			var $item = $( '[data-for="' + id + '"]', self.$navigatorBody ),
				$duplicateItem = $item.clone()
					.removeAttr( 'data-for' )
					.removeClass('expand active')
					.addClass( 'duplicate' );

			// Replace the item icon with usof-preloader
			var $itemIcon = $( '> .usb-navigator-item-header .usb-navigator-item-title > i', $duplicateItem );
			if ( $itemIcon.length ) {
				$itemIcon[0].className = 'usof-preloader';
			}

			// Add clone node to body
			$item.after( $duplicateItem );
		},

		/**
		 * Handler for expand or collapse all items in navigator
		 *
		 * @private
		 * @event handler
		 */
		_navigatorExpandAll: function() {
			var self = this,
				$action = self.$navigatorActionExpandAll,
				$items = $( '[data-for].has_children', self.$navigatorBody ).add( $action );
			// Open or close navigator elements
			if ( ! $action.hasClass( 'expand' ) ) {
				$items.addClass( 'expand' );
			} else {
				$items.removeClass( 'expand' );
			}
		},

		/**
		 * Handler for expand or collapse item in navigator
		 *
		 * @private
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_navigatorExpand: function( e ) {
			var $item = $( e.target ).closest( '[data-for]' );
			if ( $item.length ) {
				$item.toggleClass( 'expand', ! $item.hasClass( 'expand' ) );
			}
		},

		/**
		 * Selected element via navigator
		 *
		 * @private
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_navigatorSelectedElm: function( e ) {
			var self = this,
				$target = $( e.target ),
				id = $target.closest( '[data-for]' ).data( 'for' );

			// Exit if you click on the expand icon
			if ( $target.hasClass( 'usb_action_navigator_expand' ) ) {
				return
			}

			// Scroll to an element if it is outside the preview
			// Note: Scrolling should work even if the element is already selected
			$ush.timeout( function() {
				self.postMessage( 'doAction', [ 'scrollToOutsideElm', id ] );
			}, 100 );

			// Select element by id
			if ( self.selectedElmId !== id ) {
				self.trigger( 'elmSelected', id );
			}
		},

		/**
		 * Handler for duplicate element via navigator
		 *
		 * @private
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 * @return {Boolean} Returns false to stop further execution of event handlers
		 */
		_navigatorDuplicateElm: function( e ) {
			var self = this,
				id = $( e.target ).closest( '[data-for]' ).data( 'for' );
			if ( ! self.doesElmExist( id ) ) {
				return false;
			}
			self.trigger( 'navigatorShowPreloader', id );
			self.trigger( 'elmDuplicate', id );

			return false;
		},

		/**
		 * Handler for remove element via navigator
		 *
		 * @private
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_navigatorRemoveElm: function( e ) {
			var self = this,
				id = $( e.target ).closest( '[data-for]' ).data( 'for' );
			if ( self.doesElmExist( id ) ) {
				self.trigger( 'elmDelete', id );
			}
		},

		/**
		 * Remove an element via navigator
		 *
		 * @param {String} id Shortcode's usbid, e.g. "vc_row:1"
		 */
		navigatorRemoveElm: function( id ) {
			var self = this;
			if (
				! self.isShowNavigator()
				|| ! self.isValidId( id )
			) {
				return;
			}
			$( '[data-for="' + id + '"]:first', self.$navigatorBody ).remove();
		},

		/**
		 * Set the active item in navigator
		 *
		 * @param {String} id Shortcode's usbid, e.g. "vc_row:1"
		 * @param {Boolean} expandParents The expand all parents
		 */
		navigatorSetActive: function( id, expandParents ) {
			var self = this;
			if (
				! self.isShowNavigator()
				|| ! self.doesElmExist( id )
			) {
				return;
			}
			self.navigatorResetActive();

			// Activate the selected item and expand all parents
			$( '[data-for="' + id + '"]', self.$navigatorBody )
				.addClass( 'active' )
				.parents( '[data-for]' )
				.toggleClass( 'expand', !! expandParents );
		},

		/**
		 * Reset an active item in navigator
		 */
		navigatorResetActive: function() {
			var self = this;
			if ( self.isShowNavigator() ) {
				$( '[data-for].active', self.$navigatorBody )
					.removeClass( 'active' );
			}
		},

		/**
		 * Redraw the item tree in navigator
		 * Note: The synchronization method can be called many times, so it must be fast!
		 */
		redrawNavigator: function() {
			var self = this;

			// Exit if there is no content, will not load iframe or hidden navigator
			if (
				self.iframe.isLoad !== true
				|| self.isEmptyContent()
				|| ! self.isShowNavigator()
			) {
				return;
			}

			var $body = self.$navigatorBody;

			/**
			 * Create a navigation of elements
			 *
			 * @private
			 * @param {String} id Shortcode's usbid, e.g. "vc_row:1"
			 * @param {Node|DocumentFragment} node The container into which the result will be added
			 * @return {DocumentFragment|Node} Returns a fragment of the element structure
			 */
			var getItems = function( elmsId, node, level ) {
				if ( ! $.isArray( elmsId ) || elmsId.length === 0 ) {
					return node;
				}
				level++; // the current level
				elmsId.map( function( elmId ) {
					// Get the element id for the attribute
					var attrId = self.getElmValue( elmId, 'el_id', /* default */'' );

					// Create a navigator node from a template
					var $item = $( self.buildString( self._navigatorItemTemplate, {
						attr_id: ( attrId ? '#' + attrId : '' ),
						elm_icon: self.config( 'elm_icons.' + self.getElmName( elmId ), 'no-icon' ), // the element icon
						elm_title: self.getElmTitle( elmId ),
						elm_type: self.getElmType( elmId ),
						usbid: elmId,
					} ) );

					// Get the children of the current item
					var itemElmChildren = self.getElmChildren( elmId );
					if ( itemElmChildren.length ) {
						getItems( itemElmChildren, $item, level );

						$item // expand of containers if previously expanded
							.addClass( 'has_children' )
							.toggleClass( 'expand', !! $( '[data-for="'+ elmId +'"].expand', $body ).length );
					}

					$item.addClass( 'level_' + level ); // set item level
					node.append( $item.get(0) ); // add a item to the node
				} );
				return node;
			}

			// Get the structure of elements start from the self.mainContainer
			$body.html( getItems( self.getElmChildren( self.mainContainer ), new DocumentFragment, /* level */0 ) );

			// Set the active item in navigator
			self.navigatorSetActive( self.selectedElmId, /* expand parent */true );
		},

	} );

	/**
	 * Functionality for work with templates
	 */
	$.extend( $usbPrototype, {

		/**
		 * Determines whether the specified id is template import
		 *
		 * @param {String} id Shortcode's usbid, e.g. "import_template:1"
		 * @return {Boolean} True if the specified identifier is import templates, False otherwise
		 */
		isTemplateImport: function( id ) {
			var self = this;
			if ( self.isValidId( id ) ) {
				id = self.getElmType( id );
			}
			return id === 'import_template';
		},

		/**
		 * Determines if category in templates loaded
		 *
		 * @param {String} templateCategoryId The template category id
		 * @return {Boolean} True if category in templates loaded, False otherwise
		 */
		hasCategoryInTemplatesLoaded: function( templateCategoryId ) {
			return this._$template.isTemplateLoaded.hasOwnProperty( templateCategoryId )
		},

		/**
		 * Determines if templates loaded
		 *
		 * @param {String} templateCategoryId The template category id
		 * @returns {Boolean} Returns True if the templates category is loaded, otherwise False
		 */
		isTemplatesLoaded: function( templateCategoryId ) {
			var self = this;
			if (
				self.hasCategoryInTemplatesLoaded( templateCategoryId )
				&& self._$template.isTemplateLoaded[ templateCategoryId ]
			) {
				return true;
			}
			return false;
		},

		/**
		 * Determines if templates in category
		 *
		 * @param {String} templateCategoryId The template category id
		 * @returns {Boolean} Returns True if successful, otherwise False
		 */
		hasTemplatesInCategory: function( templateCategoryId ) {
			return !! this._$template.сategoryTemplates[ templateCategoryId ];
		},

		/**
		 * Load config with categories and templates preview
		 *
		 * @private
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_loadTemplatesConfig: function( e ) {
			var self = this;
			if ( ! $.isEmptyObject( self._$template.$categorySections ) ) {
				return;
			}

			// Show template loading
			self.$templates.addClass( 'templates_loading' );

			// Load template sections
			self.ajax( /* request id */'_loadTemplatesConfig', {
				successNotify: false, // disable output of Notify in the successful answer where the result is an error
				data: {
					_nonce: self.config( '_nonce' ),
					action: self.config( 'action_get_templates_config' ),
				},
				success: function( res ) {
					// Hide template loading
					self.$templates.removeClass( 'templates_loading' );

					if ( ! res.success || ! $.isPlainObject( res.data ) ) {
						// Show template loading error
						self.$templatesLoadedError.addClass( 'active' );
						return;
					}

					for ( templateCategoryId in res.data ) {
						// If the category section is loaded then skip the iteration
						if ( self._$template.$categorySections[ templateCategoryId ] ) {
							continue;
						}

						// Get category section
						var categorySection = res.data[ templateCategoryId ];
						if ( categorySection ) {
							self.$templates.append( categorySection );
							self._$template.$categorySections[ templateCategoryId ] = $( categorySection );
						}
					}
				},
			} );
		},

		/**
		 * Show/hide templates in a category
		 *
		 * @private
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_toggleTemplatesCategories: function( e ) {
			var self = this,
				$section = $( e.currentTarget ).parent(),
				templateCategoryId = $section.data( 'template-category-id' );

			// If it was not possible to load the category id, then exit the method
			if ( ! templateCategoryId ) {
				return;
			}

			if ( $section.hasClass( 'active' ) ) {
				$section
					.removeClass( 'active' );
			} else {
				// Check and preload category templates
				if ( self.isActivated() ) {
					self._preloadCategoryTemplates( templateCategoryId );
				}
				$section
					.addClass( 'active' )
					.siblings()
					.removeClass( 'active' );
			}
		},

		/**
		 * Check and preload category templates
		 *
		 * @private
		 * @param {String} templateCategoryId The template category id
		 */
		_preloadCategoryTemplates: function( templateCategoryId ) {
			var self = this;

			if (
				$ush.isUndefined( templateCategoryId )
				|| templateCategoryId == ''
			) {
				return;
			}

			self.ajax( /* request id */'_preloadCategoryTemplates', {
				// Request data
				data:{
					_nonce: self.config( '_nonce' ),
					action: self.config( 'action_preload_template_category' ),
					template_category_id: templateCategoryId,
				},
				success: function( res ) {
					// Saved the result in any case, to understand whether there was a download or not
					self._$template.isTemplateLoaded[ templateCategoryId ] = res.success;

					if ( ! res.success ) {
						return;
					}

					// Set parameter for render shortcode start
					self.trigger( 'сategoryTemplatesLoaded', [ templateCategoryId ] );
				},
			} );
		},

		/**
		 * Insert template in content and preview
		 *
		 * @param {String} templateCategoryId The template category id
		 * @param {String} templateId The unique template id in the category
		 * @param {String} parentId ID of the element's parent element
		 * @param {Number} currentIndex Position of the element inside the parent
		 */
		insertTemplate: function( templateCategoryId, templateId, parentId, currentIndex ) {
			var self = this;

			// Check if the templates category id is correct
			if ( ! templateCategoryId ) {
				self._debugLog( 'Error: Template category ID is not set', args );
				return;
			}

			// Check if the template id is correct
			if ( ! templateId ) {
				self._debugLog( 'Error: Template ID is not set', args );
				return;
			}

			// Check if the parent container is correct
			if ( ! self.isMainContainer( parentId ) ) {
				self._debugLog( 'Error: Invalid parent container, templates can only be added to mainContainer', args );
				return;
			}

			// Get the insert position
			var insert = self.getInsertPosition( parentId, currentIndex );

			/**
			 * @private
			 * @var {Function} Get template data
			 */
			var _getTemplateData = function() {
				// Get html shortcode code and set on preview page
				self.postMessage( 'showPreloader', [
					insert.parent,
					insert.position,
				] );

				self._renderShortcode( /* request id */'_getTemplateData', {
					data: {
						template_category_id: templateCategoryId,
						template_id: templateId,
						isReturnContent: true // returns the content for the page (shortcodes)
					},
					success: function( res ) {
						self.postMessage( 'hidePreloader', insert.parent );

						// Check the correctness of the answer and the availability of data
						if ( ! res.success || ! res.data.content || ! res.data.html ) {
							return;
						}

						var firstElmId, // first shortcode usbid (should be a vc_row)
							html = '' + res.data.html, // full template markup
							content = res.data.content, // page content (shortcodes)
							customPrefix = $usb.config( 'designOptions.customPrefix', _default.customPrefix );

						// Replace all usbid's in content and html
						content = content.replace( _REGEXP_USBID_ATTR_, function( match, input, elmId ) {
							// Get a new usbid of the same type
							var newElmId = self.getSpareElmId( elmId );
							if ( ! firstElmId ) {
								firstElmId = newElmId; // get first shortcode usbid (should be a vc_row)
							}

							html = html
								// Replace all usbid's in attributes (Note: )
								.replace( new RegExp( 'data-(for|usbid)="'+ elmId +'"', 'g' ), 'data-$1="'+ newElmId +'"' )
								// Replace all custom element classes, old mask: `{customPrefix}{type}{index}`
								.replace( new RegExp( customPrefix + elmId.replace( ':', '' ), 'g' ), $ush.uniqid( customPrefix ) );

							// Return a new shortcode usbid
							return input.replace( elmId, newElmId );
						} );

						// Added shortcode to content
						if ( ! self._addShortcodeToContent( parentId, currentIndex, content ) ) {
							return false;
						}

						// Add new template to preview page
						self.postMessage( 'insertElm', [ insert.parent, insert.position, html ] );

						// Add the first row to the history and open for edit
						if ( self.isRow( firstElmId ) ) {
							// Commit to save changes to history
							self.commitChangeToHistory( firstElmId, _CHANGED_ACTION_.CREATE );
						}

						// Send a signal to create a new element
						self.trigger( 'contentChange' );
					}
				} );
			};

			// Determines if current category shortcodes loaded
			if ( ! self.isTemplatesLoaded( templateCategoryId ) ) {
				self.off( 'сategoryTemplatesLoaded' )
					.one( 'сategoryTemplatesLoaded', function( _templateCategoryId ) {
					if ( templateCategoryId == _templateCategoryId ) {
						_getTemplateData(); // get template data
					}
				} );
				if ( self.hasCategoryInTemplatesLoaded( templateCategoryId ) ) {
					self._debugLog( 'Error: Failed to load template category: ', [ templateCategoryId ] );
				}
				return;
			}
			_getTemplateData(); // get template data
		},

		/**
		 * Show transit element for templates
		 *
		 * @private
		 */
		_showTemplatesTransit: function() {
			$usbcore.$removeClass( this._$template.transit, 'hidden' );
		},

		/**
		 * Hide transit element for templates
		 *
		 * @private
		 */
		_hideTemplatesTransit: function() {
			$usbcore.$addClass( this._$template.transit, 'hidden' );
		}
	} );

	/**
	 * Functionality for work with data and history of changes
	 */
	$.extend( $usbPrototype, {

		/**
		 * Undo handler
		 *
		 * @private
		 * @event handler
		 */
		_undoChange: function() {
			var self = this;
			self._createRecoveryTask( _HISTORY_TYPE_.UNDO );
		},

		/**
		 * Redo handler
		 *
		 * @private
		 * @event handler
		 */
		_redoChange: function() {
			var self = this;
			self._createRecoveryTask( _HISTORY_TYPE_.REDO );
		},

		/**
		 * Handler for changes in the data history,
		 * the method will be called every time the data in the history has changed
		 *
		 * @private
		 * @event handler
		 */
		_historyChanged: function() {
			var self = this;
			[ // Controll the operation and display of undo/redo buttons
				{ $btn: self.$panelActionUndo, disabled: ! self.getLengthUndo() },
				{ $btn: self.$panelActionRedo, disabled: ! self.getLengthRedo() }
			].map( function( i ) {
				i.$btn
					// Disable or enable buttons
					.toggleClass( 'disabled', i.disabled )
					.prop( 'disabled', i.disabled )
			} );
		},

		/**
		 * Get the length of `undo`
		 *
		 * @return {Number}
		 */
		getLengthUndo: function() {
			return ( this._$temp.changesHistory.undo || [] ).length;
		},

		/**
		 * Get the length of `redo`
		 *
		 * @return {Number}
		 */
		getLengthRedo: function() {
			return ( this._$temp.changesHistory.redo || [] ).length;
		},

		/**
		 * Get the length of `tasks`
		 *
		 * @return {Number}
		 */
		getLengthTasks: function() {
			return ( this._$temp.changesHistory.tasks || [] ).length;
		},

		/**
		 * Get the last history data by action
		 *
		 * @param {String} action The action name.
		 * @return {{}} Returns the last data object for the action
		 */
		getLastHistoryDataByAction: function( action ) {
			var lastData,
				self = this,
				undo = self._$temp.changesHistory.undo;
			if (
				self.getLengthUndo()
				&& $usbcore.indexOf( action, _CHANGED_ACTION_ ) > -1
			) {
				for ( var i = self.getLengthUndo() -1; i >= 0; i-- ) {
					if ( ( undo[ i ] || {} ).action === action ) {
						lastData = $ush.clone( undo[ i ] );
						break;
					}
				}
			}
			return lastData || {};
		},

		/**
		 * Determines if active recovery task
		 *
		 * @return {Boolean} True if active recovery task, False otherwise
		 */
		isActiveRecoveryTask: function() {
			return !! this._$temp.isActiveRecoveryTask;
		},

		/**
		 * Save data to history by interval
		 * Note: The code is moved to a separate function since `throttle` must be initialized before call
		 *
		 * @private
		 * @param {Function} fn The function to be executed
		 * @type throttle
		 */
		__saveDataToHistory: $ush.throttle( $ush.fn, 3000/* 3 seconds */, /* no_trailing */true ),

		/**
		 * Commit to save changes to history
		 * Note: This method is designed to work only with builder elements
		 *
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 * @param {String} action The action that is executed to apply the changes
		 * @param {Boolean} useThrottle Using the interval when save data
		 * @param {{}} extData External end-to-end data
		 */
		commitChangeToHistory: function( id, action, useThrottle, extData ) {
			var self = this;
			if (
				! action
				|| ! self.isValidId( id )
				|| self.isActiveRecoveryTask()
				|| $usbcore.indexOf( action, _CHANGED_ACTION_ ) < 0
			) {
				return;
			}

			/**
			 * @private
			 * @var {Function} Save change data in history
			 */
			var saveDataToHistory = function() {
				var changesHistory = self._$temp.changesHistory;
				/**
				 * @var {{}} The current data of the shortcode before apply the action
				 */
				var data = {
					action: action,
					id: id,
					extData: $.isPlainObject( extData ) ? extData : {},
				};

				// Get and save the position of an element
				if ( $usbcore.indexOf( action, [ _CHANGED_ACTION_.MOVE, _CHANGED_ACTION_.REMOVE ] ) > -1 ) {
					data.index = self.getElmIndex( id );
					data.parentId = self.getElmParentId( id );
				}
				// Get and save the preview of an element
				if ( $usbcore.indexOf( action, [ _CHANGED_ACTION_.UPDATE, _CHANGED_ACTION_.REMOVE ] ) > -1 ) {
					data.content = self.getElmShortcode( id );
					data.preview = self.getElmOuterHtml( id );

					// Сheck the load of the element, if the preview contains the class for update the element,
					// then we will skip save to history
					var pcre = new RegExp( 'class="(.*)?'+ self.config( 'className.elmLoad', '' ) +'(\s|")' );
					if ( data.preview && pcre.test( data.preview ) ) {
						return;
					}
				}
				/**
				 * Get data from shared cache
				 * Note: The cache provides correct data when multiple threads `debounce` or `throttle` are run
				 */
				if ( _CHANGED_ACTION_.UPDATE === action && ! $.isEmptyObject( self._$temp._latestShortcodeUpdates ) ) {
					$.extend( data, self._$temp._latestShortcodeUpdates );
					self._$temp._latestShortcodeUpdates = {};
				}

				// Get parameters before delete, this will help restore the element
				if ( _CHANGED_ACTION_.REMOVE === action ) {
					data.values = self.getElmValues( id );
				}

				// Check against the latest data to eliminate duplicates
				if ( _CHANGED_ACTION_.UPDATE === action ) {

					// Get the last history data by action
					var lastData = self.getLastHistoryDataByAction( _CHANGED_ACTION_.UPDATE );

					// Check for duplicate objects
					var props = [ 'index', 'parentId', 'timestamp' ]; // Properties to remove
					if (
						! $.isEmptyObject( lastData )
						&& $usbcore.comparePlainObject(
							$usbcore.clearPlainObject( lastData, props ),
							$usbcore.clearPlainObject( data, props )
						)
					) {
						return;
					}
				}

				// If the maximum limit is exceeded, then we will delete the old data
				if ( self.getLengthUndo() >= $ush.parseInt( self.config( 'maxDataHistory', /* default */100 ) ) ) {
					changesHistory.undo = changesHistory.undo.slice( 1 );
				}

				// Save data in `undo` and destroy `redo`
				changesHistory.undo.push( $.extend( data, { timestamp: Date.now() } ) );
				changesHistory.redo = [];
				self.trigger( 'historyChanged' );
			};

			// Save data with and without interval
			if ( !! useThrottle ) {
				self.__saveDataToHistory( saveDataToHistory );
			} else {
				saveDataToHistory();
			}
		},

		/**
		 * Commit to save data to history
		 * Note: This method is for store arbitrary data and restore via a callback function
		 *
		 * @param {Mixed} data The commit data
		 * @param {Function} callback The restore callback function
		 * @param {Boolean} useThrottle Using the interval when save data
		 */
		commitDataToHistory: function( customData, callback, useThrottle ) {
			var self = this;
			if (
				$ush.isUndefined( customData )
				|| ! $.isFunction( callback )
			) {
				return;
			}

			/**
			 * @private
			 * @var {Function} Save change data in history
			 */
			var saveDataToHistory = function() {
				var changesHistory = self._$temp.changesHistory,
					data = {
						action: _CHANGED_ACTION_.CALLBACK,
						callback: callback,
						data: customData
					};

				// Get the last history data by action
				var lastData = self.getLastHistoryDataByAction( _CHANGED_ACTION_.CALLBACK );

				// Check for duplicate objects
				if (
					! $.isEmptyObject( lastData )
					&& $usbcore.comparePlainObject(
						$usbcore.clearPlainObject( lastData, [ 'callback', 'timestamp' ] ),
						$usbcore.clearPlainObject( data, 'callback' )
					)
				) {
					return;
				}

				// If the maximum limit is exceeded, then we will delete the old data
				if ( self.getLengthUndo() >= $ush.parseInt( self.config( 'maxDataHistory', /* default */100 ) ) ) {
					changesHistory.undo = changesHistory.undo.slice( 1 );
				}

				// Save data in `undo` and destroy `redo`
				changesHistory.undo.push( $.extend( data, { timestamp: Date.now() } ) );
				changesHistory.redo = [];
				self.trigger( 'historyChanged' );
			};

			// Save data with and without interval
			if ( !! useThrottle ) {
				self.__saveDataToHistory( saveDataToHistory );
			} else {
				saveDataToHistory();
			}
		},

		/**
		 * Create a recovery task
		 *
		 * @private
		 * @param {Number} type Task type, the value can be or greater or less than zero
		 */
		_createRecoveryTask: function( type ) {
			var self = this;
			// Check the correctness of the task type
			if ( ! type || $usbcore.indexOf( type, [ _HISTORY_TYPE_.UNDO, _HISTORY_TYPE_.REDO ] ) < 0 ) {
				return;
			}

			var task, // Found recovery task
				lengthUndo = self.getLengthUndo(),
				lengthRedo = self.getLengthRedo(),
				changesHistory = self._$temp.changesHistory; // object link

			// Get data from `undo`
			if ( type === _HISTORY_TYPE_.UNDO && lengthUndo ) {
				task = changesHistory.undo[ --lengthUndo ];
				changesHistory.undo = changesHistory.undo.slice( 0, lengthUndo );
			}
			// Get data from `redo`
			if ( type === _HISTORY_TYPE_.REDO && lengthRedo ) {
				task = changesHistory.redo[ --lengthRedo ];
				changesHistory.redo = changesHistory.redo.slice( 0, lengthRedo );
			}

			// Add a recovery task to the queue
			if ( ! $.isEmptyObject( task ) ) {
				changesHistory.tasks.push( $ush.clone( task, { _source: type } ) );
				self.trigger( 'historyChanged' );
				// Apply all recovery tasks
				self.__startRecoveryTasks.call( self );
			}
		},

		/**
		 * Start all recovery tasks
		 * Note: The code is moved to a separate function since `debounced` must be initialized before call
		 *
		 * @private
		 * @param {Function} fn The function to be executed
		 * @type debounced
		 */
		__startRecoveryTasks: $ush.debounce( function() {
			var self = this;
			if ( self.isActiveRecoveryTask() ) {
				return;
			}
			// Launch Task Manager
			self._$temp.isActiveRecoveryTask = true;
			self._recoveryTaskManager();
		}, 100/* ms */ ),

		/**
		 * Recovery Task Manager
		 * Note: Manage and apply tasks from a shared queue for data recovery
		 *
		 * @private
		 */
		_recoveryTaskManager: function() {
			var self = this,
				lengthTasks = self.getLengthTasks(),
				changesHistory = self._$temp.changesHistory,
				task = changesHistory.tasks[ --lengthTasks ]; // get last task

			// Check the availability of the task
			if ( $.isEmptyObject( task ) ) {
				self._$temp.isActiveRecoveryTask = false;
				self.trigger( 'historyChanged' );
				return;
			}

			// Remove the task from the general list
			changesHistory.tasks = changesHistory.tasks.slice( 0, lengthTasks );

			/**
			 * Apply changes from task
			 * Note: Timeout will allow to collect data and update the task before recovery
			 */
			$ush.timeout( self._applyChangesFromTask.bind( self, $ush.clone( task ), /* originalTask */task ), 1 );

			// Reverse actions Create/Remove in a task
			switch( task.action ) {
				case _CHANGED_ACTION_.CREATE:
					task.action = _CHANGED_ACTION_.REMOVE;
					break;
				case _CHANGED_ACTION_.REMOVE:
					task.action = _CHANGED_ACTION_.CREATE;
					break;
			}

			// Get and save the preview of an element
			if ( $usbcore.indexOf( task.action, [ _CHANGED_ACTION_.UPDATE, _CHANGED_ACTION_.REMOVE ] ) > -1 ) {
				task.content = self.getElmShortcode( task.id );
				task.preview = self.getElmOuterHtml( task.id );
			}

			// Position updates on movements
			if ( $usbcore.indexOf( task.action, [ _CHANGED_ACTION_.MOVE, _CHANGED_ACTION_.REMOVE ] ) > -1 ) {
				task.index = self.getElmIndex( task.id );
				task.parentId = self.getElmParentId( task.id );
			}

			// Move task in the opposite direction
			var _source = task._source;
			delete task._source;
			if ( _source === _HISTORY_TYPE_.UNDO ) {
				changesHistory.redo.push( task );
			} else {
				changesHistory.undo.push( task );
			}
		},

		/**
		 * Apply changes from task
		 *
		 * @private
		 * @param {{}} task Cloned version of the task
		 * @param {{}} originalTask Task object from history
		 */
		_applyChangesFromTask: function( task, originalTask ) {
			var self = this;
			if ( $.isEmptyObject( task ) ) {
				self._$temp.isActiveRecoveryTask = false;
				return;
			}
			// Сheck the validation of the task
			if ( ! task.action ) {
				self._debugLog( 'Error: Invalid change action: ', task );
				return;
			}

			// Data recovery depend on the applied action
			if ( task.action === _CHANGED_ACTION_.CREATE ) {
				self.removeElm( task.id );

				// Move the element to a new position
			} else if ( task.action === _CHANGED_ACTION_.MOVE ) {
				self.moveElm( task.id, task.parentId, task.index );

				// Create the element
			} else if ( task.action === _CHANGED_ACTION_.REMOVE ) {
				// Added shortcode to content
				if ( ! self._addShortcodeToContent( task.parentId, task.index, task.content ) ) {
					return false;
				}
				// Get insert position
				var insert = self.getInsertPosition( task.parentId, task.index );
				// Add new shortcde to preview page
				self.postMessage( 'insertElm', [ insert.parent, insert.position, '' + task.preview ] );
				self.postMessage( 'maybeInitElmJS', [ task.id ] ); // init its JS if needed
				// Update element from task
			} else if ( task.action === _CHANGED_ACTION_.UPDATE ) {
				// Shortcode updates
				self.pageData.content = ( '' + self.pageData.content )
					.replace( self.getElmShortcode( task.id ), task.content );
				// Refresh shortcode preview
				self.postMessage( 'updateSelectedElm', [ task.id, '' + task.preview ] );

				// Refresh data in edit active fieldset
				var id = ( task.extData || {} ).originalId || task.id;
				if ( id === self.selectedElmId && self.activeElmFieldset instanceof $usof.GroupParams ) {
					self.activeElmFieldset.setValues( self.getElmValues( self.selectedElmId ), /* quiet mode */true );
				}

				// Pass the committed data to a custom handle
			} else if ( task.action === _CHANGED_ACTION_.CALLBACK ) {
				// If there is a handler, then call it and pass the captured data
				if ( $.isFunction( task.callback ) ) {
					task.callback.call( self, $ush.clone( task ).data, originalTask );
				}

			} else {
				self._debugLog( 'Error: Unknown recovery action: ', action );
				return;
			}

			// Send a signal to create or update element
			if ( $usbcore.indexOf( task.action, [ _CHANGED_ACTION_.UPDATE, _CHANGED_ACTION_.REMOVE ] ) > -1 ) {
				self.trigger( 'contentChange' );
			}

			// Trigger the event to work out the controls parts
			self.trigger( 'historyChanged' );

			// Call the task manager for further process of the task list
			// Note: Timeout helps to avoid recovery bugs when the browser is loaded.
			$ush.timeout( self._recoveryTaskManager.bind( self ), 1 );
		}
	} );

	/**
	 * Functionality for the implementation of Fieldsets
	 */
	$usbPrototype.$$fieldsets = {
		/**
		 * Toggles the USOF tabs of the settings panel
		 *
		 * @private For fieldsets
		 * @event handler
		 * @param {Event} e The Event interface represents an event which takes place in the DOM
		 */
		_toggleTabs: function( e ) {
			var $target = $( e.currentTarget ),
				$sections = $target
					.parents( '.usof-tabs:first' )
					.find( '> .usof-tabs-sections > *' );

			// This is toggle the tab title
			$target
				.addClass( 'active' )
				.siblings()
				.removeClass( 'active' );

			// This is toggle the tab sections
			$sections
				.removeAttr( 'style' )
				.eq( $target.index() )
				.addClass( 'active' )
				.siblings()
				.removeClass( 'active' );
		},

		/**
		 * Auto show or hidden of tabs for fieldsets
		 *
		 * @private
		 */
		autoShowingTabs: function() {
			var self = this;
			if ( ! self.activeElmFieldset || ! self.activeElmFieldset.isGroupParams ) {
				return;
			}
			$.each( self.activeElmFieldset.$tabsSections, function( index, section ) {
				var fields = $( '> *', section ).toArray(),
					isHidden = true;
				for ( var k in fields ) {
					var $field = $( fields[ k ] ),
						isShown = $field.data( 'isShown' );
					if ( $ush.isUndefined( isShown ) ) {
						isShown = ( $field.css( 'display' ) != 'none' );
					}
					if ( isShown ) {
						isHidden = false;
						break;
					}
				}
				self.activeElmFieldset.$tabsItems
					.eq( index )
					.toggleClass( 'hidden', isHidden );
			} );
		}
	};

	/**
	 * Functionality for work with responsive values
	 */
	$.extend( $usbPrototype, {
		/**
		 * Determine if the value is an object of the responsive format
		 *
		 * @param {mixed} value The value
		 * @return {boolean} True if the specified value is responsive object, False otherwise
		 */
		isResponsiveObject: function( value ) {
			if ( ! $.isPlainObject( value ) ) {
				return false;
			}
			// Get responsive states
			var states = this.config( 'responsiveStates', [] );
			for ( var i in states ) if ( value.hasOwnProperty( states[ i ] ) ) {
				return true;
			}
			return false;
		}
	} );

	/**
	 * Functionality for the implementation of Main API
	 */
	$.extend( $usbPrototype, {

		/**
		 * Get config value
		 * Note: The method is called many times, so performance is important here!
		 *
		 * @param {String} path Dot-delimited path to get value from config objects
		 * @param {Mixed} _default Default value when not in configs
		 * @return {Mixed}
		 */
		config: function( path, _default ) {
			var self = this;
			// Note: All parameters are cached as this is a static view of the data
			return $usbcore.cache( 'config' ).get( path, function() {
				// If there is no data in the cache, we will return the data to be saved in the cache
				return $usbcore.deepFind( self._config, path, _default );
			} );
		},

		/**
		 * Checks for hotkey combination usage by key
		 *
		 * @param {String} ...keys The short command keys
		 * @return {Boolean} Returns True if used, otherwise False
		 */
		hotkeys: function() {
			var args = $ush.toArray( arguments );
			for ( var i in args ) if ( this._hotkeyStates[ '' + args[ i ] ] === true ) {
				return true;
			}
			return false;
		},

		/**
		 * Get text translation by key
		 *
		 * @param {String} key The key
		 * @return {String} The text
		 */
		getTextTranslation: function( key ) {
			if ( ! key ) {
				return '';
			}
			return ( _window.$usbdata.textTranslations || {} )[ key ] || key;
		},

		/**
		 * Determining if a license is activated
		 *
		 * @return {Boolean} True if activated, False otherwise
		 */
		isActivated: function() {
			return !! this.config( 'is_activated', /* default */false );
		},

		/**
		 * Determines if ontent hanged
		 *
		 * @return {Boolean} True if ontent hanged, False otherwise
		 */
		isContentChanged: function() {
			var self = this;
			return ( self._$temp.savedPageData.content || '' ) !== ( self.pageData.content || '' );
		},

		/**
		 * Determines if page custom css hanged
		 *
		 * @return {Boolean} True if page custom css hanged, False otherwise
		 */
		isPageCustomCssChanged: function() {
			var self = this;
			return ( self._$temp.savedPageData.customCss || '' ) !== ( self.pageData.customCss || '' );
		},

		/**
		 * Determines if page fields changed
		 *
		 * @return {Boolean} True if page fields changed, False otherwise
		 */
		isPageFieldsChanged: function() {
			var self = this;
			return ! $usbcore.comparePlainObject( self._$temp.savedPageData.fields, self.pageData.fields );
		},

		/**
		 * Determines if page meta data changed
		 *
		 * @return {Boolean} True if page meta data changed, False otherwise
		 */
		isPageMetaChanged: function() {
			var self = this;
			return ! $usbcore.comparePlainObject( self._$temp.savedPageData.pageMeta, self.pageData.pageMeta );
		},

		/**
		 * Determines if page changed
		 *
		 * @return {Boolean} True if page changed, False otherwise
		 */
		isPageChanged: function() {
			var self = this;
			return (
				self.isContentChanged()
				|| self.isPageMetaChanged()
				|| self.isPageFieldsChanged()
				|| self.isPageCustomCssChanged()
			);
		},

		/**
		 * Show error messages for debug
		 *
		 * @private
		 * @param {String} text
		 * @param {Mixed} data
		 */
		_debugLog: function() {
			var args = arguments;
			if ( ! args.length ) {
				args = [ '_debugLog: called with no params' ];
			}
			console.log.apply( null, args );
		},

		/**
		 * Get the temporary object
		 * TODO: Move to $usbcore.cache
		 *
		 * @param {String} key The key
		 * @return {{}}
		 */
		getTemp: function( key ) {
			var self = this;
			if ( key && ! self._temp[ key ] ) {
				return self._temp[ key ] = {};
			}
			return key ? self._temp[ key ] : self._temp;
		},

		/**
		 * Set data the temporary
		 * TODO: Move to $usbcore.cache
		 *
		 * @param {String} key The key name
		 * @param {Mixed} value The value
		 */
		setTemp: function( key, value ) {
			this._temp[ '' + key ] = value || {};
		},

		/**
		 * Flush temporary data
		 * TODO: Move to $usbcore.cache
		 *
		 * @param {String} key The key name
		 */
		flushTemp: function( key ) {
			this.setTemp( key );
		},

		/**
		 * Save content temporarily in a temporary variable, this is necessary
		 * for the move mode where the moved element should not be present in
		 * the content. These method are mainly needed for Drag and Drop in move mode
		 */
		saveTempContent: function() {
			var self = this;
			self._$temp.tempContent = '' + self.pageData.content;
		},

		/**
		 * Restore content from a temporary variable, these method are mainly
		 * needed for Drag and Drop in move mode. This method works from `self.saveTempContent()`
		 *
		 * @return {Boolean} True if the content has been restored, False otherwise
		 */
		restoreTempContent: function() {
			var self = this;
			if ( ! self.isEmptyTempContent() ) {
				self.pageData.content = ( '' + self._$temp.tempContent ) || self.pageData.content;
				delete self._$temp.tempContent;
				return true
			}
			return false;
		},

		/**
		 * This method to determine if temporary content is installed
		 *
		 * @return {Boolean} True if temporary content, False otherwise
		 */
		isEmptyTempContent: function() {
			return $ush.isUndefined( this._$temp.tempContent )
		},

		/**
		 * This method determines whether the page content is empty or not
		 *
		 * @return {Boolean} True if empty content, False otherwise
		 */
		isEmptyContent: function() {
			return ( '' + this.pageData.content ).indexOf( '[vc_row' ) === -1;
		},

		/**
		 * Determines whether the specified mode is valid mode
		 *
		 * @param {String} mode The mode
		 * @return {Boolean} True if the specified mode is valid mode, False otherwise
		 */
		isValidMode: function( mode ) {
			return mode && $usbcore.indexOf( mode, [ 'editor', 'preview', 'drag:add', 'drag:move' ] ) > -1;
		},

		/**
		 * Determines if mode
		 * As parameters, you can set both one mode and several to check for matches,
		 * if at least one of the results matches, then it will be true
		 *
		 * @return {Boolean} True if the specified mode is mode, False otherwise
		 */
		isMode: function() {
			// Get set modes, example: 'editor', 'preview', 'drag:add', 'drag:move'
			var self = this,
				args = arguments;
			for ( var i in args ) {
				if ( self.isValidMode( args[ i ] ) && self._mode === args[ i ] ) return true;
			}
			return false;
		},

		/**
		 * Set the mode
		 *
		 * @param {String} mode The mode
		 * @return {Boolean} True if mode changed successfully, False otherwise
		 */
		setMode: function( mode ) {
			var self = this;
			if (
				mode
				&& self.isValidMode( mode )
				&& mode !== self._mode
			) {
				var oldMode = self._mode;
				// The mode change event
				self.trigger( 'modeChange', [ /* newMode */self._mode = mode, oldMode ] );
				return true;
			}
			return false;
		},

		/**
		 * Gets the mode
		 * Note: The code is not used
		 *
		 * @return {String} The mode
		 */
		getMode: function() {
			return this._mode || '';
		},

		/**
		 * Get the attachment
		 *
		 * @param {Number} id The attachment id
		 * @return {{}}
		 */
		getAttachment: function( id ) {
			if ( ! id || ! wp.media ) {
				return;
			}
			return wp.media.attachment( id );
		},

		/**
		 * Get the attachment url
		 *
		 * @param {Number} id The attachment id
		 * @return {String}
		 */
		getAttachmentUrl: function( id ) {
			if ( ! id ) {
				return '';
			}
			return ( this.getAttachment( id ) || { get: $.noop } ).get( 'url' ) || '';
		},

		/**
		 * Generate a RegExp to identify a shortcode
		 * Note: RegExp does not know how to work with neste the shortcode in itself.
		 *
		 * Capture groups:
		 *
		 * 1. An extra `[` to allow for escape shortcodes with double `[[]]`
 		 * 2. The shortcode name
 		 * 3. The shortcode argument list
 		 * 4. The self close `/`
 		 * 5. The content of a shortcode when it wraps some content
 		 * 6. The close tag
 		 * 7. An extra `]` to allow for escape shortcodes with double `[[]]`
		 *
		 * @param {String} tag The shortcode tag "us_btn" or "vc_row|vc_column|..."
		 * @return {RegExp} The elm shortcode regular expression
		 */
		getShortcodePattern: function( tag ) {
			return new RegExp( '\\[(\\[?)(' + tag + ')(?![\\w-])([^\\]\\/]*(?:\\/(?!\\])[^\\]\\/]*)*?)(?:(\\/)\\]|\\](?:([^\\[]*(?:\\[(?!\\/\\2\\])[^\\[]*)*)(\\[\\/\\2\\]))?)(\\]?)', 'g' );
		},

		/**
		 * Remove html from start and end content
		 *
		 * @param {String} content
		 * @return {String}
		 */
		removeHtmlWrap: function( content ) {
			return ( '' + content )
				.replace( /^<[^\[]+|[^\]]+$/gi, '' );
		},

		/**
		 * Parse shortcode text in parts
		 *
		 * @param {String} shortcode The shortcode text
		 * @return {{}}
		 */
		parseShortcode: function( shortcode ) {
			var self = this;
			if ( ! shortcode ) {
				return {};
			}
			// Remove html from start and end of content
			shortcode = self.removeHtmlWrap( shortcode );

			// Get shortcode parts
			var firstTag = ( shortcode.match( /^.*?\[([\w\-]+)\s/ ) || [] )[ /* tag name */1 ] || '',
				result = ( self.getShortcodePattern( firstTag ) ).exec( shortcode );

			if ( result ) {
				return {
					tag: result[ 2 ], // the shortcode tag of the current object
					atts: self._unescapeAttr( result[ 3 ] || '' ), // the a string representation of the shortcode attributes
					input: result[ 0 ], // the input shortcode text
					content: result[ 5 ] || '', // the content of the shortcode if there is of course
					hasClosingTag: !! result[ 6 ] // the need for an close tag
				};
			}

			return {};
		},

		/**
		 * Convert attributes from string to object
		 *
		 * @param {String} atts The string atts
		 * @return {{}}
		 */
		parseAtts: function( str ) {
			var result = {};
			if ( ! str ) {
				return result;
			}
			// Map zero-width spaces to actual spaces
			str = str.replace( /[\u00a0\u200b]/g, ' ' );
			// The retrieve attributes from a string
			( str.match( /[\w-_]+="([^\"]+)?"/g ) || [] ).forEach( function( attribute ) {
				attribute = attribute.match( /([\w-_]+)="([^\"]+)?"/ );
				if ( ! attribute ) {
					return;
				}
				result[ attribute[ /* key */1 ] ] = ( '' + ( attribute[ /* value */2 ] || '' ) ).trim();
			});
			return result;
		},

		/**
		 * Converts a shortcode object to a string
		 *
		 * @param {{}} object The shortcode object
		 * @param {{}} attsDefaults The default atts
		 * @return {String}
		 */
		buildShortcode: function( shortcode, attsDefaults ) {
			if ( $.isEmptyObject( shortcode ) ) {
				return '';
			}
			var self = this,
				// Create shortcode
				result = '[' + shortcode.tag;
			// The add attributes
			if ( shortcode.atts || attsDefaults ) {
				if ( ! $.isEmptyObject( attsDefaults ) ) {
					shortcode.atts = self.buildAtts( self.parseAtts( shortcode.atts ), attsDefaults );
				}
				// Escape for shortcode attributes
				shortcode.atts = self._escapeAttr( shortcode.atts );
				result += ' ' + shortcode.atts.trim();
			}
			result += ']';
			// The add content
			if ( shortcode.content ) {
				result += shortcode.content;
			}
			// The add end tag
			if ( shortcode.hasClosingTag ) {
				result += '[/'+ shortcode.tag +']';
			}
			return '' + result;
		},

		/**
		 * Returns a string representation of an attributes
		 *
		 * @param {{}} atts This is an attributes object
		 * @param {{}} defaults The default atts
		 * @return {String} String representation of the attributes
		 */
		buildAtts: function( atts, defaults ) {
			if ( ! atts || $.isEmptyObject( atts ) ) {
				return '';
			}
			if ( $.isEmptyObject( defaults ) ) {
				defaults = {};
			}
			var result = [];
			for ( var k in atts ) {
				var value = atts[ k ];
				// Check the values for correctness, otherwise we will skip the additions
				if (
					value === null
					|| $ush.isUndefined( value )
					|| (
						! $ush.isUndefined( defaults[ k ] )
						&& defaults[ k ] === value
					)
				) {
					continue;
				}
				// Convert parameter list to string (for wp link)
				if ( $.isPlainObject( value ) ) {
					var inlineValue = [];
					for ( var i in value ) {
						if ( value[ i ] ) {
							inlineValue.push( i + ':' + value[ i ] );
						}
					}
					value = inlineValue.join('|');
				}
				// Escape double quotes for shortcode attributes
				result.push( k + '="' + ( '' + value ).replace( /\"/g, '``' ) + '"' );
			}
			return result.join( ' ' );
		},

		/**
		 * Convert pattern to string from result
		 *
		 * @param {String} template The string template
		 * @param {{}} params The parameters { key: 'value'... }
		 * @return {String}
		 */
		buildString: function( template, params ) {
			if ( ! $.isPlainObject( params ) ) {
				params = {};
			}
			var self = this,
				// Create pattern for regular expression. Variable example: `{%var_name%}`
				pattern = $ush.escapePcre( self.config( 'startSymbol', '{%' ) );
				pattern += '([A-z\\_\\d]+)';
				pattern += $ush.escapePcre( self.config( 'endSymbol', '%}' ) );
			// Replace all variables with values
			return ( '' + template ).replace( new RegExp( pattern, 'gm' ), function( _, varName ) {
				return '' + ( params[ varName ] || '' );
			} );
		},

		/**
		 * Determines whether the specified id is valid ID
		 *
		 * @private
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 * @return {Boolean} True if the specified id is valid id, False otherwise
		 */
		isValidId: function( id ) {
			return id && /^([\w\-]+):(\d+)(\|[a-z\-]+)?$/.test( id );
		},

		/**
		 * Determines whether the specified id is row
		 *
		 * @param {String} id Shortcode's usbid, e.g. "vc_row:1"
		 * @return {Boolean} True if the specified id is row, False otherwise
		 */
		isRow: function( id ) {
			return this.getElmName( id ) === 'vc_row';
		},

		/**
		 * Determines whether the specified id is column
		 *
		 * @param {String} id Shortcode's usbid, e.g. "us_column:1"
		 * @return {Boolean} True if the specified id is column, False otherwise
		 */
		isColumn: function( id ) {
			return $usbcore.indexOf( this.getElmName( id ), [ 'vc_column', 'vc_column_inner' ] ) > -1;
		},

		/**
		 * Determines whether the specified id is outside main container
		 *
		 * @param {String} id Shortcode's usbid, e.g. "us_header:1"
		 * @return {Boolean} True if the specified identifier is outside container, False otherwise
		 */
		isOutsideMainContainer: function( id ) {
			var self = this;
			return $usbcore.indexOf( self.getElmName( id ), self.config( 'elms_outside_main_container', [] ) ) > -1;
		},

		/**
		 * Determines whether the specified id is main container id,
		 * this is the root whose name is assigned to `self.mainContainer`,
		 * for example name: `container`
		 *
		 * @param {String} id Shortcode's usbid, e.g. "container"
		 * @return {Boolean} True if the specified id is container id, False otherwise
		 */
		isMainContainer: function( id ) {
			return id && id === this.mainContainer;
		},

		/**
		 * Determines whether the specified ID is container
		 *
		 * @param {String} name Shortcode's usbid, e.g. "vwrapper:1"
		 * @return {Boolean} True if the specified id is container, False otherwise
		 */
		isElmContainer: function( name ) {
			var self = this;
				name = self.isValidId( name )
					? self.getElmName( name )
					: name;
			return name && self.config( 'shortcode.containers', [] ).indexOf( name ) > -1;
		},

		/**
		 * Determines whether the specified id is node root container,
		 * for example: `vc_row`, `vc_row_inner`, `vc_tta_tabs`, `vc_tta_accordion` etc
		 *
		 * @param {String} name Shortcode's usbid, e.g. "us_btn:1"
		 * @return {Boolean} True if the specified id is elm root container, False otherwise
		 */
		isRootElmContainer: function( name ) {
			var self = this;
				name = self.isValidId( name )
					? self.getElmName( name )
					: name;
			return (
				self.isElmContainer( name )
				&& !! self.config( 'shortcode.relations.as_parent.' + name + '.only' )
			);
		},

		/**
		 * Determines whether the specified id is second node container,
		 * for example: `vc_column`, `vc_column_inner`, `vc_tta_section` etc
		 *
		 * @param {String} name Shortcode's usbid, e.g. "us_btn:1"
		 * @return {Boolean} True if the specified id is elm root container, False otherwise
		 */
		isChildElmContainer: function( name ) {
			var self = this;
				name = self.isValidId( name )
					? self.getElmName( name )
					: name;
			return (
				self.isElmContainer( name )
				&& ! self.isRootElmContainer( name )
				&& !! self.config( 'shortcode.relations.as_child.' + name + '.only' )
			);
		},

		/**
		 * Determines whether an element needs to be updated from the parent
		 *
		 * @param {String|Node} id Shortcode's usbid, e.g. "vc_tta_section:1"
		 * @return {Boolean} True if the specified id is elm parent update, False otherwise
		 */
		isUpdateIncludeParent: function( id ) {
			var self = this;
			if ( $usbcore.isNode( id ) ) {
				id = self.getElmId( id );
			}
			if ( ! self.isValidId( id ) ) {
				return false;
			}
			var name = self.getElmName( id );
			return name && self.config( 'shortcode.update_parent', [] ).indexOf( name ) > -1;
		},

		/**
		 * Determines whether the specified name is elm TTA
		 *
		 * @param {String} name The name e.g. "vc_tta_tabs:1"
		 * @return {Boolean} True if the specified name is elm tta, False otherwise
		 */
		isElmTTA: function( name ) {
			var self = this;
			if ( self.isValidId( name ) ) {
				name = self.getElmType( name );
			}
			return !! name && /^vc_tta_(tabs|tour|accordion|section)$/.test( name );
		},

		/**
		 * Determines whether the specified name is tabs or tour
		 *
		 * @param {String} name The name e.g. "vc_tta_tabs:1"
		 * @return {Boolean} True if the specified id is tabs or tour, False otherwise
		 */
		isElmTab: function( name ) {
			var self = this;
			if ( self.isValidId( name ) ) {
				name = self.getElmType( name );
			}
			return /^vc_tta_(tabs|tour)$/.test( name );
		},

		/**
		 * Determines whether the specified name is tta section
		 *
		 * @param {String} name The name
		 * @return {Boolean} True if the specified name is tta section, False otherwise
		 */
		isElmSection: function( name ) {
			var self = this;
			if ( self.isValidId( name ) ) {
				name = self.getElmType( name );
			}
			return name === 'vc_tta_section';
		},

		/**
		 * Escape for shortcode attributes
		 *
		 * @private
		 * @param {String} value The value
		 * @return {String} Returns a string from escaped with special characters
		 */
		_escapeAttr: function( value ) {
			return ( '' + value )
				.replace( /\[/g, '&#91;' )
				.replace( /\]/g, '&#93;' );
		},

		/**
		 * Unescape for shortcode attributes
		 *
		 * @private
		 * @param {String} value The value
		 * @return {String} Returns a string from the canceled escaped special characters
		 */
		_unescapeAttr: function( value ) {
			return ( '' + value )
				.replace( /&#91;/g, '[' )
				.replace( /&#93;/g, ']' );
		},

		/**
		 * Check the possibility of move the shortcode to the specified parent
		 * Note: This method has specific exceptions in `move:add` for self.mainContainer
		 *
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 * @param {String} parent Shortcode's usbid, e.g. "vc_column:1"
		 * @param {Boolean} strict The ON/OFF strict mode (Strict mode is a hard dependency between elements!)
		 * @return {Boolean} True if able to be child of, False otherwise
		 */
		canBeChildOf: function( id, parent, strict ) {
			var self = this,
				args = arguments,
				isMainContainer = self.isMainContainer( parent );
			if (
				self.isMainContainer( id ) // it is forbidden to move the main container!
				|| ! self.isValidId( id )
				|| ! ( self.isValidId( parent ) || isMainContainer )
			) {
				return false;
			}

			// Get all names without prefixes and indices
			var targetName = self.getElmName( id ),
				parentName = isMainContainer
					? parent
					: self.getElmName( parent ),
				// Get all relations for shortcodes
				shortcodeRelations = $.extend( {}, self.config( 'shortcode.relations', {} ) ),
				result = true;

			// If there are no deps, we will allow everyone to move
			if ( $.isEmptyObject( shortcodeRelations ) ) {
				self._debugLog( 'Notice: There are no relations and movement is allowed for every one', args );
				return true;
			}

			// Passing the result through the drag data cache function
			return self._cacheDragProcessData(
				function() {
					/**
					 * The a check all shortcodes relations
					 *
					 * Relations name `as_parent` and `as_child` obtained from Visual Composer
					 * @see https://kb.wpbakery.com/docs/developers-how-tos/nested-shortcodes-container/
					 *
					 * Example relations: {
					 *		as_child: {
					 *			vc_row: {
					 *				only: 'container',
					 *			},
					 *			vc_tta_section: { // Separate multiple values with comma
					 *				only: 'vc_tta_tabs,vc_tta_accordion...',
					 *			},
					 *			...
					 *		},
					 *		as_parent: {
					 *			vc_row: {
					 *				only: 'vc_column',
					 *			},
					 *			hwrapper: { // Separate multiple values with comma
					 *				except: 'vc_row,vc_column...',
					 *			},
					 *			...
					 *		}
					 * }
					 */
					for ( var name in shortcodeRelations ) {
						if ( ! result ) {
							break;
						}
						var relations = shortcodeRelations[ name ][ name === 'as_child' ? targetName : parentName ];
						if ( ! $ush.isUndefined( relations ) ) {
							for ( var condition in relations ) {
								// If check occurs in `move:add` then skip the rule for the main container, when add
								// a new element, it is allowed to add simple elements to the main container
								if (
									self.isMode( 'drag:add' )
									&& parentName === self.mainContainer
									&& ! self.isChildElmContainer( id )
								) {
									continue;
								}
								// If the rules have already prohibited the specified connection, then we complete the check
								if ( ! result ) {
									break;
								}
								var allowed = ( relations[ condition ] || '' ).split(','),
									isFound = allowed.indexOf( name === 'as_child' ? parentName : targetName ) !== -1;
								if (
									( condition === 'only' && ! isFound )
									|| ( condition === 'except' && isFound )
								) {
									result = false;
								}
							}
						}
					}

					// Strict validation will ensure that secondary elements are allowed to
					// move within the same parent.
					if (
						result
						&& !! strict
						&& (
							isMainContainer
							|| self.isChildElmContainer( id )
						)
					) {
						// The check if temporary content, then we will restore it to get the correct data,
						// this is only necessary for the `drag:move`
						var isTempContent = ( self.isMode( 'drag:move' ) && ! self.isEmptyTempContent() ),
							tempContent;
						if ( isTempContent ) {
							tempContent = self.pageData.content;
							self.restoreTempContent();
						}

						// Get a parent for the floated `id`
						var elmParentId = self.getElmParentId( id );

						// After receive the data, we restore the variable,
						// this is only necessary for the `drag:move`
						if ( isTempContent && tempContent ) {
							self.saveTempContent();
							self.pageData.content = '' + tempContent;
						}

						return parent === elmParentId;
					}

					return result;
				},
				/* key */'canBeChildOf:' + $ush.toArray( args ).join('|'),
				/* default value */false
			);
		},

		/**
		 * Determine has same type parent
		 * Note: The method is called many times, so performance is important here!
		 *
		 * @param {String} type The tag type "us_btn|us_btn:1"
		 * @param {String} parent Shortcode's usbid, e.g. "vc_column:1"
		 * @return {Boolean} True if able to be parent of, False otherwise
		 */
		hasSameTypeParent: function( type, parent ) {
			var self = this;
			if (
				self.isMainContainer( type )
				|| self.isMainContainer( parent )
				|| ! self.isValidId( parent )
			) {
				return false;
			}
			// Get type
			type = self.isValidId( type )
				? self.getElmType( type )
				: type;
			// If the type is from the parent of the same type
			if ( type === self.getElmType( parent ) ) {
				return true;
			}
			// Search all parents
			var iteration = 0;
			while( parent !== null || self.isMainContainer( parent ) ) {
				// After exceede the specified number of iterations, the loop will be stopped
				if ( iteration++ >= /* max number of iterations */1000 ) {
					break;
				}
				parent = self.getElmParentId( parent );
				if ( self.getElmType( parent ) === type ) {
					return true;
				}
			}
			return false;
		},

		/**
		 * Get a valid container ID
		 *
		 * @param {Mixed} container The container
		 * @return {String} Returns a valid container in any case (on error it's mainContainer)
		 */
		getValidContainerId: function( container ) {
			var self = this;
			return ! self.isElmContainer( container )
				? self.mainContainer
				: container;
		},

		/**
		 * Determines whether the specified ID is alias usbid
		 *
		 * @param {String} id Shortcode's usbid, e.g. "vc_tta_section:0|alias"
		 * @return {Boolean} True if the specified id is alias usbid, False otherwise
		 */
		isAliasElmId: function( id ) {
			var self = this;
			if ( ! self.isValidId( id ) ) {
				return false;
			}
			return _REGEXP_USBID_ALIAS_.test( id );
		},

		/**
		 * Get alias from ID
		 * Note: For any usbid, several aliases can be created that will still refer to the main usbid.
		 * This allows you to implement functionality for specific elements, for example: transfer
		 * features from sections to tab buttons
		 *
		 * @param {String} id Shortcode's usbid, e.g. "vc_tta_section:0|alias"
		 * @return {String|null} Returns the alias name if any, otherwise null
		 */
		getAliasFromId: function( id ) {
			var self = this;
			if ( ! self.isValidId( id ) ) {
				return null;
			}
			return ( id.match( _REGEXP_USBID_ALIAS_ ) || [] )[ /* alias */2 ] || null;
		},

		/**
		 * Add alias to ID
		 *
		 * @param {String} alias The alias e.g. "alias-name"
		 * @param {String} id Shortcode's usbid, e.g. "vc_tta_section:0"
		 * @return {String} Returns the id from the appended alias
		 */
		addAliasToElmId: function( alias, id ) {
			var self = this,
				args = arguments;
			if ( alias && typeof alias === 'string' && self.isValidId( id ) ) {
				id += '|' + alias;
			} else {
				self._debugLog( 'Notice: Failed to add alias to id', args );
			}
			return id;
		},

		/**
		 * Remove an alias from ID
		 *
		 * @param {String} id Shortcode's usbid, e.g. "vc_tta_section:0|alias"
		 * @return {String} Returns id without alias
		 */
		removeAliasFromId: function( id ) {
			var self = this;
			if ( ! self.isValidId( id ) ) {
				return id;
			}
			return ( id.match( _REGEXP_USBID_ALIAS_ ) || [] ) [ /* usbid */1 ] || id;
		},

		/**
		 * Get the elm type
		 *
		 * @param {String|Node} id Shortcode's usbid, e.g. "us_btn:1"
		 * @return {String} The elm type
		 */
		getElmType: function( id ) {
			var self = this;
			if ( $usbcore.isNode( id ) ) {
				id = self.getElmId( id );
			}
			return self.isValidId( id )
				? id.split(':')[ /* type */0 ] || ''
				: '';
		},

		/**
		 * Get the elm name
		 *
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 * @return {String} Returns the name of the element (without index)
		 */
		getElmName: function( id ) {
			var self = this;

			// Passing the result through the drag data cache function
			return self._cacheDragProcessData(
				function() {
					var type = self.getElmType( id );
					return ( type.match( /us_(.*)/ ) || [] )[ /* name */1 ] || type;
				},
				/* key */'getElmName:' + id,
				/* default value */''
			);
		},

		/**
		 * Get the elm title
		 *
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 * @return {String}
		 */
		getElmTitle: function( id ) {
			var self = this;
			if ( ! self.isValidId( id ) ) {
				return 'Unknown';
			}
			var name = self.getElmName( id );
			return self.config( 'elm_titles.' + name ) || name;
		},

		/**
		 * Check if a shortcode with a given name exists or not
		 *
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 * @return {Boolean} Returns True if id exists, otherwise returns False
		 */
		doesElmExist: function( id ) {
			var self = this;
			if ( ! self.isValidId( id ) || ! self.pageData.content ) {
				return false;
			}

			// Passing the result through the drag data cache function
			return self._cacheDragProcessData(
				function() {
					return ( new RegExp( '\\['+ self.getElmType( id ) +'[^\\]]+usbid=\\"'+ $ush.escapePcre( id ) +'\\"' ) )
						.test( '' + self.pageData.content )
				},
				/* key */'doesElmExist:' + id,
				/* default value */false
			);
		},

		/**
		 * Get the elm id
		 * Note: The method is called many times, so performance is important here!
		 *
		 * @param {Node} node The target element
		 * @return {String} id Shortcode's usbid, e.g. "us_btn:1"
		 */
		getElmId: function( node ) {
			if ( ! $usbcore.isNode( node ) ) {
				return '';
			}
			if ( ! node.hasOwnProperty( '_$$usbid' ) ) {
				var self = this,
					id = $usbcore.$attr( node, 'data-usbid' );
				node._$$usbid = ( self.isValidId( id ) || self.isMainContainer( id ) )
					? id
					: '';
			}
			return node._$$usbid;
		},

		/**
		 * Get the index of an element by ID.
		 *
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 * @return {Number|null} The index of the element (Returns `null` in case of an error)
		 */
		getElmIndex: function( id ) {
			var self = this;
			if ( ! self.isValidId( id ) ) {
				return null;
			}
			var index = ( self.getElmSiblingsId( id ) || [] ).indexOf( id );
			return index > -1
				? index
				: null;
		},

		/**
		 * Generate a spare shortcode usbid for a new element
		 *
		 * @param {String} type The type or usbid from which the type will be derived
		 * @return {String}
		 */
		getSpareElmId: function( type ) {
			var self = this;
			if ( ! type ) {
				return '';
			}
			// If the type has an id, then we get the type
			if ( self.isValidId( type ) ) {
				type = self.getElmType( type );
			}
			if ( ! self._$temp.generatedIds ) {
				self._$temp.generatedIds = [];
			}
			for ( var index = 1;; index++ ) {
				var id = type + ':' + index;
				if ( ! self.doesElmExist( id ) && self._$temp.generatedIds.indexOf( id ) < 0 ) {
					self._$temp.generatedIds.push( id );
					return id;
				}
			}
		},

		/**
		 * Get element's direct parent's ID or a 'container' if element is at the root
		 * Note: The method is called many times, so performance is important here!
		 *
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 * @return {String|Boolean|null} Returns the parent id if successful, otherwise null or False
		 */
		getElmParentId: function( id ) {
			var self = this,
				parentId = self.mainContainer;

			if ( id === parentId || ! self.doesElmExist( id ) ) {
				return null;
			}

			// Passing the result through the drag data cache function
			return self._cacheDragProcessData(
				function() {
					var result = parentId,
						content = ( '' + self.pageData.content ),
						// Get the index of the start of the shortcode
						elmRegex = new RegExp( '\\['+ self.getElmType( id ) +'[^\\]]+usbid=\\"'+ $ush.escapePcre( id ) +'\\"' ),
						startPosition = content.search( elmRegex ),
						// Get content before and after shortcode
						prevContent = content.slice( 0, startPosition ),
						nextContent = content.slice( startPosition )
							// Remove all shortcodes of the set type
							.replace( self.getShortcodePattern( self.getElmType( id ) ), '' ),
						closingTags = nextContent.match( /\[\/(\w+)/g ) || [],
						parentTagMatch, parentTag, parentTagAtts;

					$.each( closingTags, function( index, closingTag ) {
						closingTag = closingTag.substr( 2 );
						// Trying to find last open tag in prevContent
						// TODO: make sure that tags without atts work
						parentTagMatch = prevContent.match( new RegExp( '\\[' + closingTag + '\\s([^\\]]+)(?!.*\\[\\/' + closingTag + '(\\s|\\]))', 's' ) );

						if ( parentTagMatch !== null ) {
							// If matches tag found, check if its content has current element
							parentTagAtts = self.parseAtts( parentTagMatch[ 1 ] );
							parentTag = self.getElmShortcode( parentTagAtts['usbid'] );
							if ( parentTag.search( elmRegex ) > -1 ) {
								result = parentTagAtts['usbid'];
								return false;
							}
						}
					} );

					return result;
				},
				/* key */'getElmParentId:' + id,
				/* default value */parentId
			);
		},

		/**
		 * Get the element next id
		 * Note: The code is not used.
		 *
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 * @return {String|null} The element next id or null
		 */
		getElmNextId: function( id ) {
			var self = this;
			if ( ! self.isValidId( id ) || self.isMainContainer( id ) ) {
				return null;
			}
			var children = self.getElmChildren( self.getElmParentId( id ) ),
				currentIndex = children.indexOf( id );
			if ( currentIndex < 0 || children.length === currentIndex ) {
				return null;
			}
			return children[ ++currentIndex ] || null;
		},

		/**
		 * Get the element previous id
		 * Note: The code is not used.
		 *
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 * @return {String|null} The element previous id or null
		 */
		getElmPrevId: function( id ) {
			var self = this;
			if ( ! self.isValidId( id ) || self.isMainContainer( id ) ) {
				return null;
			}
			var children = self.getElmChildren( self.getElmParentId( id ) ),
				currentIndex = children.indexOf( id );
			if ( currentIndex < 0 || currentIndex === 0 ) {
				return null;
			}
			return children[ --currentIndex ] || null;
		},

		/**
		 * Get the element siblings id
		 *
		 * @param {String} id The id e.g. "us_btn:1"
		 * @return {[]} The element siblings id
		 */
		getElmSiblingsId: function( id ) {
			var self = this;
			if ( ! self.isValidId( id ) || self.isMainContainer( id ) ) {
				return [];
			}
			return self.getElmChildren( self.getElmParentId( id ) );
		},

		/**
		 * Get element's direct children IDs (or empty array, if element doesn't have children)
		 * Note: The method is called many times, so performance is important here!
		 *
		 * @param {String} id Shortcode's usbid, e.g. "vc_row:1"
		 * @return {[]} Returns an array of child IDs
		 */
		getElmChildren: function( id ) {
			var self = this,
				isMainContainer = self.isMainContainer( id );

			if ( ! id || ! ( self.isValidId( id ) || isMainContainer ) ) {
				return [];
			}

			// Passing the result through the drag data cache function
			return self._cacheDragProcessData(
				function() {
					var content = ! isMainContainer
						? ( self.parseShortcode( self.getElmShortcode( id ) ) || {} ).content || ''
						: '' + self.pageData.content;
					if ( ! content ) {
						return [];
					}
					var i = 0,
						result = [],
						firstShortcode;
					// Get the shortcode siblings ids
					while ( firstShortcode = self.parseShortcode( content ) ) {
						if ( i++ > /*max number of iterations*/9999 || $.isEmptyObject( firstShortcode ) ) {
							break;
						}
						var usbid = self.parseAtts( firstShortcode.atts )['usbid'] || null;
						if ( usbid ) {
							result.push( usbid );
						}
						content = content.replace( firstShortcode.input, '' );
					}
					return result;
				},
				/* key */'getElmChildren:' + id,
				/* default value */[]
			);
		},

		/**
		 * Get all element's direct children IDs (or empty array, if element doesn't have children)
		 *
		 * @param {String} id Shortcode's usbid, e.g. "vc_row:1"
		 * @return {[]}
		 */
		getElmAllChildren: function( id ) {
			var self = this;
			if ( ! self.isValidId( id ) || ! self.isElmContainer( id ) ) {
				return [];
			}
			var results = [],
				args = arguments,
				childrenIDs = self.getElmChildren( id ),
				recursionLevel = $ush.parseInt( args[ /* current recursion level */1 ] );
			for ( var i in childrenIDs ) {
				var childrenId = childrenIDs[i];
				if ( ! self.isValidId( childrenId ) ) {
					continue;
				}
				results.push( childrenId );
				if ( self.isElmContainer( childrenId ) ) {
					if ( recursionLevel >= /* max number of levels when recursin */20 ) {
						self._debugLog( 'Notice: Exceeded number of levels in recursion:', args );
					} else {
						results = results.concat( self.getElmAllChildren( childrenId, recursionLevel++ ) );
					}
				}
			}
			return results;
		},

		/**
		 * Get element's shortcode (with all the children if they exist)
		 *
		 * @param {String} id Shortcode's usbid (e.g. "us_btn:1")
		 * @return {String}
		 */
		getElmShortcode: function( id ) {
			var self = this,
				content = ( '' + self.pageData.content );
			if ( $ush.isUndefined( id ) ) {
				return content;
			}
			if ( ! self.isValidId( id ) ) {
				return '';
			}

			// The getting shortcodes
			var matches = content.match( self.getShortcodePattern( self.getElmType( id ) ) );

			if ( matches ) {
				for ( var i in matches ) {
					if ( matches[ i ].indexOf( 'usbid="' + id + '"' ) !== -1 ) {
						return matches[ i ];
					}
				}
			}
			return '';
		},

		/**
		 * Get an node or nodes by ID
		 *
		 * @param {String|[]} id Shortcode's usbid, e.g. "us_btn:1"
		 * @return {null|Node|[Node..]}
		 */
		getElmNode: function( id ) {
			var self = this;
			if ( ! self.iframe.isLoad ) {
				return null;
			}
			return ( self.iframe.contentWindow.$usbp || {} ).getElmNode( id );
		},

		/**
		 * Get all html for a node include styles
		 *
		 * @param {String|[]} id Shortcode's usbid, e.g. "us_btn:1"
		 * @return {String}
		 */
		getElmOuterHtml: function( id ) {
			var self = this;
			if ( ! self.iframe.isLoad ) {
				return '';
			}
			return ( self.iframe.contentWindow.$usbp || {} ).getElmOuterHtml( id ) || '';
		},

		/**
		 * Get shortcode's params values
		 *
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 * @return {{}}
		 */
		getElmValues: function( id ) {
			var self = this;
			if ( ! self.doesElmExist( id ) ) {
				return {};
			}
			// The convert attributes from string to object
			var shortcode = self.parseShortcode( self.getElmShortcode( id ) );
			if ( ! $.isEmptyObject( shortcode ) ) {
				var result = self.parseAtts( shortcode.atts ),
					elmName = self.getElmName( id );
				// Add content value to the result
				var editContent = self.config( 'shortcode.edit_content', {} );
				if ( !! editContent[ elmName ] ) {
					result[ editContent[ elmName ] ] = '' + shortcode.content;
				}
				return result;
			}
			return {};
		},

		/**
		 * Get shortcode param value by key name
		 *
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 * @param {String} key This is the name of the parameter
		 * @param {Mixed} defaultValue The default value
		 * @return {Mixed}
		 */
		getElmValue: function( id, key, defaultValue ) {
			return this.getElmValues( id )[ key ] || defaultValue;
		},

		/**
		 * Set shortcode's params values
		 *
		 * @param {String} id Shortcode's usbid, e.g. "us_btn:1"
		 * @param {{}} values
		 */
		setElmValues: function( id, values ) {
			var self = this;
			if ( ! self.doesElmExist( id ) || $.isEmptyObject( values ) ) {
				return;
			}

			// Get the shortcode object
			var shortcodeText = self.getElmShortcode( id ),
				shortcode = self.parseShortcode( shortcodeText );
			if ( $.isEmptyObject( shortcode ) ) {
				return;
			}

			// Set new attributes for the shortcode
			shortcode.atts = ' ' + self.buildAtts( $.extend( self.getElmValues( id ), values ) );

			// Apply content changes
			var newContent = ( self.pageData.content || '' )
				.replace(
					// The original shortcode text
					shortcodeText,
					// The converts a shortcode object to a shortcode string
					self.buildShortcode( shortcode )
				);
			self.pageData.content = newContent;
			// Send a signal to update element attributes
			self.trigger( 'contentChange' );
		},

		/**
		 * Cached data as part of the drag and drop process
		 * Note: The method caches data only during the move, after which everything is deleted
		 *
		 * @private
		 * @param {Function} callback The callback function to get the result
		 * @param {String} key The unique key to save data
		 * @param {Mixed} defaultValue The default value if no result
		 * @return {Mixed} Returns the result from the cache or the result of a callback function
		 */
		_cacheDragProcessData: function( callback, key, defaultValue ) {
			var self = this;
			if ( ! $.isFunction( callback ) ) {
				return defaultValue;
			}
			if ( self.isMode( 'drag:add', 'drag:move' ) ) {
				return $usbcore
					.cache( 'dragProcessData' )
					.get( key, callback );
			}
			return callback.call( self );
		},

		/**
		 * Send data to the server using a HTTP POST request
		 *
		 * @param {String} requestId This is a unique id for the request
		 * @param {{}} settings A set of key/value pairs that configure the Ajax request
		 */
		ajax: function( requestId, settings ) {
			var self = this;
			if ( ! requestId || $.isEmptyObject( settings ) ) {
				return;
			}
			/**
			 * @var {{}} Default settings
			 */
			var default_settings = {
				data: {}, // data to be sent to the server
				abort: $.noop, // a function to be called if the request abort
				complete: $.noop, // a function to be called when the request finishes (after success and error callbacks are executed).
				error: $.noop, // a function that will be called if an error occurs in the request
				success: $.noop, // a function to be called if the request succeeds
				successNotify: true // notification output if the response is successful, but the result is an error
			};
			settings = $ush.clone( settings, default_settings )

			// Abort prev request
			if ( ! $ush.isUndefined( self._$temp.xhr[ requestId ] ) ) {
				self._$temp.xhr[ requestId ].abort();
				if ( $.isFunction( settings.abort ) ) {
					settings.abort.call( self, requestId );
				}
			}
			/**
			 * @see https://api.jquery.com/jquery.ajax
			 */
			self._$temp.xhr[ requestId ] = $.ajax({
				data: $.extend( {}, self.config( 'ajaxArgs', {} ), settings.data ),
				dataType: 'json',
				type: 'post',
				url: _window.ajaxurl,
				cache: false,
				/**
				 * Handler to be called if the request succeeds
				 * @see https://api.jquery.com/jquery.ajax/#jQuery-ajax-settings
				 *
				 * @param {{}} res
				 */
				success: function( res ) {
					delete self._$temp.xhr[ requestId ];
					// In case of an error on the backend, we will show notifications with the error text
					if ( ! res.success ) {
						var message = $ush.isUndefined( res.data )
							? 'Invalid `res.data`'
							: res.data.message;
						self.notify( 'XHR: ' + message, _NOTIFY_TYPE_.ERROR );
					}
					if ( $.isFunction( settings.success ) ) {
						settings.success.call( self, res );
					}
				},
				/**
				 * Handler to be called if the request fails
				 * @see https://api.jquery.com/jquery.ajax/#jQuery-ajax-settings
				 */
				error: function( jqXHR, textStatus, errorThrown ) {
					if ( textStatus === 'abort' ) {
						return;
					}
					if ( $.isFunction( settings.error ) ) {
						settings.error.call( self, requestId );
					}
					// The showing request jqXHR errors
					var message = ! errorThrown
						? 'Request was not sent'
						: errorThrown;
					self.notify( 'XHR: ' + message, _NOTIFY_TYPE_.ERROR );
				},
				/**
				 * Handler to be called when the request finishes (after success and error callbacks are executed)
				 * @see https://api.jquery.com/jquery.ajax/#jQuery-ajax-settings
				 */
				complete: function( _, textStatus ) {
					if ( textStatus === 'abort' ) {
						return;
					}
					if ( $.isFunction( settings.complete ) ) {
						settings.complete.call( self, requestId, textStatus );
					}
				}
			});
		},

		/**
		 * Rendered shortcode
		 *
		 * @private
		 * @param {String} requestId The request id
		 * @param {{}} settings A set of key/value pairs that configure the Ajax request
		 */
		_renderShortcode: function( requestId, settings ) {
			var self = this;
			if ( ! requestId || $.isEmptyObject( settings ) ) {
				return;
			}
			if ( ! $.isPlainObject( settings.data ) ) {
				settings.data = {};
			}
			// Add required settings
			$.extend( settings.data, {
				_nonce: self.config( '_nonce' ),
				action: self.config( 'action_render_shortcode' )
			} );
			// Content preparation
			if ( $ush.isUndefined( settings.data.content ) ) {
				settings.data.content = '';
			} else {
				settings.data.content += ''; // to string
			}
			// Send a request to the server
			self.ajax( requestId, settings );
		},

		/**
		 * Controls the number of columns in a row
		 *
		 * @param {String} id Shortcode's usbid, e.g. "vc_row:1"
		 * @param {String} layout The layout
		 */
		_updateColumnsLayout: function( rowId, layout ) {
			// Exclusion of custom settings, since we do not change the rows, but only apply `--custom-columns`
			if ( 'custom' === layout ) {
				return;
			}
			var self = this,
				columns = self.getElmChildren( rowId ),
				columnsCount = columns.length,
				renderNeeded = false,
				columnType = self.isRow( rowId ) ? 'vc_column' : 'vc_column_inner',
				newColumnsWidths = [],
				newColumnsWidthsBase = 0,
				newColumnsWidthsTmp,
				newColumnsCount;

			// Make sure layout has the string type, so our checks will be performed right way
			layout = '' + layout;

			// Parse layout value into columns array
			// Complex layout with all column widths specified
			if ( layout.indexOf( '-' ) > - 1 ) {
				newColumnsWidthsTmp = layout.split( '-' );
				newColumnsCount = newColumnsWidthsTmp.length;
				// Calculate columns width base
				for ( var i = 0; i < newColumnsCount; i ++ ) {
					newColumnsWidthsBase += $ush.parseInt( newColumnsWidthsTmp[ i ] );
				}
				// Calculate and assign columns widths
				for ( var i = 0; i < newColumnsCount; i ++ ) {
					var columnWidthBaseTmp = newColumnsWidthsBase / newColumnsWidthsTmp[ i ];
					// Try to transform width to a simple value (for example 2/4 will be transformed to 1/2)
					if ( columnWidthBaseTmp % 1 === 0 ) {
						newColumnsWidths.push( '1/' + columnWidthBaseTmp );
					} else {
						newColumnsWidths.push( newColumnsWidthsTmp[ i ] + '/' + newColumnsWidthsBase );
					}
				}
				// Simple layout with column number only
			} else {
				newColumnsCount = $ush.parseInt( layout );
				for ( var i = 0; i < newColumnsCount; i ++ ) {
					newColumnsWidths.push( '1/' + layout );
				}
			}

			// Add new columns if needed
			if ( columnsCount < newColumnsCount ) {
				for ( var i = columnsCount; i < newColumnsCount; i ++ ) {
					var newColumnId = self.getSpareElmId( columnType );
					self._addShortcodeToContent( rowId, i, '[' + columnType + ' usbid="' + newColumnId + '"][/' + columnType + ']' );
				}
				columnsCount = newColumnsCount;
				// Wee need to render newly added columns
				renderNeeded = true;
				// Trying to remove extra columns if needed (only empty columns may be removed)
			} else if ( columnsCount > newColumnsCount ) {
				var columnsCountDifference = columnsCount - newColumnsCount;
				for ( var i = columnsCount - 1; ( i >= 0 ) && ( columnsCountDifference > 0 ); i -- ) {
					var columnChildren = self.getElmChildren( columns[ i ] );
					if ( columnChildren.length === 0 ) {
						self.removeElm( columns[ i ] );
						columnsCountDifference--;
					}
				}
				columnsCount = newColumnsCount + columnsCountDifference;
			}

			// Refresh columns list
			columns = self.getElmChildren( rowId );

			// Send a signal to add new columns
			self.trigger( 'contentChange' );

			// Set new widths for columns
			for ( var i = 0; i < columnsCount; i ++ ) {
				self.setElmValues( columns[ i ], { width: newColumnsWidths[ i % newColumnsWidths.length ] } );
			}

			if ( renderNeeded ) {
				// Add temporary loader
				self.postMessage( 'showPreloader', rowId );

				// Render updated shortcode
				self._renderShortcode( /* request id */'_renderShortcode', {
					data: {
						content: self.getElmShortcode( rowId )
					},
					success: function( res ) {
						if ( res.success ) {
							self.postMessage( 'updateSelectedElm', [ rowId, '' + res.data.html ] );
						}
					}
				} );
			}
		},

		/**
		 * Get the insert position
		 *
		 * @private
		 * @param {String} parent Shortcode's usbid, e.g. "us_btn:1" or "container"
		 * @param {Number} index Position of the element inside the parent
		 * @return {{}} Object with new data
		 */
		getInsertPosition: function( parent, index ) {
			var position,
				self = this,
				isRootElmContainer = self.isElmContainer( parent );
			// Index check and position determination
			index = $ush.parseInt( index );
			// Position definitions within any containers
			if ( self.isMainContainer( parent ) || isRootElmContainer ) {
				var children = self.getElmChildren( parent );
				if ( index === 0 || children.length === 0 ) {
					position = 'prepend'
				} else if ( index > children.length || children.length === 1 ) {
					index = children.length;
					position = 'append';
				} else {
					parent = children[ index - 1 ] || parent;
					position = 'after';
				}
			} else {
				position = ( index < 1 ? 'before' : 'after' );
			}
			return {
				position: position,
				parent: parent
			}
		},

		/**
		 * Add shortcode to a given position
		 *
		 * @private
		 * @param {String} parent Shortcode's usbid, e.g. "us_btn:1"
		 * @param {Number} index Position of the element inside the parent
		 * @param {String} newShortcode The new shortcode
		 * @return {Boolean} True if successful, False otherwise
		 */
		_addShortcodeToContent: function( parent, index, newShortcode ) {
			var self = this;
			// Check the correctness of the data in the variables
			if (
				! newShortcode
				|| ! ( self.isValidId( parent ) || self.isMainContainer( parent ) )
			) {
				return false;
			}

			// Get the insert position
			var insertPosition = self.getInsertPosition( parent, index );
				parent = insertPosition.parent;
			// Get old data
			var insertShortcode = '',
				isMainContainer = self.isMainContainer( parent ),
				oldShortcode = ! isMainContainer
					? self.getElmShortcode( parent )
					: self.pageData.content || '',
				elmType = ! isMainContainer
					? self.getElmType( parent )
					: '';

			// Remove html from start and end
			oldShortcode = self.removeHtmlWrap( oldShortcode );

			// Check the position for the root element, if the position is before or after then add the element to the `prepend`
			var position = insertPosition.position;
			if ( isMainContainer ) {
				position = $usbcore.indexOf( position, [ 'before', 'after'] ) > -1
					? 'container:prepend'
					: 'container:' + position;
			}

			// Create new shortcode
			switch ( position ) {
				case 'before':
				case 'container:prepend':
					insertShortcode = newShortcode + oldShortcode;
					break;
				case 'prepend':
					insertShortcode = oldShortcode
						.replace( new RegExp( '^(\\['+ elmType +'.*?[\\^\\]]+)' ), "$1" + newShortcode.replace( '$1', '&dollar;1' ) );
					break;
				case 'append':
					if ( self.parseShortcode( oldShortcode ).hasClosingTag ) {
						insertShortcode = oldShortcode
							.replace( new RegExp( '(\\[\\/'+ elmType +'\])$' ), newShortcode.replace( '$1', '&dollar;1' ) + "$1" )

					} else {
						insertShortcode = oldShortcode + newShortcode;
					}
					break;
				case 'after':
				case 'container:append':
				default:
					insertShortcode = oldShortcode + newShortcode;
			}

			// Update content variable
			self.pageData.content = ( '' + self.pageData.content ).replace( oldShortcode, insertShortcode );
			return true;
		},

		/**
		 * Add row wrapper for passed content
		 *
		 * @private
		 * @param {String} content The content
		 * @return {String}
		 */
		_addRowWrapper: function( content ) {
			var self = this;
			// Convert pattern to string from result
			return self.buildString(
				self.config( 'template.vc_row', '' ),
				// The values for variables `{%var_name%}`
				{
					vc_row: self.getSpareElmId( 'vc_row' ),
					vc_column: self.getSpareElmId( 'vc_column' ),
					content: ''+content
				}
			);
		},

		/**
		 * Get the default content
		 * Note: Get content by default has been moved to a separate method to unload and simplify methods
		 *
		 * @private
		 * @param {String} elmType The elm type
		 * @return {String} The default content
		 */
		_getDefaultContent: function( elmType ) {
			var self = this,
				// Child type, if any for the current `elmType`
				child,
				// Get settings for shortcodes
				shortcodeSettings = self.config( 'shortcode', {} ),
				/**
				 * Get the default content
				 *
				 * @private
				 * @param {String} type The type
				 * @return {String} The default content
				 */
				_getDefaultContent = function( type ) {
					var defaultValues = ( shortcodeSettings.default_values || {} )[ type ] || false,
						editContent = ( shortcodeSettings.edit_content || {} )[ type ] || false;
					if ( editContent && defaultValues && defaultValues[ editContent ] ) {
						return defaultValues[ editContent ];
					}
					return '';
				};
			// Determine the descendant if any
			var asChild = $.extend( {}, shortcodeSettings.relations.as_child || {} );
			for ( var k in asChild ) {
				if ( ( ( asChild[ k ][ 'only' ] || '' ).split( ',' ) ).indexOf( elmType ) > -1 ) {
					child = k;
					break;
				}
			}
			if ( ! child ) {
				return _getDefaultContent( elmType );
			}

			// Add elements for tab structures
			if ( self.isElmSection( child ) ) {

				// Get a title template for a section
				var titleTemplate = self.getTextTranslation( 'section' ),

				// Get parameters for a template
				params = {
					title_1: ( titleTemplate + ' 1' ),
					title_2: ( titleTemplate + ' 2' ),
					vc_column_text: self.getSpareElmId( 'vc_column_text' ),
					vc_column_text_content: _getDefaultContent( 'vc_column_text' ),
					vc_tta_section_1: self.getSpareElmId( /* vc_tta_section */child ),
					vc_tta_section_2: self.getSpareElmId( /* vc_tta_section */child )
				};
				// Build shortcode
				return self.buildString( self.config( 'template.' + /* vc_tta_section */child, '' ), params );

				// Add an empty element with no content
			} else {
				return '['+ child +' usbid="'+ self.getSpareElmId( child ) +'"][/'+ child +']';
			}
		},

		/**
		 * Create and add a new element
		 *
		 * @param {String} type The element type
		 * @param {String} parent The parent id
		 * @param {Number} index Position of the element inside the parent
		 * @param {{}} values The element values
		 * @param {Function} callback The callback
		 * @return {Mixed}
		 */
		createElm: function( type, parent, index, values, callback ) {
			var self = this,
				args = arguments,
				isMainContainer = self.isMainContainer( parent );

			if (
				! type
				|| ! parent
				|| ! ( self.isValidId( parent ) || isMainContainer )
			) {
				self._debugLog( 'Error: Invalid params', args );
				return;
			}

			// Check parents and prohibit invest in yourself
			if ( self.hasSameTypeParent( type, parent ) ) {
				self._debugLog( 'Error: It is forbidden to add inside the same type', args );
				return;
			}

			// The hide all highlights
			self.postMessage( 'doAction', 'hideHighlight' );

			// Index check and position determination
			index = $ush.parseInt( index );

			// If there is no parent element, add the element to the `container`
			if ( ! isMainContainer && ! self.doesElmExist( parent ) ) {
				parent = self.mainContainer;
				index = 0;
			}

			var elmId = self.getSpareElmId( type ),
				// Get name from ID
				elmName = self.getElmName( elmId ),
				// Get insert position
				insert = self.getInsertPosition( parent, index );

			// Validate Values
			if ( ! values || $.isEmptyObject( values ) ) {
				values = {};
				// Fix for group default values
				var defaultValues = self.config( 'shortcode.default_values.' + elmName, false );
				if ( defaultValues ) {
					for ( var _attr in defaultValues ) {
						if ( defaultValues.hasOwnProperty( _attr ) && _attr !== 'content' ) {
							values[ _attr ] = defaultValues[ _attr ];
						}
					}
				}
			}

			var // Create shortcode string
				buildShortcode = self.buildShortcode({
					tag: type,
					atts: self.buildAtts( $.extend( { usbid: elmId }, values ) ),
					content: self._getDefaultContent( elmName ),
					hasClosingTag: ( self.isElmContainer( elmName ) || !! self.config( 'shortcode.edit_content.' + elmName ) )
				} );

			// The check if the element is not the root container and is added to the main container,
			// then add a wrapper `vc_row`. It is forbidden to add elements without a line to the root container!
			if (
				self.isMainContainer( parent )
				&& ! self.isRow( elmId )
				&& ! self.isTemplateImport( type )
			) {
				buildShortcode = self._addRowWrapper( buildShortcode );
			}

			// Added shortcode to content
			if ( ! self._addShortcodeToContent( parent, index, buildShortcode ) ) {
				return false;
			}

			// Get html shortcode code and set on preview page
			self.postMessage( 'showPreloader', [
				insert.parent,
				insert.position,
				// If these values are true, then a container class will be added for customization
				/* isContainer */self.isElmContainer( type )
			] );
			// Get a rendered shortcode
			self._renderShortcode( /* request id */'_renderShortcode', {
				data: {
					content: buildShortcode
				},
				success: function( res ) {
					self.postMessage( 'hidePreloader', insert.parent );
					if ( res.success ) {
						// Add new shortcde to preview page
						self.postMessage( 'insertElm', [ insert.parent, insert.position, '' + res.data.html ] );
						// Init its JS if needed
						self.postMessage( 'maybeInitElmJS', [ elmId ] );

						// Send a signal to create a new element
						self.trigger( 'contentChange' );

						// Commit to save changes to history
						self.commitChangeToHistory( elmId, _CHANGED_ACTION_.CREATE );
					}
					if ( $.isFunction( callback ) ) {
						// This callback function from method arguments which will be called
						// after add the new element
						callback.call( self, elmId );
					}
				}
			} );

			return elmId;
		},

		/**
		 * Move the element to a new position
		 *
		 * @param {String} moveId ID of the element that is being moved, e.g. "us_btn:1"
		 * @param {String} newParent ID of the element's new parent element
		 * @param {Number} newIndex Position of the element inside the new parent
		 * @return {Boolean}
		 */
		moveElm: function( moveId, newParent, newIndex ) {
			var self = this,
				args = arguments;
			if ( self.isMainContainer( moveId ) ) {
				self._debugLog( 'Error: Cannot move the container', args );
				return false;
			}
			var isMainContainer = self.isMainContainer( newParent );

			// Check parents and prohibit invest in yourself
			if ( self.hasSameTypeParent( moveId, newParent ) ) {
				self._debugLog( 'Error: It is forbidden to add inside the same type', args );
				return;
			}

			// Check the correctness of ids
			if (
				! self.isValidId( moveId )
				|| ! ( self.isValidId( newParent ) || isMainContainer )
			) {
				self._debugLog( 'Error: Invalid ID specified', args );
				return false;
			}
			if (
				! self.doesElmExist( moveId )
				|| ! ( self.doesElmExist( newParent ) || isMainContainer )
			) {
				self._debugLog( 'Error: Element doesn\'t exist', args );
				return false;
			}

			// Index check and position determination
			newIndex = $ush.parseInt( newIndex );

			// The hide all highlights
			self.postMessage( 'doAction', 'hideHighlight' );

			// If there is no newParent element, add the element to the `container`
			if ( ! isMainContainer && ! self.doesElmExist( newParent ) ) {
				newParent = self.mainContainer;
				newIndex = 0;
			}

			// Commit to save changes to history
			self.commitChangeToHistory( moveId, _CHANGED_ACTION_.MOVE );

			// Get old shortcode and remove in content
			var oldShortcode = self.getElmShortcode( moveId );
			self.pageData.content = ( '' + self.pageData.content )
				.replace( oldShortcode, '' );

			// Get parent position
			var insert = self.getInsertPosition( newParent, newIndex );

			// Added shortcode to content
			if ( ! self._addShortcodeToContent( newParent, newIndex, oldShortcode ) ) {
				return false;
			}

			// Move element on preview page
			self.postMessage( 'moveElm', [ insert.parent, insert.position, moveId ] );

			// Send a signal to move element
			self.trigger( 'contentChange' );

			return true;
		},

		/**
		 * Remove the element
		 *
		 * @param {String} removeId ID of the element that is being removed, e.g. "us_btn:1"
		 * @return {Boolean}
		 */
		removeElm: function( removeId ) {
			var self = this;
			if ( ! self.isValidId( removeId ) ) {
				return false;
			}
			// Remove element from preview
			self.postMessage( 'removeHtmlById', removeId );
			var selectedElmId = self.selectedElmId,
				allChildren = self.getElmAllChildren( removeId ),
				rootContainerId;
			// Get the root container to send the change event
			if ( self.isColumn( removeId ) ) {
				rootContainerId = self.getElmParentId( removeId );
			}

			// Commit to save changes to history
			self.commitChangeToHistory( removeId, _CHANGED_ACTION_.REMOVE );

			// Remove shortcode from content
			self.pageData.content = ( '' + self.pageData.content )
				.replace( self.getElmShortcode( removeId ), '' );

			// Send a signal to remove element
			self.trigger( 'contentChange' );
			if ( rootContainerId ) {
				// The private handler is called every time the column/column_inner in change
				self._vcColumnChange( rootContainerId );
			}

			if (
				selectedElmId
				&& (
					removeId == selectedElmId
					|| allChildren.indexOf( selectedElmId ) > -1
				)
			) {
				self.panelShowAddElms(); // show the section "Add elements"
			}

			// Remove an elm via navigator if it is there
			self.navigatorRemoveElm( removeId );

			return true;
		}
	} );

	$( function() {
		_window.$usb = new USBuilder( /* main container */'#usb-wrapper' );
	} );
}( jQuery );
