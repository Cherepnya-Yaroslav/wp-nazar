<?php defined( 'ABSPATH' ) OR die( 'This script cannot be accessed directly.' );

/**
 * Popup
 */

$_atts['class'] = 'w-popup';
$_atts['class'] .= isset( $classes ) ? $classes : '';

// For correct buttons appearance
if ( $show_on === 'btn' ) {
	$_atts['class'] .= ' w-btn-wrapper';
}

// Responsive alignment
if ( $_alignments = (array) us_get_responsive_values( $align ) ) {
	foreach ( $_alignments as $state => $align ) {
		$_atts['class'] .= sprintf( ' %s_align_%s', $state, $align );
	}
	
	// Standard alignment
} else {
	$_atts['class'] .= ' align_' . $align;
}

if ( ! empty( $el_id ) ) {
	$_atts['id'] = $el_id;
}

// Generate ID needed for AMP <lightbox>
if ( us_amp() ) {
	$_amp_ID = 'w-popup-' . ( empty( $el_id ) ? mt_rand( 1, 9999 ) : $el_id );
}

// Add aria-label for cases when a trigger button doesn't have any text
$btn_atts['aria-label'] = __( 'Popup', 'us' );

// Output the element
$output = '<div' . us_implode_atts( $_atts ) . '>';

// Trigger link
if ( us_amp() ) {
	$amp_atts['on'] = 'tap:' . $_amp_ID . '.open,' . $_amp_ID . '.toggleClass(class=\'opened\')';
} else {
	$amp_atts = array();
}

if ( $show_on == 'image' ) {
	$image_html = wp_get_attachment_image( $image, $image_size );
	if ( empty( $image_html ) ) {
		$image_html = us_get_img_placeholder( $image_size );
	}
	$image_atts = array(
		'class' => 'w-popup-trigger type_image',
	);
	$output .= '<button' . us_implode_atts( $image_atts + $amp_atts + $btn_atts ) . '>' . $image_html . '</button>';

} elseif ( $show_on == 'load' ) {
	$output .= '<span class="w-popup-trigger type_load" data-delay="' . (int) $show_delay . '"></span>';

} elseif ( $show_on == 'selector' ) {
	$output .= '<span class="w-popup-trigger type_selector" data-selector="' . esc_attr( $trigger_selector ) . '"></span>';

} elseif ( $show_on == 'icon' ) {
	$icon_atts = array(
		'class' => 'w-popup-trigger type_icon',
	);
	$output .= '<button' . us_implode_atts( $icon_atts + $amp_atts + $btn_atts ) . '>' . us_prepare_icon_tag( $btn_icon ) . '</button>';

} else/*if ( $show_on == 'btn' )*/ {
	$btn_atts['class'] = 'w-popup-trigger type_btn w-btn ' . us_get_btn_class( $btn_style );

	if ( ! empty( $btn_size ) ) {
		$btn_atts['style'] = 'font-size:' . $btn_size;
	}

	// Icon
	$icon_html = '';
	if ( ! empty( $btn_icon ) ) {
		$icon_html = us_prepare_icon_tag( $btn_icon );
		$btn_atts['class'] .= ' icon_at' . $btn_iconpos;
	}

	// If button label is not empty use it as aria-label too
	if ( $btn_label !== '' ) {
		$btn_atts['aria-label'] = $btn_label;
	}

	$output .= '<button' . us_implode_atts( $btn_atts + $amp_atts ) . '>';
	if ( is_rtl() ) {
		$btn_iconpos = ( $btn_iconpos == 'left' ) ? 'right' : 'left';
	}
	if ( $btn_iconpos == 'left' ) {
		$output .= $icon_html;
	}
	$output .= '<span class="w-btn-label">' . trim( strip_tags( $btn_label, '<br>' ) ) . '</span>';
	if ( $btn_iconpos == 'right' ) {
		$output .= $icon_html;
	}
	$output .= '</button>';
}

// Add AMP specific lightbox semantics
if ( us_amp() ) {
	$output .= '<amp-lightbox id="' . $_amp_ID . '" layout="nodisplay" on="tap:' . $_amp_ID . '.toggleClass(class=\'opened\'),' . $_amp_ID . '.close">';
}

// Overlay
$output .= '<div class="w-popup-overlay"';
$output .= us_prepare_inline_css(
	array(
		'background' => us_get_color( $overlay_bgcolor, /* Gradient */ TRUE ),
	)
);
$output .= '></div>';

$popup_class = us_amp() ? '' : ' animation_' . $animation;
$popup_class .= ' closerpos_' . $closer_pos;

// Popup title
$output_title = '';
if ( $use_page_block === 'none' AND ! empty( $title ) ) {
	$popup_class .= ' with_title';

	$output_title .= '<div class="w-popup-box-title">' . strip_tags( $title ) . '</div>';
} else {
	$popup_class .= ' without_title';
}

// The Popup itself
$_popup_css_vars = array(
	'--title-color:' . us_get_color( $title_textcolor ),
	'--title-bg-color:' . us_get_color( $title_bgcolor, /* Gradient */ TRUE ),
	'--content-color:' . us_get_color( $content_textcolor ),
	'--content-bg-color:' . us_get_color( $content_bgcolor, /* Gradient */ TRUE ),
);
$output .= '<div class="w-popup-wrap" style="' . implode( ';', $_popup_css_vars ) . '">';
$output .= '<div class="w-popup-box' . $popup_class . '"';
$output .= us_prepare_inline_css(
	array(
		'border-radius' => $popup_border_radius,
		'width' => $popup_width,
	)
);
$output .= '><div class="w-popup-box-h">';
$output .= $output_title;

// Popup content
$output .= '<div class="w-popup-box-content"';
$output .= us_prepare_inline_css(
	array(
		'padding' => $popup_padding,
	)
);
$output .= '>';

if ( $use_page_block === 'none' ) {
	$output .= do_shortcode( wpautop( $content ) );
} else {
	$output .= do_shortcode( '[us_page_block id="' . $use_page_block . '"]' );
}

$output .= '</div>'; // .w-popup-box-content

// Close Button when Inside Popup
if ( $closer_pos === 'inside' ) {
	$output .= '<div class="w-popup-closer"';
	$output .= us_prepare_inline_css(
		array(
			'color' => us_get_color( $closer_color ),
		)
	);
	$output .= '></div>';
}

$output .= '</div>'; // .w-popup-box-h
$output .= '</div>'; // .w-popup-box

// Close Button when Outside Popup
if ( $closer_pos === 'outside' ) {
	$output .= '<div class="w-popup-closer"';
	$output .= us_prepare_inline_css(
		array(
			'color' => us_get_color( $closer_color ),
		)
	);
	$output .= '></div>';
}

$output .= '</div>'; // .w-popup-wrap

if ( us_amp() ) {
	$output .= '</amp-lightbox>';
}

$output .= '</div>'; // .w-popup

echo $output;
