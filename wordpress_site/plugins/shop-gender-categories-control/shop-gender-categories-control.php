<?php
/**
 * Plugin Name: Shop Gender Categories Control
 * Description: Forces the Shop sidebar to use Man, Woman and Children categories and hides the default product category filter there.
 * Version: 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const SGCC_MENU_SLUG = 'shop-sidebar-main-categories';
const SGCC_DISPLAY_TERMS = array(
	'men' => 'Man',
	'woman' => 'Woman',
	'children' => 'Children',
);
const SGCC_TYPE_TERMS = array(
	'bags-accessories' => 'Bags & accessories',
	'footwear' => 'Footwear',
	'hoodie' => 'Hoodie',
	'knitwear' => 'Knitwear',
	'outwear' => 'Outwear',
	'pants' => 'Pants',
	'shirt' => 'Shirt',
	'shorts' => 'Shorts',
	't-shirt' => 'T-shirt',
);

/**
 * Keep the shop gender categories in a known state.
 */
function sgcc_sync_product_cat_terms( $terms, $skip_slugs = array() ) {
	foreach ( $terms as $slug => $name ) {
		if ( in_array( $slug, $skip_slugs, true ) ) {
			continue;
		}

		$term = get_term_by( 'slug', $slug, 'product_cat' );
		if ( ! $term instanceof WP_Term ) {
			wp_insert_term(
				$name,
				'product_cat',
				array(
					'slug' => $slug,
				)
			);
			continue;
		}

		if ( $term->name !== $name ) {
			wp_update_term(
				$term->term_id,
				'product_cat',
				array(
					'name' => $name,
				)
			);
		}
	}
}

function sgcc_ensure_shop_gender_terms() {
	if ( ! taxonomy_exists( 'product_cat' ) ) {
		return;
	}

	$men_term = get_term_by( 'slug', 'men', 'product_cat' );
	if ( $men_term instanceof WP_Term && $men_term->name !== SGCC_DISPLAY_TERMS['men'] ) {
		wp_update_term(
			$men_term->term_id,
			'product_cat',
			array(
				'name' => SGCC_DISPLAY_TERMS['men'],
			)
		);
	}

	sgcc_sync_product_cat_terms( SGCC_DISPLAY_TERMS, array( 'men' ) );
	sgcc_sync_product_cat_terms( SGCC_TYPE_TERMS );
}
add_action( 'init', 'sgcc_ensure_shop_gender_terms', 20 );

/**
 * The Shop page and product category archives share the same sidebar layout.
 * Use one guard for both.
 *
 * @return bool
 */
function sgcc_is_shop_context() {
	if ( ! function_exists( 'is_shop' ) || ! function_exists( 'is_product_category' ) ) {
		return false;
	}

	return is_shop() || is_product_category();
}

/**
 * Only the Shop page uses the combined gender/type filter flow.
 *
 * @return bool
 */
function sgcc_is_shop_page_context() {
	return function_exists( 'is_shop' ) && is_shop();
}

/**
 * Get the current selected gender slug from the query string or archive context.
 *
 * @return string
 */
function sgcc_get_current_gender_slug() {
	$gender = isset( $_GET['sgcc_gender'] ) ? sanitize_title( wp_unslash( $_GET['sgcc_gender'] ) ) : '';
	if ( isset( SGCC_DISPLAY_TERMS[ $gender ] ) ) {
		return $gender;
	}

	$current_term = get_queried_object();
	if (
		$current_term instanceof WP_Term
		&& $current_term->taxonomy === 'product_cat'
		&& isset( SGCC_DISPLAY_TERMS[ $current_term->slug ] )
	) {
		return $current_term->slug;
	}

	return '';
}

/**
 * Get the current selected product type slug from the query string.
 *
 * @return string
 */
function sgcc_get_current_type_slug() {
	$type = isset( $_GET['sgcc_type'] ) ? sanitize_title( wp_unslash( $_GET['sgcc_type'] ) ) : '';

	return isset( SGCC_TYPE_TERMS[ $type ] ) ? $type : '';
}

/**
 * Build a Shop URL while preserving the existing non-pagination query string.
 *
 * @param array $overrides
 * @return string
 */
