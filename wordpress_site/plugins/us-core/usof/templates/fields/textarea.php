<?php defined( 'ABSPATH' ) OR die( 'This script cannot be accessed directly.' );

/**
 * Theme Options Field: Textarea
 *
 * Simple textarea field.
 *
 * @var   $name  string Field name
 * @var   $id    string Field ID
 * @var   $field array Field options
 *
 * @param $field ['title'] string Field title
 * @param $field ['description'] string Field title
 * @param $field ['placeholder'] string Field placeholder
 *
 * @var   $value string Current value
 */

$input_atts = array(
	'name' => $name,
);

if ( ! empty( $field['placeholder'] ) ) {
	$input_atts['placeholder'] = $field['placeholder'];
}

// Field for editing in Visual Composer
if ( isset( $field['us_vc_field'] ) ) {
	// Note: Through the field which has a class `wpb_vc_param_value` Visual Composer receives the final value.
	$input_atts['class'] = 'wpb_vc_param_value';
}

echo '<textarea'. us_implode_atts( $input_atts ) .'>' . esc_textarea( $value ) . '</textarea>';
