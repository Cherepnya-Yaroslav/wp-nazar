<?php
/**
 * Plugin Name: Footer Email Subscribe
 * Description: Saves footer email subscriptions inside WordPress without relying on server mail delivery.
 * Version: 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Footer_Email_Subscribe {
	const ACTION_NAME = 'footer_email_subscribe_action';
	const NONCE_NAME = 'footer_email_subscribe_nonce';
	const STATUS_ARG = 'footer_subscribe_status';
	const TABLE_NAME = 'footer_email_subscriptions';

	public static function init() {
		$instance = new self();
		add_shortcode( 'footer_email_subscribe', array( $instance, 'render_shortcode' ) );
		add_action( 'init', array( $instance, 'handle_submission' ) );
		add_action( 'wp_enqueue_scripts', array( $instance, 'enqueue_assets' ) );
	}

	public static function activate() {
		global $wpdb;

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$table_name = self::get_table_name();
		$charset = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE {$table_name} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			email VARCHAR(190) NOT NULL,
			created_at DATETIME NOT NULL,
			PRIMARY KEY (id),
			UNIQUE KEY email (email)
		) {$charset};";

		dbDelta( $sql );
	}

	public static function get_table_name() {
		global $wpdb;

		return $wpdb->prefix . self::TABLE_NAME;
	}

	public function enqueue_assets() {
		$handle = 'footer-email-subscribe';
		$css = '
			.footer-subscription-form-native { margin: 0; }
			.footer-subscription-form-native p { margin: 0; }
			.footer-subscription-form-native .footer-input-container { margin: 0; }
			.footer-subscription-form-native .footer-subscription-message {
				margin-top: 0.75rem;
				font-size: 12px;
				line-height: 1.4;
			}
			.footer-subscription-form-native .footer-subscription-message.is-success {
				color: #2e7d32;
			}
			.footer-subscription-form-native .footer-subscription-message.is-error {
				color: #b42318;
			}
		';

		wp_register_style( $handle, false, array(), '1.0.0' );
		wp_enqueue_style( $handle );
		wp_add_inline_style( $handle, $css );
	}

	public function handle_submission() {
		if ( 'POST' !== strtoupper( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
			return;
		}

		if ( empty( $_POST[ self::ACTION_NAME ] ) ) {
			return;
		}

		$redirect_url = wp_get_referer();
		if ( empty( $redirect_url ) ) {
			$redirect_url = home_url( '/' );
		}
		$redirect_url = remove_query_arg( self::STATUS_ARG, $redirect_url );

		if ( empty( $_POST[ self::NONCE_NAME ] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST[ self::NONCE_NAME ] ) ), self::NONCE_NAME ) ) {
			$this->redirect_with_status( $redirect_url, 'error' );
		}

		$email = sanitize_email( wp_unslash( $_POST['footer_email'] ?? '' ) );
		if ( empty( $email ) || ! is_email( $email ) ) {
			$this->redirect_with_status( $redirect_url, 'invalid' );
		}

		global $wpdb;

		$inserted = $wpdb->insert(
			self::get_table_name(),
			array(
				'email' => $email,
				'created_at' => current_time( 'mysql' ),
			),
			array( '%s', '%s' )
		);

		if ( false === $inserted ) {
			$status = ( false !== strpos( strtolower( $wpdb->last_error ), 'duplicate' ) ) ? 'exists' : 'error';
			$this->redirect_with_status( $redirect_url, $status );
		}

		$this->redirect_with_status( $redirect_url, 'success' );
	}

	public function render_shortcode() {
		$status = sanitize_key( $_GET[ self::STATUS_ARG ] ?? '' );
		$message = $this->get_status_message( $status );

		ob_start();
		?>
		<form class="footer-subscription-form-native" method="post" action="">
			<?php wp_nonce_field( self::NONCE_NAME, self::NONCE_NAME ); ?>
			<input type="hidden" name="<?php echo esc_attr( self::ACTION_NAME ); ?>" value="1">
			<div class="footer-input-container">
				<input id="footerInput" type="email" name="footer_email" placeholder="yourmail@gmail.com" autocomplete="email" required>
				<button id="footerSubmitButton" type="submit" aria-label="<?php echo esc_attr__( 'Subscribe', 'footer-email-subscribe' ); ?>">
					<img src="/wp-content/uploads/2023/07/i_arrow_right.svg" alt="<?php echo esc_attr__( 'Subscribe', 'footer-email-subscribe' ); ?>">
				</button>
			</div>
			<?php if ( ! empty( $message ) ) : ?>
				<div class="footer-subscription-message <?php echo esc_attr( 'success' === $status ? 'is-success' : 'is-error' ); ?>">
					<?php echo esc_html( $message ); ?>
				</div>
			<?php endif; ?>
		</form>
		<?php

		return ob_get_clean();
	}

	private function get_status_message( $status ) {
		switch ( $status ) {
			case 'success':
				return 'Thanks. Your email has been added to the subscription list.';
			case 'exists':
				return 'This email is already subscribed.';
			case 'invalid':
				return 'Enter a valid email address.';
			case 'error':
				return 'Something went wrong. Please try again.';
			default:
				return '';
		}
	}

	private function redirect_with_status( $redirect_url, $status ) {
		wp_safe_redirect( add_query_arg( self::STATUS_ARG, $status, $redirect_url ) );
		exit;
	}
}

register_activation_hook( __FILE__, array( 'Footer_Email_Subscribe', 'activate' ) );
Footer_Email_Subscribe::init();