function sgcc_get_shop_filter_url( $overrides = array() ) {
	$base_url = function_exists( 'wc_get_page_permalink' )
		? wc_get_page_permalink( 'shop' )
		: home_url( '/shop/' );

	$query_args = array();
	foreach ( $_GET as $key => $value ) {
		if ( $key === 'product-page' || $key === 'paged' ) {
			continue;
		}
		$query_args[ $key ] = wp_unslash( $value );
	}

	foreach ( $overrides as $key => $value ) {
		if ( $value === null || $value === '' ) {
			unset( $query_args[ $key ] );
		} else {
			$query_args[ $key ] = $value;
		}
	}

	return add_query_arg( $query_args, $base_url );
}

/**
 * Render the gender categories items for the top Shop grid.
 *
 * @return string
 */
function sgcc_get_shop_gender_grid_items_html() {
	$current_term = get_queried_object();
	$current_term_id = (
		$current_term instanceof WP_Term
		&& $current_term->taxonomy === 'product_cat'
	)
		? (int) $current_term->term_id
		: 0;

	$output = '';
	foreach ( SGCC_DISPLAY_TERMS as $slug => $fallback_name ) {
		$term = get_term_by( 'slug', $slug, 'product_cat' );
		if ( ! $term instanceof WP_Term ) {
			continue;
		}

		$url = sgcc_get_shop_filter_url(
			array(
				'sgcc_gender' => $slug,
			)
		);

		$classes = array(
			'w-grid-item',
			'type_term',
			'term-' . (int) $term->term_id,
			'term-' . sanitize_html_class( $term->slug ),
			'ratio_1x1',
		);
		if ( (int) $term->term_id === $current_term_id ) {
			$classes[] = 'current-menu-item';
		}

		$output .= '<div class="' . esc_attr( implode( ' ', $classes ) ) . '">';
		$output .= '<div class="w-grid-item-h">';
		$output .= '<div class="w-post-elm post_title usg_post_title_1 woocommerce-loop-product__title color_link_inherit">';
		$output .= '<a href="' . esc_url( $url ) . '">' . esc_html( $term->name ?: $fallback_name ) . '</a>';
		$output .= '</div></div></div>';
	}

	return $output;
}

/**
 * Replace the top Shop term grid so it always shows Man, Woman and Children.
 *
 * @param string $content
 * @return string
 */
function sgcc_replace_shop_gender_grid_html( $content ) {
	if ( ! sgcc_is_shop_context() || strpos( $content, 'id="us_grid_1"' ) === false ) {
		return $content;
	}

	$replacement_items = sgcc_get_shop_gender_grid_items_html();
	if ( $replacement_items === '' ) {
		return $content;
	}

	$pattern = '/(<div class="w-grid us_custom_a0c9fb39 type_grid layout_4466 cols_3" id="us_grid_1"[^>]*>.*?<div class="w-grid-list">)(.*?)(<\/div>\s*<div class="w-grid-preloader">)/s';
	return preg_replace( $pattern, '$1' . $replacement_items . '$3', $content, 1 ) ?: $content;
}
add_filter( 'the_content', 'sgcc_replace_shop_gender_grid_html', 99 );

/**
 * Force the first Shop categories grid to display the controlled gender terms.
 */
function sgcc_output_shop_gender_grid_script() {
	if ( ! sgcc_is_shop_context() ) {
		return;
	}

	$grid_items_html = sgcc_get_shop_gender_grid_items_html();
	if ( $grid_items_html === '' ) {
		return;
	}

	printf(
		"<script id=\"sgcc-shop-grid-script\">document.addEventListener('DOMContentLoaded',function(){var list=document.querySelector('#us_grid_1 .w-grid-list');if(list){list.innerHTML=%s;}});</script>\n",
		wp_json_encode( $grid_items_html )
	);
}
add_action( 'wp_footer', 'sgcc_output_shop_gender_grid_script', 30 );

/**
 * Render the fixed product type filter block for the Shop sidebar.
 *
 * @return string
 */
