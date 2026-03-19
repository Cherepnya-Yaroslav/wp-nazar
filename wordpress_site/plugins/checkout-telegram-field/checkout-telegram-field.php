<?php
/**
 * Plugin Name: Checkout Telegram Field
 * Description: Adds a Telegram field to WooCommerce checkout and saves it to the order.
 * Version: 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add Telegram to the billing fieldset.
 *
 * @param array $fields
 * @return array
 */
function ctf_add_checkout_telegram_field( $fields ) {
	if ( empty( $fields['billing'] ) || ! is_array( $fields['billing'] ) ) {
		$fields['billing'] = array();
	}

	$fields['billing']['billing_telegram'] = array(
		'type'        => 'text',
		'label'       => __( 'Telegram', 'checkout-telegram-field' ),
		'placeholder' => '@username',
		'required'    => true,
		'class'       => array( 'form-row-wide' ),
		'priority'    => 105,
	);

	return $fields;
}
add_filter( 'woocommerce_checkout_fields', 'ctf_add_checkout_telegram_field', 2000 );

/**
 * Sanitize Telegram checkout input before WooCommerce saves it.
 *
 * @param array $data
 * @return array
 */
function ctf_sanitize_checkout_telegram_field( $data ) {
	if ( isset( $_POST['billing_telegram'] ) ) {
		$data['billing_telegram'] = sanitize_text_field( wp_unslash( $_POST['billing_telegram'] ) );
	}

	return $data;
}
add_filter( 'woocommerce_checkout_posted_data', 'ctf_sanitize_checkout_telegram_field', 20 );

/**
 * Enforce Telegram as a required checkout field.
 *
 * @param array    $data
 * @param WP_Error $errors
 */
function ctf_validate_checkout_telegram_field( $data, $errors ) {
	$telegram = isset( $data['billing_telegram'] ) ? trim( (string) $data['billing_telegram'] ) : '';
	if ( $telegram !== '' ) {
		return;
	}

	$errors->add(
		'billing_telegram_required',
		__( 'Telegram is a required field.', 'checkout-telegram-field' )
	);
}
add_action( 'woocommerce_after_checkout_validation', 'ctf_validate_checkout_telegram_field', 20, 2 );

/**
 * Persist Telegram on the order and customer profile.
 *
 * @param WC_Order $order
 * @param array    $data
 */
function ctf_save_checkout_telegram_field( $order, $data ) {
	if ( ! $order instanceof WC_Order ) {
		return;
	}

	$telegram = isset( $data['billing_telegram'] ) ? sanitize_text_field( $data['billing_telegram'] ) : '';
	if ( $telegram === '' ) {
		return;
	}

	$order->update_meta_data( '_billing_telegram', $telegram );

	if ( $order->get_customer_id() ) {
		update_user_meta( $order->get_customer_id(), 'billing_telegram', $telegram );
	}
}
add_action( 'woocommerce_checkout_create_order', 'ctf_save_checkout_telegram_field', 20, 2 );

/**
 * Show Telegram on the admin order screen.
 *
 * @param WC_Order $order
 */
function ctf_render_admin_order_telegram( $order ) {
	$telegram = $order instanceof WC_Order ? $order->get_meta( '_billing_telegram' ) : '';
	if ( $telegram === '' ) {
		return;
	}

	echo '<p><strong>' . esc_html__( 'Telegram:', 'checkout-telegram-field' ) . '</strong> ' . esc_html( $telegram ) . '</p>';
}
add_action( 'woocommerce_admin_order_data_after_billing_address', 'ctf_render_admin_order_telegram', 20 );
