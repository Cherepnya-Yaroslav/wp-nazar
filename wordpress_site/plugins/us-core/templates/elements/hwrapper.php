<?php defined( 'ABSPATH' ) OR die( 'This script cannot be accessed directly.' );

/**
 * Horizontal Wrapper
 */

// Disable the element output, if provided conditions aren't met
if ( ! us_conditions_are_met( $conditions, $conditions_operator ) ) {
	return;
}

$_atts['class'] = 'w-hwrapper';
$_atts['class'] .= isset( $classes ) ? $classes : '';
$_atts['class'] .= ' valign_' . $valign;
$_atts['class'] .= ( $wrap ) ? ' wrap' : '';
$_atts['class'] .= ( $stack_on_mobiles ) ? ' stack_on_mobiles' : '';

if ( ! empty( $el_id ) ) {
	$_atts['id'] = $el_id;
}

// Responsive alignment
if ( $_alignments = (array) us_get_responsive_values( $alignment ) ) {
	foreach ( $_alignments as $state => $align ) {
		$_atts['class'] .= sprintf( ' %s_align_%s', $state, $align );
	}
	
	// Standard alignment
} else {
	$_atts['class'] .= ' align_' . $alignment;
}

if ( trim( $inner_items_gap ) != '1.2rem' ) {
	$_atts['style'] = '--hwrapper-gap:' . $inner_items_gap;
}

// Output the element
$output = '<div' . us_implode_atts( $_atts ) . '>';
$output .= do_shortcode( $content );
$output .= '</div>';

echo $output;