function sgcc_get_shop_type_menu_html() {
	$current_type = sgcc_get_current_type_slug();
	$items_html = '';

	foreach ( SGCC_TYPE_TERMS as $slug => $label ) {
		$classes = array(
			'menu-item',
			'menu-item-type-custom',
			'menu-item-object-custom',
			'menu-item-type-' . sanitize_html_class( $slug ),
		);
		if ( $current_type === $slug ) {
			$classes[] = 'current-menu-item';
		}

		$items_html .= sprintf(
			'<li class="%s"><a href="%s">%s</a></li>',
			esc_attr( implode( ' ', $classes ) ),
			esc_url(
				sgcc_get_shop_filter_url(
					array(
						'sgcc_type' => $slug,
					)
				)
			),
			esc_html( $label )
		);
	}

	return sprintf(
		'<nav class="w-menu shop-type-menu layout_ver style_links" style="--main-gap:0.8em;--main-ver-indent:0.8em;--main-hor-indent:0.8em;--main-color:inherit;"><ul class="menu">%s</ul></nav>',
		$items_html
	);
}

/**
 * Render a reset filters link for the Shop sidebar.
 *
 * @return string
 */
function sgcc_get_shop_reset_filters_html() {
	$shop_url = function_exists( 'wc_get_page_permalink' )
		? wc_get_page_permalink( 'shop' )
		: home_url( '/shop/' );

	return sprintf(
		'<div class="shop-reset-filters"><a href="%s">%s</a></div>',
		esc_url( $shop_url ),
		esc_html__( 'Reset filters', 'shop-gender-categories-control' )
	);
}

/**
 * Hide the built-in product category filter on the Shop page and inject the fixed type menu.
 */
function sgcc_output_shop_type_menu_script() {
	if ( ! sgcc_is_shop_page_context() ) {
		return;
	}

	$type_menu_html = sgcc_get_shop_type_menu_html();
	$reset_filters_html = sgcc_get_shop_reset_filters_html();
	if ( $type_menu_html === '' && $reset_filters_html === '' ) {
		return;
	}

	echo "<style id=\"sgcc-shop-filter-css\">
		#gridFilterWrapper [data-source=\"tax|product_cat\"]{display:none!important;}
		.shop-category-menu,
		.shop-type-menu{margin:0!important;}
		.shop-type-menu{padding-top:1.5rem;}
		.shop-reset-filters{padding-top:1rem;}
		.shop-category-menu .menu>li,
		.shop-type-menu .menu>li{margin:0!important;}
		.shop-category-menu .menu>li+li,
		.shop-type-menu .menu>li+li{margin-top:0.7rem!important;}
		.shop-category-menu a,
		.shop-type-menu a{
			display:inline-block;
			font-size:18px!important;
			line-height:1.28!important;
			font-weight:400!important;
			letter-spacing:0!important;
			text-transform:none!important;
		}
		.shop-category-menu .current-menu-item a,
		.shop-type-menu .current-menu-item a{
			text-decoration:underline;
			font-weight:500!important;
		}
		.shop-reset-filters a{
			display:inline-block;
			font-size:14px!important;
			line-height:1.3!important;
			font-weight:400!important;
			text-decoration:underline;
			text-underline-offset:0.12em;
		}
		#gridFilterWrapper [data-source=\"tax|pa_brand\"],
		#gridFilterWrapper [data-source=\"cf|_price\"]{margin-top:1.7rem!important;}
		#gridFilterWrapper [data-source=\"tax|pa_brand\"] .w-filter-item-title,
		#gridFilterWrapper [data-source=\"cf|_price\"] .w-filter-item-title{
			padding:0!important;
			font-size:18px!important;
			line-height:1.28!important;
			font-weight:400!important;
			letter-spacing:0!important;
			text-transform:none!important;
		}
		#gridFilterWrapper [data-source=\"tax|pa_brand\"] .w-filter-item-title:after,
		#gridFilterWrapper [data-source=\"cf|_price\"] .w-filter-item-title:after{
			display:none!important;
		}
		@media (max-width: 600px){
			.shop-type-menu{padding-top:1.2rem;}
			.shop-reset-filters{padding-top:0.85rem;}
			.shop-category-menu a,
			.shop-type-menu a,
			#gridFilterWrapper [data-source=\"tax|pa_brand\"] .w-filter-item-title,
			#gridFilterWrapper [data-source=\"cf|_price\"] .w-filter-item-title{
				font-size:17px!important;
			}
		}
	</style>\n";
	printf(
		"<script id=\"sgcc-shop-type-menu-script\">document.addEventListener('DOMContentLoaded',function(){var filter=document.getElementById('gridFilterWrapper');if(!filter){return;}if(!document.querySelector('.shop-type-menu')){filter.insertAdjacentHTML('beforebegin',%s);}if(!document.querySelector('.shop-reset-filters')){filter.insertAdjacentHTML('beforebegin',%s);}});</script>\n",
		wp_json_encode( $type_menu_html ),
		wp_json_encode( $reset_filters_html )
	);
}
add_action( 'wp_footer', 'sgcc_output_shop_type_menu_script', 31 );

