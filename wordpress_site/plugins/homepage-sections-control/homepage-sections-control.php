<?php
/**
 * Plugin Name: Homepage Sections Control
 * Description: Adds controllable homepage sections for WooCommerce products and connects them to product CSV import.
 * Version: 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Homepage_Sections_Control {
	const TAXONOMY = 'homepage_section';
	const IMPORT_META_KEY = '_homepage_sections';

	const SECTION_NEW_ARRIVALS = 'new-arrivals';
	const SECTION_MOST_WANTED = 'most-wanted';
	const SECTION_SELECTS = '77-selects';
	const SECTION_JUST_DROPPED = 'just-dropped';

	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_taxonomy' ) );
		add_action( 'init', array( __CLASS__, 'ensure_default_terms' ), 20 );

		add_filter( 'us_grid_listing_query_args', array( __CLASS__, 'filter_homepage_grids' ), 20, 2 );

		add_filter( 'woocommerce_csv_product_import_mapping_default_columns', array( __CLASS__, 'register_import_default_mappings' ) );
		add_filter( 'woocommerce_csv_product_import_mapping_options', array( __CLASS__, 'register_import_mapping_options' ), 10, 2 );
		add_action( 'woocommerce_product_import_inserted_product_object', array( __CLASS__, 'sync_imported_sections' ), 10, 2 );
		add_action( 'set_object_terms', array( __CLASS__, 'sync_terms_meta' ), 20, 6 );
	}

	public static function register_taxonomy() {
		$labels = array(
			'name'              => 'Homepage Sections',
			'singular_name'     => 'Homepage Section',
			'search_items'      => 'Search Homepage Sections',
			'all_items'         => 'All Homepage Sections',
			'edit_item'         => 'Edit Homepage Section',
			'update_item'       => 'Update Homepage Section',
			'add_new_item'      => 'Add New Homepage Section',
			'new_item_name'     => 'New Homepage Section',
			'menu_name'         => 'Homepage Sections',
		);

		register_taxonomy(
			self::TAXONOMY,
			array( 'product' ),
			array(
				'labels'            => $labels,
				'public'            => false,
				'show_ui'           => true,
				'show_admin_column' => true,
				'show_in_nav_menus' => false,
				'show_tagcloud'     => false,
				'hierarchical'      => true,
				'query_var'         => false,
				'rewrite'           => false,
				'show_in_rest'      => true,
				'meta_box_cb'       => 'post_categories_meta_box',
			)
		);
	}

	public static function ensure_default_terms() {
		foreach ( self::get_sections_map() as $slug => $label ) {
			if ( ! term_exists( $slug, self::TAXONOMY ) ) {
				wp_insert_term(
					$label,
					self::TAXONOMY,
					array(
						'slug' => $slug,
					)
				);
			}
		}
	}

	public static function filter_homepage_grids( $query_args, $defined_vars ) {
		$grid_id = isset( $defined_vars['el_id'] ) ? (string) $defined_vars['el_id'] : '';
		if ( '' === $grid_id ) {
			return $query_args;
		}

		$grid_map = array(
			'homeNewArrivalsGrid'      => self::SECTION_NEW_ARRIVALS,
			'homeMostWantedGrid'       => self::SECTION_MOST_WANTED,
			'homeSelectsGrid'          => self::SECTION_SELECTS,
			'homeJustDroppedGrid'      => self::SECTION_JUST_DROPPED,
			'homeJustDroppedGridMobile'=> self::SECTION_JUST_DROPPED,
		);

		if ( ! isset( $grid_map[ $grid_id ] ) ) {
			return $query_args;
		}

		$section_slug = $grid_map[ $grid_id ];
		$term = get_term_by( 'slug', $section_slug, self::TAXONOMY );
		if ( ! $term || is_wp_error( $term ) || (int) $term->count < 1 ) {
			return $query_args;
		}

		if ( empty( $query_args['tax_query'] ) || ! is_array( $query_args['tax_query'] ) ) {
			$query_args['tax_query'] = array();
		}

		// Replace legacy homepage filters with the new section assignment where needed.
		foreach ( $query_args['tax_query'] as $index => $clause ) {
			if ( isset( $clause['taxonomy'] ) && 'product_cat' === $clause['taxonomy'] && self::SECTION_JUST_DROPPED === $section_slug ) {
				unset( $query_args['tax_query'][ $index ] );
			}
		}

		$query_args['tax_query'][] = array(
			'taxonomy' => self::TAXONOMY,
			'field'    => 'slug',
			'terms'    => array( $section_slug ),
			'operator' => 'IN',
		);

		return $query_args;
	}

	public static function register_import_default_mappings( $mappings ) {
		$mappings['Homepage Sections'] = 'meta:' . self::IMPORT_META_KEY;
		$mappings['Homepage Section'] = 'meta:' . self::IMPORT_META_KEY;
		$mappings['Секции главной'] = 'meta:' . self::IMPORT_META_KEY;
		$mappings['Секция главной'] = 'meta:' . self::IMPORT_META_KEY;

		return $mappings;
	}

	public static function register_import_mapping_options( $options, $item ) {
		$options['meta:' . self::IMPORT_META_KEY] = 'Homepage Sections';

		return $options;
	}

	public static function sync_imported_sections( $product, $data ) {
		$raw_value = self::extract_import_meta_value( $data );
		if ( '' === $raw_value ) {
			return;
		}

		$slugs = self::normalize_imported_sections( $raw_value );
		if ( empty( $slugs ) ) {
			return;
		}

		$product_id = $product->get_id();
		if ( $product->is_type( 'variation' ) && $product->get_parent_id() ) {
			$product_id = $product->get_parent_id();
		}

		wp_set_object_terms( $product_id, $slugs, self::TAXONOMY, false );
		update_post_meta( $product_id, self::IMPORT_META_KEY, implode( ', ', $slugs ) );
	}

	public static function sync_terms_meta( $object_id, $terms, $tt_ids, $taxonomy, $append, $old_tt_ids ) {
		if ( self::TAXONOMY !== $taxonomy ) {
			return;
		}

		$terms = wp_get_object_terms( $object_id, self::TAXONOMY, array( 'fields' => 'slugs' ) );
		if ( is_wp_error( $terms ) ) {
			return;
		}
		update_post_meta( $object_id, self::IMPORT_META_KEY, implode( ', ', $terms ) );
	}

	private static function extract_import_meta_value( $data ) {
		if ( empty( $data['meta_data'] ) || ! is_array( $data['meta_data'] ) ) {
			return '';
		}

		foreach ( $data['meta_data'] as $meta ) {
			if ( isset( $meta['key'] ) && self::IMPORT_META_KEY === $meta['key'] ) {
				return is_scalar( $meta['value'] ) ? (string) $meta['value'] : '';
			}
		}

		return '';
	}

	private static function normalize_imported_sections( $raw_value ) {
		$values = preg_split( '/[|,;]+/', (string) $raw_value );
		if ( ! is_array( $values ) ) {
			return array();
		}

		$available = self::get_sections_map();
		$result = array();

		foreach ( $values as $value ) {
			$value = sanitize_title( trim( wp_strip_all_tags( $value ) ) );
			if ( '' === $value ) {
				continue;
			}

			foreach ( $available as $slug => $label ) {
				$label_slug = sanitize_title( $label );
				if ( $value === $slug || $value === $label_slug ) {
					$result[] = $slug;
					break;
				}
			}
		}

		return array_values( array_unique( $result ) );
	}

	private static function get_sections_map() {
		return array(
			self::SECTION_NEW_ARRIVALS => 'New arrivals',
			self::SECTION_MOST_WANTED => 'Most wanted',
			self::SECTION_SELECTS => '77 selects',
			self::SECTION_JUST_DROPPED => 'Just dropped',
		);
	}
}

Homepage_Sections_Control::init();
