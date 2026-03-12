<?php defined( 'ABSPATH' ) OR die( 'This script cannot be accessed directly.' );

/**
 * Theme Options Field: Link
 *
 * Link settings field
 *
 * @var $name string Field name
 * @var $id string Field ID
 * @var $field array Field options
 * @var $field['link_additional_values'] array List of options for exclusion
 */

$json_data = $link_options = array();

// Define if the field has dynamic values
if ( $with_dynamic_values = us_arr_path( $field, 'dynamic_values' ) ) {

	$popup_id = us_uniqid( 6 );

	// Get a list of options to add
	$link_additional_values = us_arr_path( $field, 'link_additional_values', /* default */array() );

	// Get array for "Link" option, used in theme elements
	$link_options = (array) us_get_link_options( $link_additional_values );

	// Pass dynamic values data to JS
	foreach ( $link_options as $option_group => $options ) {
		foreach( $options as $option_key => $option_name ) {
			if ( empty( $option_group ) ) {
				$json_data['dynamicValues'][ $option_key ] = $option_name;
			} else {
				$json_data['dynamicValues'][ $option_key ] = sprintf( '%s: %s', $option_group, $option_name );
			}
		}
	}
}

// Field for the main result
$hidden_input_atts = array(
	'name' => $name,
	'type' => 'hidden',
	'value' => $value,
);

// Field for editing in Visual Composer
if ( isset( $field['us_vc_field'] ) ) {
	// Note: Through the field which has a class `wpb_vc_param_value` Visual Composer receives the final value
	$hidden_input_atts['class'] = 'wpb_vc_param_value';
}

// Output content
$output = '<div class="usof-link"' . us_pass_data_to_js( $json_data ) . '>';
$output .= '<input' . us_implode_atts( $hidden_input_atts ) . '>';
$output .= '<div class="usof-link-input">';

// Link input field
$input_atts = array(
	'class' => 'usof-link-input-url js_hidden',
	'name' => 'url',
	'placeholder' => us_translate( 'Paste URL or type to search' ),
	'type' => 'text',
	'data-nonce' => wp_create_nonce( 'usof_search_items_for_link' ),
);
$output .= '<input ' . us_implode_atts( $input_atts ) . '>';

// Hidden tempalte for dynamic value indication
if ( $with_dynamic_values ) {
	$output .= '<div class="usof-link-dynamic-value hidden" data-popup-show="' . $popup_id . '">';
	$output .= '<span class="usof-link-dynamic-value-title"></span>';
	$output .= '<button type="button" class="action_remove_dynamic_value ui-icon_close" title="' . esc_attr( us_translate( 'Remove' ) ) . '"></button>';
	$output .= '</div>';
}

$output .= '<div class="usof-link-input-controls">';
$output .= '<button class="action_toggle_menu fas fa-cog" title="' . esc_attr( us_translate( 'Link options' ) ) . '"></button>';

// Attributes for dynamic data button
if ( $with_dynamic_values ) {
	$dynamic_data_button_atts = array(
		'class' => 'fas fa-database',
		'data-popup-show' => $popup_id,
		'title' => __( 'Select Dynamic Value', 'us' ),
	);
	$output .= '<button' . us_implode_atts( $dynamic_data_button_atts ) . '></button>';
}
$output .= '</div>'; // .usof-link-input-controls
$output .= '</div>'; // .usof-link-input

// Link Posts search
$output .= '<div class="usof-link-search-results hidden">';
$output .= '<div class="usof-link-search-message hidden"></div>';
$output .= '</div>';

// Link attributes settings
$output .= '<div class="usof-link-attributes">';

// Target attribute
$output .= '<div class="usof-checkbox"><label>';
$output .= '<input type="checkbox" name="target" value="_blank">' . strip_tags( us_translate( 'Open link in a new tab' ) );
$output .= '</label></div>';

// Rel attribute
$output .= '<div class="usof-checkbox"><label>';
$output .= '<input type="checkbox" name="rel" value="nofollow">' . strip_tags( __( 'Add "nofollow" attribute' , 'us' ) );
$output .= '</label></div>';

// Title attribute
// Note: To bind a checkbox to a text field, use the prefix '{$checkbox_name}_value' in the field name to enter the value
$output .= '<div class="usof-checkbox"><label>';
$output .= '<input type="checkbox" name="title">' . strip_tags( us_translate( 'Title Attribute' ) );
$output .= '<input type="text" name="title_value" placeholder="' . esc_attr( us_translate( 'Text' ) ) . '">';
$output .= '</label></div>';

// Onclick attribute
// Note: To bind a checkbox to a text field, use the prefix '{$checkbox_name}_value' in the field name to enter the value
$output .= '<div class="usof-checkbox"><label>';
$output .= '<input type="checkbox" name="onclick">' . strip_tags( __( 'Onclick JavaScript event', 'us' ) );
$output .= '<input type="text" name="onclick_value" placeholder="return false">';
$output .= '</label></div>';

$output .= '</div>'; // .usof-link-attributes
$output .= '</div>'; // .usof-link

// Popup with dynamic values
if ( $with_dynamic_values ) {
	$output .= '<div class="usof-popup for_usof_link" data-popup-id="' . $popup_id . '">';

	$output .= '<div class="usof-popup-header">';
	$output .= '<div class="usof-popup-header-title">' .  strip_tags( __( 'Select Dynamic Value', 'us' ) ) . '</div>';
	$output .= '<button class="usof-popup-close ui-icon_close" title="' . esc_attr( us_translate( 'Close' ) ) . '"></button>';
	$output .= '</div>'; // .usof-popup-header

	$output .= '<div class="usof-popup-body">';
	foreach ( $link_options as $option_group => $options ) {
		if ( empty( $options ) ) {
			continue;
		}
		if ( empty( $option_group ) ) {
			$option_group = __( 'Related to this element', 'us' );
		}
		$output .= '<div class="usof-popup-group">';
		$output .= '<div class="usof-popup-group-title">' . strip_tags( $option_group ) . '</div>';
		$output .= '<div class="usof-popup-group-values">';
		foreach ( $options as $option_key => $option_name ) {
			$output .= '<button class="usof-popup-group-value" data-dynamic-value="' . esc_attr( $option_key ) . '">' . strip_tags( $option_name ) . '</button>';
		}
		$output .= '</div>'; // .usof-column
		$output .= '</div>'; // .usof-row
	}
	$output .= '</div>'; // .usof-popup-body
	$output .= '<div class="usof-preloader"></div>';
	$output .= '</div>'; // .usof-popup
}

echo $output;
