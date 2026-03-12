<?php defined( 'ABSPATH' ) OR die( 'This script cannot be accessed directly.' );

/**
 * About admin page
 */

if ( ! defined( 'US_CORE_VERSION') ) {
	add_action( 'admin_menu', 'us_add_info_home_page_parent', 9 );
	function us_add_info_home_page_parent() {
		add_menu_page( US_THEMENAME . ': ' . us_translate_x( 'About', 'personal data group label' ), apply_filters( 'us_theme_name', US_THEMENAME ), 'manage_options', 'us-home', 'us_welcome_page', NULL, '59.001' );
	}

	add_action( 'admin_menu', 'us_add_info_home_page', 15 );
} else {
	add_action( 'admin_menu', 'us_add_info_home_page', 50 );
}

function us_add_info_home_page() {
	if ( ! defined( 'US_CORE_VERSION') ) {
		$parent_slug = 'us-home';
	} else {
		$parent_slug = 'us-theme-options';
	}
	add_submenu_page( $parent_slug, US_THEMENAME . ': ' . us_translate_x( 'About', 'personal data group label' ), us_translate_x( 'About', 'personal data group label' ), 'manage_options', 'us-home', 'us_welcome_page' );
}

function us_welcome_page() {
	global $help_portal_url;

	/**
	 * @var string The current host
	 */
	$domain = parse_url( site_url(), PHP_URL_HOST );

	/**
	 * @var string The path to which the 'help' server will respond
	 */
	$return_url = admin_url( 'admin.php?page=us-home' );

	/**
	 * @var array HTTP GET variables
	 */
	$get_variables = array(
		'secret' => '',
		'domain' => $domain,
		'version' => US_THEMEVERSION,
	);

	if ( isset( $_GET['activation_action'] ) AND $_GET['activation_action'] == 'activate' ) {

		if ( ! empty( $_GET['secret'] ) ) {
			$get_variables['secret'] = (string) $_GET['secret'];
		}

		// Get license data
		$us_api_response = us_api( '/envato_auth', $get_variables, US_API_RETURN_ARRAY );
		if (
			is_array( $us_api_response )
			AND isset( $us_api_response['status'] )
			AND $us_api_response['status'] == 1
		) {
			if ( isset( $us_api_response['site_type'] ) AND $us_api_response['site_type'] == 'dev' ) {
				update_option( 'us_license_dev_activated', /* set value */1 );
				delete_option( 'us_license_activated' );
			} else {
				update_option( 'us_license_activated', /* set value */1 );
				delete_option( 'us_license_dev_activated' );
			}

			update_option( 'us_license_secret', $get_variables['secret'] );
			delete_transient( 'us_update_addons_data_' . US_THEMENAME );
		}

	} elseif (
		get_option( 'us_license_activated' )
		OR get_option( 'us_license_dev_activated' )
	) {
		$get_variables['secret'] = (string) get_option( 'us_license_secret' );

		// Get license data
		$us_api_response = us_api( '/envato_auth', $get_variables, US_API_RETURN_ARRAY );
		if (
			is_array( $us_api_response )
			AND isset( $us_api_response['status'] )
			AND $us_api_response['status'] !== 1
		) {
			delete_option( 'us_license_dev_activated' );
			delete_option( 'us_license_activated' );
			delete_option( 'us_license_secret' );
			delete_transient( 'us_update_addons_data_' . US_THEMENAME );
		}
	}

	if ( get_option( 'us_license_dev_activated' ) AND function_exists( 'us_update_option' ) ) {
		us_update_option( 'maintenance_mode', /* set value */1 );
	}

	// Get current theme name
	$us_themename = defined( 'US_ACTIVATION_THEMENAME' )
		? US_ACTIVATION_THEMENAME
		: US_THEMENAME;
	?>

	<div class="wrap about-wrap us-home">
		<div class="us-header">
			<h1><?php echo sprintf( __( 'Welcome to %s', 'us' ), '<strong>' . US_THEMENAME . ' ' . US_THEMEVERSION . '</strong>' ) ?></h1>

			<div class="us-header-links">
				<div class="us-header-link">
					<a href="<?php echo esc_url( $help_portal_url ); ?>/<?php echo strtolower( $us_themename ) ?>/" target="_blank">
						<?php _e( 'Online Documentation', 'us' ) ?>
					</a>
				</div>
				<div class="us-header-link">
					<a href="<?php echo esc_url( $help_portal_url ); ?>/<?php echo strtolower( $us_themename ) ?>/tickets/" target="_blank">
						<?php _e( 'Support Portal', 'us' ) ?>
					</a>
				</div>
				<div class="us-header-link">
					<a href="<?php echo esc_url( $help_portal_url ); ?>/<?php echo strtolower( $us_themename ) ?>/changelog/" target="_blank">
						<?php _e( 'Theme Changelog', 'us' ) ?>
					</a>
				</div>
			</div>
		</div>
		<?php

		if ( defined( 'US_DEV_SECRET' ) ) {
			?>
			<div class="us-activation">
				<div class="us-activation-status yes">
					<?php echo sprintf( __( '%s is activated', 'us' ), US_THEMENAME ); ?>
					<?php echo ' via US_DEV_SECRET'; ?>
				</div>
			</div>
			<?php
		} elseif (
			get_option( 'us_license_activated' )
			OR get_option( 'us_license_dev_activated' )
		) {
			?>
			<div class="us-activation">
				<?php if ( get_option( 'us_license_dev_activated' ) ): ?>
				<div class="us-activation-status dev">
					<?php echo sprintf( __( '%s is activated for development', 'us' ), US_THEMENAME ); ?>
				</div>
				<?php else: ?>
				<div class="us-activation-status yes">
					<?php echo sprintf( __( '%s is activated', 'us' ), US_THEMENAME ); ?>
				</div>
				<?php endif ?>
				<p><?php echo sprintf( __( 'You can deactivate it on your %sLicenses%s page.', 'us' ), '<a href="' . $help_portal_url . '/user/licenses/" target="_blank">', '</a>' ); ?></p>
			</div>
			<?php
		} else {
			$config = us_config( 'envato', array( 'purchase_url' => '#' ) );
			$purchase_url = $config['purchase_url'];
			?>
			<form class="us-activation" id="activation" method="post" action="<?php echo esc_attr( $help_portal_url ); ?>/envato_auth">
				<input type="hidden" name="domain" value="<?php echo esc_attr( $domain ); ?>">
				<input type="hidden" name="return_url" value="<?php echo esc_attr( $return_url ); ?>">
				<input type="hidden" name="theme" value="<?php echo ( defined( 'US_ACTIVATION_THEMENAME' ) ) ? US_ACTIVATION_THEMENAME : US_THEMENAME; ?>">
				<input type="hidden" name="version" value="<?php echo US_THEMEVERSION; ?>">

				<div class="us-activation-status no">
					<span><?php echo sprintf( __( '%s is not activated', 'us' ), US_THEMENAME ); ?></span>
					<div class="us-activation-tooltip">
						<div class="us-activation-tooltip-sign"></div>
						<div class="us-activation-tooltip-text">
							<p><?php _e( 'By activating theme license you will unlock premium options:', 'us' ) ?></p>
							<ul>
								<li><?php _e( 'Using Section Templates', 'us' ) ?></li>
								<li><?php _e( 'White Label feature', 'us' ) ?></li>
								<li><?php _e( 'Theme update notifications and ability to update the theme via one click', 'us' ) ?></li>
								<li><?php _e( 'Ability to install and update premium addons via one click', 'us' ) ?></li>
								<li><?php _e( 'Ability to import any of theme demos', 'us' ) ?></li>
							</ul>
							<p><?php _e( 'Don\'t have valid license yet?', 'us' ) ?><br><a target="_blank" href="<?php echo esc_url( $purchase_url ); ?>"><?php echo sprintf( __( 'Purchase %s license', 'us' ), US_THEMENAME ); ?></a></p>
						</div>
					</div>
				</div>
				<input class="button button-primary" type="submit" value="<?php echo us_translate( 'Activate' ) ?>" name="activate">
			</form>

		<?php
		}

		if ( defined( 'US_CORE_VERSION' ) ) {

			// White Label Settings
			if (
				defined( 'US_DEV_SECRET' )
				OR get_option( 'us_license_activated' )
				OR get_option( 'us_license_dev_activated' )
			) {
				global $usof_options;
				usof_load_options_once();
				$usof_options = array_merge( usof_defaults(), $usof_options );

				if ( ! did_action( 'wp_enqueue_media' ) ) {
					wp_enqueue_media();
				}

				// Enqueue USOF JS files separately, when US_DEV is set
				if ( defined( 'US_DEV' ) ) {
					foreach ( us_config( 'assets-admin.js', array() ) as $key => $admin_js_file ) {
						wp_enqueue_script( 'usof-js-' . $key, US_CORE_URI . $admin_js_file, array(), US_CORE_VERSION );
					}
				} else {
					wp_enqueue_script( 'usof-scripts', US_CORE_URI . '/usof/js/usof.min.js', array( 'jquery' ), US_CORE_VERSION, TRUE );
				}

				// Output UI
				echo '<div class="usof-container for_white_label" data-ajaxurl="' . admin_url( 'admin-ajax.php' ) . '">';
				echo '<form class="usof-form" method="post" action="#" autocomplete="off">';

				// Output _nonce and _wp_http_referer hidden fields for ajax secuirity checks
				wp_nonce_field( 'usof-actions' );

				$config = us_config( 'white-label', array(), TRUE );
				$hidden_fields_values = array(); // preserve values for hidden fields

				foreach ( $config as $section_id => &$section ) {
					if ( isset( $section['place_if'] ) AND ! $section['place_if'] ) {
						if ( isset( $section['fields'] ) ) {
							$hidden_fields_values = array_merge( $hidden_fields_values, array_intersect_key( $usof_options, $section['fields'] ) );
						}
						continue;
					}
					echo '<section class="usof-section current" data-id="' . $section_id . '">';
					echo '<div class="usof-section-header" data-id="' . $section_id . '">';
					echo '<h3>' . $section['title'] . '</h3><span class="usof-section-header-control"></span></div>';
					echo '<div class="usof-section-content" style="display: block">';
					foreach ( $section['fields'] as $field_name => &$field ) {
						us_load_template(
							'usof/templates/field', array(
								'name' => $field_name,
								'id' => 'usof_' . $field_name,
								'field' => $field,
								'values' => &$usof_options,
							)
						);
						unset( $hidden_fields_values[ $field_name ] );
					}
					echo '</div></section>';
				}

				// Control for saving changes button
				echo '<div class="usof-control for_save status_clear">';
				echo '<button class="usof-button button-primary type_save" type="button"><span>' . us_translate( 'Save Changes' ) . '</span>';
				echo '<span class="usof-preloader"></span></button>';
				echo '<div class="usof-control-message"></div>';
				echo '</div>';

				echo '</form>';
				echo '</div>';
			}

			// Helper columns for new users
			?>
			<div class="us-features">
				<div class="one-third">
					<h4><i class="dashicons dashicons-screenoptions"></i><?php _e( 'Install Addons', 'us' ) ?></h4>

					<p><?php echo sprintf( __( '%s comes with popular plugins which increase theme abilities, install them via one click.', 'us' ), US_THEMENAME ); ?></p>
					<a class="button us-button" href="<?php echo admin_url( 'admin.php?page=us-addons' ); ?>"><?php _e( 'Go to Addons page', 'us' ) ?></a>
				</div>
				<div class="one-third">
					<h4><i class="dashicons dashicons-download"></i><?php _e( 'Import Demo Content', 'us' ) ?></h4>

					<p><?php _e( 'Installed this theme for the first time? Import demo content to build your site not from scratch.', 'us' ) ?></p>
					<a class="button us-button" href="<?php echo admin_url( 'admin.php?page=us-demo-import' ); ?>">
						<?php _e( 'Go to Demo Import', 'us' ) ?></a>
				</div>
				<div class="one-third">
					<h4><i class="dashicons dashicons-admin-appearance"></i><?php _e( 'Customize Appearance', 'us' ) ?></h4>

					<p><?php _e( 'To customize the look of your site (colors, layouts, fonts) go to the Theme Options panel.', 'us' ) ?></p>
					<a class="button us-button" href="<?php echo admin_url( 'admin.php?page=us-theme-options' ); ?>"><?php _e( 'Go to Theme Options', 'us' ) ?></a>
				</div>
			</div>
			<?php
		}
		?>
	</div>
	<?php
}
