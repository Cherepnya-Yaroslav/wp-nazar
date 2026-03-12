<?php defined( 'ABSPATH' ) OR die( 'This script cannot be accessed directly.' );

if ( ! function_exists( 'usof_apply_assets_fallback' ) ) {
	/*
	 * Starting from version 7.5 'assets' option will have a new format.
	 * In this function we will provide a fallback for it.
	 */
	function usof_apply_assets_fallback( $value ) {

		// If value is set for the option and we detect it is in old format, we should transform it.
		if ( is_array( $value ) AND ( reset( $value ) !== 0 ) AND ( reset( $value ) !== 1 ) ) {
			$assets_config = us_config( 'assets', array() );
			$new_value = array();

			// First check / uncheck assets from older versions
			foreach ( $assets_config as $component => $component_atts ) {
				if ( empty( $component_atts['title'] ) ) {
					continue;
				}
				$new_value[ $component ] = in_array( $component, $value ) ? 1 : 0;
			}

			// Then force check assets added since 7.5
			$new_assets = array(
				'grid_filter',
				'grid_templates',
				'grid_pagination',
				'grid_popup',
				'hor_parallax',
				'hwrapper',
				'image_gallery',
				'image_slider',
				'magnific_popup',
				'post_elements',
				'post_navigation',
				'simple_menu',
				'text',
				'ver_parallax',
				'vwrapper',
				'wp_widgets',
			);
			foreach ( $new_assets as $component ) {
				$new_value[ $component ] = 1;
			}

			return $new_value;
		}

		// If value is empty or format is OK return it as is
		return $value;
	}
}

if ( ! function_exists( 'us_get_page_for_posts' ) ) {
	/*
	 * Includes fallback for an old USOF option before versions 8.16
	 * https://github.com/upsolution/wp/issues/3345
	 */
	function us_get_page_for_posts() {

		// Return the old value if exists
		if ( us_get_option( 'posts_page' ) ) {
			return (string) us_get_option( 'posts_page' );
		}

		return get_option( 'page_for_posts' );
	}
}

if ( ! function_exists( 'usof_apply_posts_page_fallback' ) ) {
	/*
	 * Starting from version 8.16 we need to move the "Posts Page" after saving Theme Options
	 * https://github.com/upsolution/wp/issues/3345
	 */
	function usof_apply_posts_page_fallback( $usof_options ) {

		// Trigger this fallback only if the old option exists
		if ( isset( $usof_options['posts_page'] ) ) {

			// Check if pages are set in both options and they aren't the same and they exist
			if (
				$usof_options['posts_page'] != 'default'
				AND $_wp_posts_page_ID = get_option( 'page_for_posts' )
				AND $_wp_posts_page_ID != $usof_options['posts_page']
				AND $_wp_posts_page = get_post( $_wp_posts_page_ID )
				AND get_post( $usof_options['posts_page'] )
			) {
				// Delete the WP posts page first to avoid duplicating slugs
				wp_delete_post( $_wp_posts_page_ID, TRUE );

				// Update the theme posts page to keep its content
				wp_update_post(
					array(
						'ID' => $usof_options['posts_page'],
						'post_title' => $_wp_posts_page->post_title,
						'post_name' => $_wp_posts_page->post_name,
					)
				);

				// Remove unneeded variables
				unset( $_wp_posts_page, $_wp_posts_page_ID );

				// Update the Reading option
				update_option( 'page_for_posts', $usof_options['posts_page'] );
			}

			// Remove the old option value
			unset( $usof_options['posts_page'] );
		}

		return $usof_options;
	}

	add_filter( 'usof_updated_options', 'usof_apply_posts_page_fallback' );
}

if ( ! function_exists( 'usof_apply_fallback_for_options' ) ) {
	function usof_apply_fallback_for_options( $usof_options ) {

		// Fallback for Optimize CSS and JS option (after version 7.5)
		if ( isset( $usof_options['assets'] ) ) {
			$usof_options['assets'] = usof_apply_assets_fallback( $usof_options['assets'] );
		}

		// Fallback for versions before 8.0
		if ( isset( $usof_options['disable_block_editor_assets'] ) ) {

			// Turn off the "Disable legacy HTML" (but it will keep enabled on new installations)
			$usof_options['grid_columns_layout'] = 0;

			// Turn on the "Gutenberg (block editor)" module, if it was enabled
			if ( ! $usof_options['disable_block_editor_assets'] ) {
				$usof_options['block_editor'] = 1;
			}
			unset( $usof_options['disable_block_editor_assets'] );
		}

		// Fallback for Button Styles
		if ( ! empty( $usof_options['buttons'] ) AND is_array( $usof_options['buttons'] ) ) {
			foreach ( $usof_options['buttons'] as $key => $_params ) {
				if ( isset( $_params['shadow'] ) ) {
					$usof_options['buttons'][ $key ]['shadow_offset_v'] = ( (float) $_params['shadow'] / 2 ) . 'em';
					$usof_options['buttons'][ $key ]['shadow_blur'] = $_params['shadow'];

					unset( $usof_options['buttons'][ $key ]['shadow'] );
				}
				if ( isset( $_params['shadow_hover'] ) ) {
					$usof_options['buttons'][ $key ]['shadow_hover_offset_v'] = ( (float) $_params['shadow_hover'] / 2 ) . 'em';
					$usof_options['buttons'][ $key ]['shadow_hover_blur'] = $_params['shadow_hover'];

					unset( $usof_options['buttons'][ $key ]['shadow_hover'] );
				}
			}
		}

		// Fallback for H1 - H6 transform checkboxes
		for ( $i = 1; $i <= 6; $i ++ ) {
			if ( isset( $usof_options[ 'h' . $i . '_transform' ] ) ) {

				if ( is_array( $usof_options[ 'h' . $i . '_transform' ] ) ) {
					$usof_options[ 'h' . $i . '_transform' ] = implode( ',', $usof_options[ 'h' . $i . '_transform' ] );
				}

				// Above 8.6 version
				if ( strpos( $usof_options[ 'h' . $i . '_transform' ], 'uppercase' ) !== FALSE ) {
					$usof_options[ 'h' . $i . '_texttransform' ] = 'uppercase';
				}
				if ( strpos( $usof_options[ 'h' . $i . '_transform' ], 'italic' ) !== FALSE ) {
					$usof_options[ 'h' . $i . '_fontstyle' ] = 'italic';
				}

				unset( $usof_options[ 'h' . $i . '_transform' ] );
			}
		}

		return $usof_options;
	}

	add_filter( 'usof_load_options_once', 'usof_apply_fallback_for_options' );
}