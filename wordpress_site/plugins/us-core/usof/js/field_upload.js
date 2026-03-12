/**
 * USOF Field: Upload
 */
! function( $, undefined ) {
	var _window = window,
		_document = document;

	if ( _window.$usof === undefined ) {
		return;
	}

	$usof.field[ 'upload' ] = {

		init: function( options ) {
			this.attachmentAtts = {};
			this.parentInit( options );
			this.$upload = $( '.usof-upload', this.$row );
			this.previewType = this.$upload.usMod( 'preview' );
			this.isMultiple = this.$upload.hasClass( 'is_multiple' );
			this.thumbSize = ( this.isMultiple ) ? 'thumbnail' : 'medium';
			this.$btnAdd = $( '.ui-icon_add', this.$row );
			this.$previewContainer = $( '.usof-upload-preview', this.$row );
			this.placeholder = $( 'input[name="placeholder"]', this.$row ).val();
			this.$btnAdd.on( 'click', this.openMediaUploader.bind( this ) );

			var $i18n = $( '.usof-upload-i18n', this.$row );
			this.i18n = {};
			if ( $i18n.length > 0 ) {
				this.i18n = $i18n[ 0 ].onclick() || {};
				$i18n.remove();
			}

			this._initDynamicBtns();

			if ( this.isMultiple && this.previewType === 'image' ) {
				this.$dragshadow = $( '<div class="usof-dragshadow"></div>' );
				this.$body = $( _document.body );
				this.$window = $( _window );

				this._events = {
					_maybeDragMove: this._maybeDragMove.bind( this ),
					_dragMove: this._dragMove.bind( this ),
					_dragEnd: this._dragEnd.bind( this )
				};

				this.$row
					.on( 'mousedown', '.usof-upload-preview-file', this._dragStart.bind( this ) )
					// Preventing browser native drag event
					.on( 'dragstart', function( e ) {
						e.preventDefault();
					} );
			}
		},

		_initDynamicBtns: function() {
			this.$btnsDeleteImage = $( '.ui-icon_delete', this.$row );
			this.$btnsDeleteImage.on( 'click', function( e ) {
				var $target = $( e.target ),
					$img = $target.closest( '.usof-upload-preview-file' ),
					imgID = ( $img.attr( 'data-id' ) ) ? $img.attr( 'data-id' ) : null;
				if ( imgID ) {
					var value = this.getValue().trim().split( ',' );
					if ( $.inArray( imgID, value ) !== -1 ) {
						value.splice( $.inArray(imgID, value), 1 );
						$img.remove();

						if ( value.length ) {
							this.parentSetValue( value );
						} else {
							this.setValue( '' )
						}
					}
				}
			}.bind( this ) );

			// Open Media uploader for single file via click on it
			if ( ! this.isMultiple ) {
				$previewItem = $( '.usof-upload-preview-file', this.$previewContainer );
				if ( $previewItem.length ) {
					$previewItem.on( 'click', this.openMediaUploader.bind( this ) );
				}
			}
		},

		// Drag'n'drop functions
		_dragStart: function( e ) {
			// Prevent drag event start when clicked on delete icon inside image element
			if ( this._hasClass( e.target, 'ui-icon_delete' ) ) {
				return;
			}
			e.stopPropagation();
			this.$draggedElm = $( e.target ).closest( '.usof-upload-preview-file' );
			this.detached = false;
			this._updateBlindSpot( e );
			this.elmPointerOffset = [ parseInt( e.pageX ), parseInt( e.pageY ) ];
			this.$body.on( 'mousemove', this._events._maybeDragMove );
			this.$window.on( 'mouseup', this._events._dragEnd );
		},

		_updateBlindSpot: function( e ) {
			this.blindSpot = [ e.pageX, e.pageY ];
		},

		_isInBlindSpot: function( e ) {
			return Math.abs( e.pageX - this.blindSpot[ 0 ] ) <= 20 && Math.abs( e.pageY - this.blindSpot[ 1 ] ) <= 20;
		},

		_maybeDragMove: function( e ) {
			e.stopPropagation();
			if ( this._isInBlindSpot( e ) ) {
				return;
			}
			this.$body.off( 'mousemove', this._events._maybeDragMove );
			this._detach();
			this.$body.on( 'mousemove', this._events._dragMove );
		},

		_detach: function( e ) {
			var offset = this.$draggedElm.offset();
			this.elmPointerOffset[ 0 ] -= offset.left;
			this.elmPointerOffset[ 1 ] -= offset.top;
			this.$dragshadow.css( {
				width: this.$draggedElm.outerWidth(),
				height: this.$draggedElm.outerHeight()
			} ).insertBefore( this.$draggedElm );
			this.$draggedElm.css( {
				position: 'absolute',
				'pointer-events': 'none',
				zIndex: 10000,
				width: this.$draggedElm.width(),
				height: this.$draggedElm.height()
			} ).css( offset ).appendTo( this.$body );
			this.detached = true;
		},

		_dragMove: function( e ) {
			e.stopPropagation();
			this.$draggedElm.css( {
				left: e.pageX - this.elmPointerOffset[ 0 ],
				top: e.pageY - this.elmPointerOffset[ 1 ]
			} );
			if ( this._isInBlindSpot( e ) ) {
				return;
			}
			var elm = e.target;
			// Checking two levels up
			for ( var level = 0; level <= 2; level ++, elm = elm.parentNode ) {
				if ( this._isShadow( elm ) ) {
					return;
				}

				var parentType;
				if ( this._isSortable( elm ) ) {
					// Dropping element before or after sortables based on their relative position in DOM
					var nextElm = elm.previousSibling,
						shadowAtLeft = false;
					while ( nextElm ) {
						if ( nextElm == this.$dragshadow[ 0 ] ) {
							shadowAtLeft = true;
							break;
						}
						nextElm = nextElm.previousSibling;
					}
					this.$dragshadow[ shadowAtLeft ? 'insertAfter' : 'insertBefore' ]( elm );
					this._dragDrop( e );
					break;

				}
			}
		},

		_dragDrop: function( e ) {
			this._updateBlindSpot( e );
		},

		_dragEnd: function( e ) {
			this.$body.off( 'mousemove', this._events._maybeDragMove ).off( 'mousemove', this._events._dragMove );
			this.$window.off( 'mouseup', this._events._dragEnd );
			if ( this.detached ) {
				this.$draggedElm.removeAttr( 'style' ).insertBefore( this.$dragshadow );
				this.$dragshadow.detach();
				//this.$editor.removeClass( 'dragstarted' );
				// Saving the new element position
				var value = [],
					items = $( '.usof-upload-preview-file', this.$previewContainer ).toArray() || [];

				for ( var k in items ) {
					if ( items[ k ].hasAttribute( 'data-id' ) ) {
						value.push( items[ k ].getAttribute( 'data-id' ) );
					}
				}
				if ( value.length ) {
					this.parentSetValue( value );
				} else {
					this.setValue( '' )
				};

			}
		},

		_hasClass: function( node, className ) {
			return ( ' ' + node.className + ' ' ).indexOf( ' ' + className + ' ' ) > - 1;
		},

		_isShadow: function( elm ) {
			return this._hasClass( elm, 'usof-dragshadow' );
		},

		_isSortable: function( elm ) {
			return this._hasClass( elm, 'usof-upload-preview-file' );
		},

		/**
		 * Set the value
		 *
		 * @param {String} value The value
		 * @param {Boolean} quiet The quiet mode
		 */
		setValue: function( value, quiet ) {
			if ( value == '' ) {
				if ( this.previewType === 'image' && this.placeholder !== undefined ) {
					this.$previewContainer.html(
						'<div class="usof-upload-preview-file">'
						+ '<img src="' + this.placeholder + '" alt="" />'
						+ '</div>' );
				} else {
					this.$previewContainer.html( '' );
					this.$previewContainer.addClass( 'hidden' );
				}

				this._initDynamicBtns();
			} else {
				var files;
				if ( ! this.isMultiple ) {
					files = [value];
				} else {
					files = value;
					if ( typeof files === 'string' ) {
						if ( files.indexOf( ',' ) !== -1 ) {
							files = files.trim().split( ',' );
						} else {
							files = [files];
						}
					}
				}
				this.$previewContainer.html( '' );
				$.each( files, function( index, file ) {
					file = file.toString();
					var attachment = wp.media.attachment( parseInt( file ) ),
						renderAttachmentImage = function() {
							var src = attachment.attributes.url;
							if ( attachment.attributes.sizes !== undefined ) {
								var size = ( attachment.attributes.sizes[ this.thumbSize ] !== undefined ) ? this.thumbSize : 'full';
								src = attachment.attributes.sizes[ size ].url;
							}
							// Check if the preview container doesn't have this image loaded already - for WPBakery
							if ( $( '.usof-upload-preview-file[data-id="' + file + '"]', this.$previewContainer ).length ) {
								return;
							}
							var html = this.$previewContainer.html()
								+ '<div class="usof-upload-preview-file" data-id="' + file + '">';
							if ( this.previewType == 'image' ) {
								html = html + '<img src="' + src + '" alt="">';
							} else if ( this.previewType == 'text' ) {
								html = html + '<span>' + this._baseName( src ) + '</span>';
							}
							html = html
								+ '<div class="ui-icon_delete" title="' + this.i18n.delete + '"></div>'
								+ '</div>';
							this.$previewContainer.html( html );
							this.$previewContainer.removeClass( 'hidden' );
							this._initDynamicBtns();
						}.bind( this );
					if ( attachment.attributes.url !== undefined ) {
						renderAttachmentImage();
					} else if ( ( /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i ).test( file ) ) {
						// TODO move duplicate code to separate function
						var html = this.$previewContainer.html()
							+ '<div class="usof-upload-preview-file" data-id="-1">';
						if ( this.previewType == 'image' ) {
							html = html + '<img src="' + file + '" alt="">';
						} else if ( this.previewType == 'text' ) {
							html = html + '<span>' + this._baseName( file ) + '</span>';
						}
						html = html
							+ '</div>';
						this.$previewContainer.html( html );
						this.$previewContainer.removeClass( 'hidden' );
						this._initDynamicBtns();
					} else {
						// Loading missing data via ajax
						attachment.fetch( { success: renderAttachmentImage } );
					}
				}.bind( this ) );
			}
			this.parentSetValue( value, quiet );
		},

		/**
		 * Opens a media uploader
		 */
		openMediaUploader: function() {
			if ( this.frame === undefined ) {
				var mediaSettings = {
					multiple: false,
				};
				if ( this.previewType == 'image' ) {
					mediaSettings.library = { type: 'image' };
				}
				if ( this.isMultiple ) {
					mediaSettings.multiple = 'add';
				}
				this.frame = wp.media( mediaSettings );
				this.frame.on( 'open', function() {
					var value;
					this.frame.state().get( 'selection' ).reset();
					if ( this.isMultiple ) {
						value = this.getValue().trim().split( ',' );
						$.each( value, function( index, file ) {
							var fileID = parseInt( file );
							if ( fileID ) {
								this.frame.state().get( 'selection' ).add( wp.media.attachment( fileID ) );
							}
						}.bind( this ) );
					} else {
						value = parseInt( this.getValue() );
						if ( value ) {
							this.frame.state().get( 'selection' ).add( wp.media.attachment( value ) );
						}
					}
				}.bind( this ) );
				this.frame.on( 'select', function() {
					if ( this.isMultiple ) {
						var attachments = [];
						this.frame.state().get( 'selection' ).each( function( attachment ) {
							if ( !! attachment.attributes.url ) {
								attachments.push( attachment.id );
							}
						} );
						this.setValue( attachments );
					} else {
						var attachment = this.frame.state().get( 'selection' ).first();
						if ( !! attachment.attributes.url ) {
							this.attachmentAtts = attachment.attributes;
							this.setValue( attachment.id, false );
						}
					}
				}.bind( this ) );
			}
			this.frame.open();
		},

		/**
		 * Returns trailing name component of path
		 *
		 * @param {String} path The path
		 * @return {String}
		 */
		_baseName: function( path ) {
			return ( '' + path ).substring( path.lastIndexOf( '/' ) + 1 );
		}
	};
}( jQuery );
