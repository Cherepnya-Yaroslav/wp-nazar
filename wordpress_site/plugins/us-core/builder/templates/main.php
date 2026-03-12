<?php defined( 'ABSPATH' ) or die( 'This script cannot be accessed directly.' );
/**
 * @var array $fieldsets
 * @var array $usb_settings
 * @var array $elms_categories
 * @var string $ajaxurl
 * @var string $body_class
 * @var string $edit_page_link
 * @var string $page_link
 */

// Checking required variables
$elms_categories = isset( $elms_categories ) ? $elms_categories : array();
$fieldsets = isset( $fieldsets ) ? $fieldsets : array();
$section_templates_included = us_get_option( 'section_templates', /* default */1 );
$post_id = (int) USBuilder::get_post_id();
$post_type = isset( $post_type ) ? $post_type : '';
$usb_settings = isset( $usb_settings ) ? $usb_settings : array();

?>
<!DOCTYPE HTML>
<html dir="<?php echo( is_rtl() ? 'rtl' : 'ltr' ) ?>" <?php language_attributes( 'html' ) ?>>
<head>
	<title><?php echo $title ?></title>
	<meta charset="<?php bloginfo( 'charset' ) ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<?php wp_print_styles() ?>
	<script type="text/javascript">
		// Link to get data via AJAX for USOF
		var ajaxurl = '<?php esc_attr_e( $ajaxurl ) ?>';
		// Text translations for USBuilder
		window.$usbdata = window.$usbdata || {}; // Single space for data
		window.$usbdata.textTranslations = <?php echo json_encode( $text_translations ) ?>;
	</script>