/**
 * Apply the selected gender and type filters to the Shop product query.
 *
 * @param array $query_args
 * @return array
 */
function sgcc_apply_shop_product_cat_filters( $query_args ) {
	if ( ! sgcc_is_shop_page_context() ) {
		return $query_args;
	}

	$selected_terms = array_filter(
		array(
			sgcc_get_current_gender_slug(),
			sgcc_get_current_type_slug(),
		)
	);

	if ( empty( $selected_terms ) ) {
		return $query_args;
	}

	if ( empty( $query_args['tax_query'] ) || ! is_array( $query_args['tax_query'] ) ) {
		$query_args['tax_query'] = array();
	}

	$query_args['tax_query'][] = array(
		'taxonomy' => 'product_cat',
		'field' => 'slug',
		'terms' => array_values( array_unique( $selected_terms ) ),
		'operator' => 'AND',
	);

	return $query_args;
}

/**
 * Apply custom Shop filters while Grid Filter calculates available items.
 *
 * @param array $query_args
 * @return array
 */
function sgcc_filter_shop_grid_filter_main_query_args( $query_args ) {
	return sgcc_apply_shop_product_cat_filters( $query_args );
}
add_filter( 'us_grid_filter_main_query_args', 'sgcc_filter_shop_grid_filter_main_query_args', 20 );

/**
 * Apply custom Shop filters to the main Shop products grid.
 *
 * @param array $query_args
 * @param array $defined_vars
 * @return array
 */
function sgcc_filter_shop_grid_listing_query_args( $query_args, $defined_vars ) {
	if ( ! sgcc_is_shop_page_context() ) {
		return $query_args;
	}

	$post_type = us_arr_path( $defined_vars, 'post_type', us_arr_path( $query_args, 'post_type', '' ) );
	$post_types = is_array( $post_type ) ? $post_type : array( $post_type );
	if ( ! in_array( 'product', $post_types, true ) ) {
		return $query_args;
	}

	return sgcc_apply_shop_product_cat_filters( $query_args );
}
add_filter( 'us_grid_listing_query_args', 'sgcc_filter_shop_grid_listing_query_args', 20, 2 );

/**
 * Apply the same gender/type taxonomy constraint to the main WooCommerce shop query.
 * This keeps the initial products grid in sync with the custom sidebar links.
 *
 * @param array    $tax_query
 * @param WP_Query $query
 * @return array
 */
function sgcc_filter_woocommerce_product_query_tax_query( $tax_query, $query ) {
	if (
		is_admin()
		|| ! $query instanceof WP_Query
		|| ! $query->is_main_query()
		|| ! sgcc_is_shop_page_context()
	) {
		return $tax_query;
	}

	$selected_terms = array_filter(
		array(
			sgcc_get_current_gender_slug(),
			sgcc_get_current_type_slug(),
		)
	);

	if ( empty( $selected_terms ) ) {
		return $tax_query;
	}

	$tax_query[] = array(
		'taxonomy' => 'product_cat',
		'field' => 'slug',
		'terms' => array_values( array_unique( $selected_terms ) ),
		'operator' => 'AND',
	);

	return $tax_query;
}
add_filter( 'woocommerce_product_query_tax_query', 'sgcc_filter_woocommerce_product_query_tax_query', 20, 2 );

/**
 * Catch secondary product queries on the Shop page, including the theme grid query.
 *
 * @param WP_Query $query
 */