</head>
<body class="<?php echo $body_class ?>">
<div id="usb-wrapper" class="usb-wrapper"<?php echo us_pass_data_to_js( $usb_settings ) ?>>
	<!-- Begin left sidebar -->
	<aside id="usb-panel" class="usb-panel wp-core-ui">
		<div class="usb-panel-switcher ui-icon_left" title="<?php _e( 'Hide/Show panel', 'us' ) ?>">
		</div>
		<header class="usb-panel-header">
			<!-- Builder Menu -->
			<div class="usb-panel-header-menu">
				<button class="icon_menu" title="<?php esc_attr_e( us_translate( 'Menu' ) )?>">
					<span></span>
				</button>
				<div class="usb-panel-header-menu-list">
					<?php if ( ! in_array( $post_type, array( 'us_page_block', 'us_content_template' ) ) ) { ?>
					<a class="usb-panel-header-menu-item" href="<?php esc_attr_e( $page_link ) ?>" target="_blank">
						<span><?php esc_attr_e( us_translate( 'View Page' ) ) ?></span>
					</a>
					<?php } else { ?>
					<a class="usb-panel-header-menu-item" href="<?php echo home_url( '/' ) ?>" target="_blank">
						<span><?php esc_attr_e( us_translate( 'Visit Site' ) ) ?></span>
					</a>
					<?php } ?>
					<a class="usb-panel-header-menu-item usb_action_undo disabled" href="javascript:void(0)">
						<span><?php esc_attr_e( us_translate( 'Undo' ) ) ?></span>
						<span data-macos-shortcuts="Command+Z">Ctrl+Z</span>
					</a>
					<a class="usb-panel-header-menu-item usb_action_redo disabled" href="javascript:void(0)">
						<span><?php esc_attr_e( us_translate( 'Redo' ) ) ?></span>
						<span data-macos-shortcuts="Command+Shift+Z">Ctrl+Shift+Z</span>
					</a>
					<a class="usb-panel-header-menu-item" href="<?php esc_attr_e( $edit_page_link ) ?>" target="_blank">
						<span><?php esc_attr_e( __( 'Edit page in Backend', 'us' ) ) ?></span>
					</a>
					<a class="usb-panel-header-menu-item" href="<?php echo admin_url( 'admin.php?page=us-theme-options' ) ?>" target="_blank">
						<span><?php esc_attr_e( __( 'Go to Theme Options', 'us' ) ) ?></span>
					</a>
					<a class="usb-panel-header-menu-item usb_action_show_import_content" href="javascript:void(0)">
						<span><?php esc_attr_e( __( 'Paste Row/Section', 'us' ) ) ?></span>
					</a>
					<a class="usb-panel-header-menu-item" href="<?php echo admin_url() ?>">
						<span><?php esc_attr_e( __( 'Exit to dashboard', 'us' ) ) ?></span>
					</a>
				</div>
			</div>
			<div class="usb-panel-header-title"></div>
			<button class="ui-icon_add usb_action_elm_add" title="<?php esc_attr_e( __( 'Add element', 'us' ) )?>"></button>
		</header>
		<div class="usb-panel-body">
			<!-- Add Items -->
			<div class="usb-panel-add-items usof-tabs">
				<?php if ( $section_templates_included ): ?>
				<div class="usof-tabs-list">
					<div class="usof-tabs-item active"><?php esc_attr_e( __( 'Elements', 'us' ) ) ?></div>
					<div class="usof-tabs-item usb-templates-loaded"><?php esc_attr_e( us_translate( 'Templates' ) ) ?></div>
				</div>
				<?php endif; ?>
				<div class="usof-tabs-sections">
					<div class="usof-tabs-section active">
						<!-- Begin Add Element List -->
						<div class="usb-panel-elms">
							<div class="usb-panel-elms-search">
								<input type="text" name="search" autocomplete="off" placeholder="<?php esc_attr_e( us_translate( 'Search' ) ) ?>">
								<i class="ui-icon_close usb_action_panel_reset_search hidden" title="<?php esc_attr_e( __( 'Reset', 'us' ) ) ?>"></i>
							</div>
							<div class="usb-panel-elms-search-noresult hidden"><?php esc_attr_e( us_translate( 'No results found.' ) ) ?></div>
							<?php foreach ( $elms_categories as $category => $elms ): ?>
								<?php
								// Category title
								$title = ! empty( $category ) ? $category : us_translate( 'General', 'js_composer' );
								echo '<h2 class="usb-panel-elms-header">' . strip_tags( $title ) . '</h2>';

								// Category elements
								$output = '<div class="usb-panel-elms-list">';
								foreach ( $elms as $type => $elm ) {
									$elm_atts = array(
										'class' => 'usb-panel-elms-item usb-elm-has-icon',
										'data-title' => strip_tags( $elm['title'] ),
										'data-type' => (string) $type,
									);
									if ( ! empty( $elm['is_container'] ) ) {
										$elm_atts['data-isContainer'] = TRUE;
									}

									// Hide specific elements
									if (
										! empty( $elm['hide_on_adding_list'] )
										OR (
											! empty( $elm['show_for_post_types'] )
											AND ! in_array( $post_type, (array) $elm['show_for_post_types'] )
										)
										OR (
											! empty( $elm[ 'hide_for_post_ids' ] )
											AND in_array( $post_id, (array) $elm['hide_for_post_ids'] )
										)
									) {
										$elm_atts['class'] .= ' hidden';

									} elseif( ! empty( $elm_atts['data-title'] ) ) {
										$elm_atts['data-search-text'] = us_strtolower( $elm_atts['data-title'] );
									}
									$output .= '<div' . us_implode_atts( $elm_atts ) . '>';
									$output .= '<i class="' . $elm['icon'] . '"></i>';
									$output .= '</div>';
								}
								$output .= '</div>';
								echo $output;
								?>
							<?php endforeach; ?>
						</div>
						<!-- End Add Element List -->
					</div>
					<?php if ( $section_templates_included ): ?>
					<div class="usof-tabs-section">
						<!-- Begin Templates List -->
						<div class="usb-templates">
							<span class="usof-preloader usb-templates-preloader"></span>
							<div class="usb-templates-error"><?php echo strip_tags( us_translate( 'No results found.' ) ) ?></div>
						</div>
						<!-- End Templates List -->
					</div>
					<?php endif; ?>
				</div>
			</div>

			<!-- Elements Fieldsets -->
			<div id="usb-tmpl-fieldsets" class="hidden">
				<?php foreach ( $fieldsets as $fieldset_name => $fieldset ): ?>
					<form class="usb-panel-fieldset" data-name="<?php esc_attr_e( $fieldset_name ) ?>">
						<?php us_load_template(
							'usof/templates/edit_form', array(
								'type' => $fieldset_name,
								'params' => isset( $fieldset['params'] ) ? $fieldset['params'] : array(),
								'context' => 'shortcode'
							)
						) ?>
					</form>
				<?php endforeach; ?>
			</div>

			<!-- Messages Panel -->
			<div class="usb-panel-messages hidden"></div>

			<!-- Paste Row/Section -->
			<div class="usb-panel-import-content usof-container inited hidden">
				<textarea placeholder="[vc_row][vc_column] ... [/vc_column][/vc_row]"></textarea>
				<button class="usof-button usb_action_pasted_save_content disabled" disabled>
					<span><?php esc_attr_e( __( 'Append Section', 'us' ) ) ?></span>
					<span class="usof-preloader"></span>
				</button>
			</div>

			<!-- Page Custom CSS -->
			<div class="usb-panel-page-custom-css usof-container inited hidden">
				<div class="type_css" data-name="<?php esc_attr_e( USBuilder::KEY_CUSTOM_CSS ) ?>">
					<?php us_load_template(
						'usof/templates/fields/css', array(
							'name' => USBuilder::KEY_CUSTOM_CSS, // Meta key for post custom css
							'value' => '', // NOTE: The value is empty because the data should be loaded from the preview frame.
						)
					) ?>
				</div>
			</div>

			<!-- Templates Transit -->
			<div class="usb-template-transit hidden">
				<i class="fas fa-border-all"></i>
				<span>Template section</span>
			</div>

			<!-- Page Settings -->
			<div class="usb-panel-page-settings usof-container inited hidden">
				<!-- Begin page fields -->
				<?php us_load_template(
					'usof/templates/edit_form', array(
						'context' => 'us_builder',
						'params' => us_config( 'us-builder.page_fields.params', array() ),
						'type' => 'page_fields',
						'values' => array(), // Values will be set on the JS side after loading the iframe.
					)
				) ?>
				<!-- End page fields -->
				<!-- Begin page metadata -->
				<div class="usb-panel-page-meta">
					<?php foreach ( (array) us_config( 'meta-boxes', array() ) as $metabox_config ): ?>
						<?php
						if (
							! us_arr_path( $metabox_config, 'usb_context' )
							OR ! in_array( $post_type, (array) us_arr_path( $metabox_config, 'post_types', array() ) )
						) {
							continue;
						}
						?>
						<div class="usb-panel-page-meta-title"><?php esc_html_e( $metabox_config['title'] ) ?></div>
						<?php us_load_template(
							'usof/templates/edit_form', array(
								'context' => 'usb_metabox',
								'params' => us_arr_path( $metabox_config, 'fields', array() ),
								'type' => us_arr_path( $metabox_config, 'id', '' ),
								'values' => array(), // Values will be set on the JS side after loading the iframe.
							)
						) ?>
					<?php endforeach; ?>
				</div>
				<!-- End page metadata -->
			</div>
		</div>
		<footer class="usb-panel-footer">
			<button class="ui-icon_settings usb_action_show_page_settings" title="<?php esc_attr_e( __( 'Page Settings', 'us' ) ) ?>"></button>
			<button class="ui-icon_css3 usb_action_show_page_custom_css" title="<?php esc_attr_e( __( 'Page Custom CSS', 'us' ) ) ?>"></button>
			<button class="ui-icon_devices usb_action_toggle_responsive_mode" title="<?php esc_attr_e( __( 'Responsive', 'us' ) ) ?>"></button>
			<button class="usb_action_navigator_switch disabled" title="<?php esc_attr_e( __( 'Navigator', 'us' ) ) ?>">
				<span class="fas fa-layer-group"></span>
			</button>
			<?php if ( ! in_array( $post_type, array( 'us_page_block', 'us_content_template' ) ) ): ?>
			<!-- Begin data for create revision and show a preview page -->
			<form action="<?php echo admin_url( 'post.php' ) ?>" method="post" id="wp-preview" target="wp-preview-<?php echo (int) $post_id ?>">
				<textarea class="hidden" name="post_content"></textarea>
				<input type="hidden" name="post_ID" value="<?php echo (int) $post_id ?>">
				<input type="hidden" name="wp-preview" value="dopreview">
				<input type="hidden" name="_wpnonce" value="<?php echo wp_create_nonce( 'update-post_' . $post_id ) ?>">
				<!-- Begin post meta data -->
				<textarea class="hidden" name="<?php esc_attr_e( USBuilder::KEY_CUSTOM_CSS ) ?>"></textarea>
				<!-- End post meta data -->
				<button type="submit" class="ui-icon_eye" title="<?php esc_attr_e( us_translate( 'Preview Changes' ) ) ?>"></button>
			</form>
			<!-- End data for create revision and show a preview page -->
			<?php endif; ?>
			<button class="type_save usb_action_save_changes disabled" disabled>
				<span><?php echo strip_tags( us_translate( 'Update' ) ) ?></span>
				<span class="usof-preloader"></span>
			</button>
		</footer>
		<!-- Notification Prototype -->
		<div class="usb-notification hidden">
			<span></span>
			<i class="ui-icon_close usb_action_notification_close" title="<?php esc_attr_e( us_translate( 'Close' ) ) ?>"></i>
		</div>
		<!-- Panel Preloader -->
		<span class="usof-preloader usb-panel-preloader"></span>
	</aside>
	<!-- End left sidebar -->
	<main id="usb-preview" class="usb-preview">
		<!-- Responsive Toolbar -->
		<div class="usb-preview-toolbar">
			<?php echo usof_get_responsive_buttons() ?>
			<button class="ui-icon_close usb_action_responsive_toolbar_hide" title="<?php esc_attr_e( us_translate( 'Close' ) ) ?>"></button>
		</div>
		<!-- Preview Wrapper -->
		<div class="usb-preview-iframe-wrapper">
			<iframe data-src="<?php esc_attr_e( us_arr_path( $usb_settings, 'previewUrl', '' ) ) ?>"></iframe>
		</div>
	</main>
	<!-- Begin right sidebar -->
	<aside id="usb-navigator" class="usb-navigator">
		<header class="usb-navigator-header">
			<button class="usb_action_navigator_expand_all" title="<?php esc_attr_e( __( 'Expand/Collapse All', 'us' ) ) ?>">
				<i class="fas fa-chevron-circle-down"></i>
			</button>
			<div class="usb-navigator-header-title"><?php echo strip_tags( __( 'Navigator', 'us' ) ) ?></div>
			<button class="usb_action_navigator_hide ui-icon_close" title="<?php esc_attr_e( us_translate( 'Close' ) ) ?>"></button>
		</header>
		<div class="usb-navigator-body"></div>
		<!-- Begin navigator item template -->
		<script type="text/html" id="usb-tmpl-navigator-item">
			<div class="usb-navigator-item" data-for="{%usbid%}">
				<div class="usb-navigator-item-header">
					<i class="usb_action_navigator_expand"></i>
					<div class="usb-navigator-item-title usb-elm-has-icon" data-type="{%elm_type%}">
						<i class="{%elm_icon%}"></i>
						<span>{%elm_title%}</span>
						<span class="for_attr_id">{%attr_id%}</span>
					</div>
					<div class="usb-navigator-item-actions">
						<button class="usb_action_navigator_duplicate_elm ui-icon_duplicate" title="<?php esc_attr_e( __( 'Duplicate', 'us' ) ) ?>"></button>
						<button class="usb_action_navigator_remove_elm ui-icon_delete" title="<?php esc_attr_e( us_translate( 'Delete' ) ) ?>"></button>
					</div>
				</div>
			</div>
		</script>
		<!-- End navigator item template -->
	</aside>
	<!-- End right sidebar -->
</div>
<!-- Begin scritps -->
<?php do_action( 'usb_admin_footer_scripts' ) ?>
</body>
</html>