function sgcc_pre_get_posts_for_shop_product_queries( $query ) {
	if ( is_admin() || ! $query instanceof WP_Query || ! sgcc_is_shop_page_context() ) {
		return;
	}

	$post_type = $query->get( 'post_type' );
	$post_types = is_array( $post_type ) ? $post_type : array( $post_type );
	if ( ! in_array( 'product', $post_types, true ) ) {
		return;
	}

	$selected_terms = array_filter(
		array(
			sgcc_get_current_gender_slug(),
			sgcc_get_current_type_slug(),
		)
	);

	if ( empty( $selected_terms ) ) {
		return;
	}

	$tax_query = $query->get( 'tax_query' );
	if ( ! is_array( $tax_query ) ) {
		$tax_query = array();
	}

	$tax_query[] = array(
		'taxonomy' => 'product_cat',
		'field' => 'slug',
		'terms' => array_values( array_unique( $selected_terms ) ),
		'operator' => 'AND',
	);

	$query->set( 'tax_query', $tax_query );
}
add_action( 'pre_get_posts', 'sgcc_pre_get_posts_for_shop_product_queries', 20 );

/**
 * Replace the Shop sidebar menu items with Man, Woman and Children.
 *
 * @param array    $items
 * @param stdClass $args
 * @return array
 */
function sgcc_filter_shop_sidebar_menu( $items, $args ) {
	if ( ! sgcc_is_shop_context() ) {
		return $items;
	}

	$menu_slug = '';
	if ( isset( $args->menu ) ) {
		if ( $args->menu instanceof WP_Term ) {
			$menu_slug = (string) $args->menu->slug;
		} elseif ( is_object( $args->menu ) && ! empty( $args->menu->slug ) ) {
			$menu_slug = (string) $args->menu->slug;
		} elseif ( is_string( $args->menu ) ) {
			$menu_slug = sanitize_title( $args->menu );
		}
	}

	if ( $menu_slug !== SGCC_MENU_SLUG ) {
		return $items;
	}

	$current_term = get_queried_object();
	$current_ancestors = array();
	if ( $current_term instanceof WP_Term && $current_term->taxonomy === 'product_cat' ) {
		$current_ancestors = get_ancestors( $current_term->term_id, 'product_cat' );
	}

	$menu_items = array();
	$order = 1;

	foreach ( SGCC_DISPLAY_TERMS as $slug => $fallback_name ) {
		$term = get_term_by( 'slug', $slug, 'product_cat' );
		if ( ! $term instanceof WP_Term ) {
			continue;
		}

		$url = sgcc_get_shop_filter_url(
			array(
				'sgcc_gender' => $slug,
			)
		);

		$item = new stdClass();
		$item->ID = -1000 - $order;
		$item->db_id = 0;
		$item->menu_item_parent = 0;
		$item->object_id = (int) $term->term_id;
		$item->object = 'product_cat';
		$item->type = 'custom';
		$item->type_label = 'Custom Link';
		$item->title = $term->name ?: $fallback_name;
		$item->url = $url;
		$item->target = '';
		$item->attr_title = '';
		$item->description = '';
		$item->classes = array(
			'menu-item',
			'menu-item-type-custom',
			'menu-item-object-custom',
			'menu-item-' . abs( $item->ID ),
		);
		$item->xfn = '';
		$item->status = 'publish';
		$item->menu_order = $order;
		$item->post_parent = 0;
		$item->post_type = 'nav_menu_item';
		$item->post_status = 'publish';
		$item->current = false;
		$item->current_item_parent = false;
		$item->current_item_ancestor = false;
		$item->current_menu_item = false;

		$current_gender = sgcc_get_current_gender_slug();
		if ( $current_gender === $slug ) {
			$item->current = true;
			$item->current_menu_item = true;
			$item->classes[] = 'current-menu-item';
		} elseif (
			$current_term instanceof WP_Term
			&& $current_term->taxonomy === 'product_cat'
			&& in_array( (int) $term->term_id, array_map( 'intval', $current_ancestors ), true )
		) {
			$item->current_item_ancestor = true;
			$item->classes[] = 'current-menu-ancestor';
		}

		$menu_items[] = $item;
		$order++;
	}

	return $menu_items ?: $items;
}
add_filter( 'wp_nav_menu_objects', 'sgcc_filter_shop_sidebar_menu', 20, 2 );
