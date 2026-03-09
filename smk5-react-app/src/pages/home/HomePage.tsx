import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Product, HomeVM } from "../../shared/models/types";
import { getProducts } from "../../shared/api/products";
import StarRating from "../../shared/components/StarRating";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";
import usePageTitle from "../../shared/hooks/usePageTitle";

// ── HomePage ──────────────────────────────────────────────────────────────────
const HomePage = () => {
  usePageTitle("Home");
  const [vm, setVm] = useState<HomeVM>({
    featuredProducts: null,
    loading: true,
    error: null,
  });

  // Per-product quantity selection (Map<productId, qty>)
  // Which product cards are showing the quantity stepper (Set<productId>)
  // Both removed — "Add to Cart" now adds 1 unit instantly.

  // Toast from context — shows feedback when adding to cart
  const { showToast } = useToast();

  // addToCart from CartContext — actually mutates the cart state + localStorage
  const { addToCart: addToCartContext, isInCart, cartItems, removeFromCart, updateQuantity } = useCart();

  // isAdmin() — hides cart CTA for admin users
  const { isAdmin } = useAuth();

  // Looks up the quantity currently in the cart for a given product id
  const getCartQuantity = (productId: number): number =>
    cartItems.find((item) => item.product.id === productId)?.quantity ?? 0;

  // Fetch featured products on mount; cancelled flag prevents setState after unmount
  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        // getProducts(8) — fetch only the first 8 products for the featured section
        const products = await getProducts(8);
        if (!cancelled) {
          setVm({ featuredProducts: products, loading: false, error: null });
        }
      } catch (err) {
        console.error("Error loading featured products:", err);
        if (!cancelled) {
          setVm({
            featuredProducts: null,
            loading: false,
            error: "Failed to load products. Please try again later.",
          });
        }
      }
    };

    fetchProducts();

    // Cleanup — cancels any in-flight state updates when the component unmounts
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Cart helpers ──────────────────────────────────────────────────────────

  // Adds 1 unit to the cart immediately and shows a toast
  const addToCart = (product: Product): void => {
    const result = addToCartContext(product);
    if (result.success) {
      showToast(`"${product.title}" added to cart!`, "success");
    } else {
      showToast(result.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <section className="relative bg-[#0a1628] text-white overflow-hidden w-full">
        {/* Geometric grid overlay for depth */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59,130,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
          aria-hidden="true"
        />

        {/* Glowing accent blobs */}
        <div
          className="absolute top-0 right-0 w-125 h-125 bg-blue-600 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 opacity-10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"
          aria-hidden="true"
        />

        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="mx-auto max-w-7xl">
            <div className="md:grid md:grid-cols-2 md:gap-16 md:items-center">
              {/* Left: copy */}
              <div>
                {/* Eyebrow label */}
                <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
                  <span
                    className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"
                    aria-hidden="true"
                  />
                  New Arrivals — 2026
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] mb-6 tracking-tight">
                  The Store
                  <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300">
                    Built for You.
                  </span>
                </h1>

                <div className="flex flex-wrap gap-4">
                  <a
                    href="products"
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    Shop Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ───────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
            <div className="flex items-center gap-4 p-5 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Free Shipping
                </h3>
                <p className="text-sm text-gray-500">
                  On all orders over $50
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Secure Payment
                </h3>
                <p className="text-sm text-gray-500">
                  100% protected checkout
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  24/7 Support
                </h3>
                <p className="text-sm text-gray-500">
                  We're always here to help
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Products ───────────────────────────────────────────────── */}
      <section id="products" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-1">
                Hand-picked for you
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Featured Products
              </h2>
            </div>
            <a
              href="products"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>

          {/* ── Loading ────────────────────────────────────────────────── */}
          {vm.loading && (
            <div className="flex items-center justify-center py-24">
              <div
                className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"
                role="status"
                aria-label="Loading products"
              />
            </div>
          )}

          {/* ── Error ─────────────────────────────────────────────────── */}
          {!vm.loading && vm.error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <p className="text-red-600 font-medium">{vm.error}</p>
            </div>
          )}

          {/* ── Product Grid ────────────────────────────────────────────── */}
          {!vm.loading && !vm.error && vm.featuredProducts && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {vm.featuredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    {/* Image */}
                    <Link
                      to={`/products/${product.id}`}
                      className="block relative bg-gray-50 h-52 overflow-hidden"
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Card Body */}
                    <div className="p-4 flex flex-col flex-1">
                      {/* Category */}
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                        {product.category}
                      </span>

                      {/* Title */}
                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-sm font-semibold text-gray-800 mb-3 line-clamp-2 hover:text-blue-600 transition-colors leading-snug">
                          {product.title}
                        </h3>
                      </Link>

                      {/* Stars + count */}
                      <div className="flex items-center gap-1.5 mb-4">
                        <StarRating rate={product.rating.rate} />
                        <span className="text-xs text-gray-400">
                          ({product.rating.count})
                        </span>
                      </div>

                      {/* ── Price + CTA ─────────────────────────────────── */}
                      <div className="mt-auto pt-3 border-t border-gray-50">
                        {/* Admin users see a disabled badge instead of the cart button */}
                        {
                          isAdmin() ? (
                            /* Admin view — cart disabled */
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-extrabold text-gray-900">
                                ${product.price.toFixed(2)}
                              </span>
                              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-2 rounded-lg cursor-not-allowed select-none">
                                Admin View
                              </span>
                            </div>
                          ) : isInCart(product.id) ? (
                            /* ── In-cart counter ─────────────────────────
                               Replaces "Add to Cart" once the product is
                               already in the cart. − removes one (or the
                               whole item when qty hits 0). + adds one more. */
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-extrabold text-gray-900">
                                ${product.price.toFixed(2)}
                              </span>
                              <div className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 overflow-hidden">
                                {/* Decrease / remove */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newQty = getCartQuantity(product.id) - 1;
                                    if (newQty <= 0) {
                                      removeFromCart(product.id);
                                    } else {
                                      updateQuantity(product.id, newQty);
                                    }
                                  }}
                                  className="w-7 h-7 flex items-center justify-center text-blue-600 hover:bg-blue-100 font-bold text-base transition-colors"
                                  aria-label="Remove one from cart"
                                >
                                  −
                                </button>
                                {/* Current cart quantity */}
                                <span
                                  className="w-7 text-center text-xs font-bold text-blue-700"
                                  aria-live="polite"
                                  aria-label={`${getCartQuantity(product.id)} in cart`}
                                >
                                  {getCartQuantity(product.id)}
                                </span>
                                {/* Increase */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(product.id, getCartQuantity(product.id) + 1)
                                  }
                                  disabled={getCartQuantity(product.id) >= 99}
                                  className="w-7 h-7 flex items-center justify-center text-blue-600 hover:bg-blue-100 font-bold text-base disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  aria-label="Add one more to cart"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Add to Cart — adds 1 unit immediately */
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-extrabold text-gray-900">
                                ${product.price.toFixed(2)}
                              </span>
                              <button
                                type="button"
                                onClick={() => addToCart(product)}
                                aria-label={`Add ${product.title} to cart`}
                                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                  />
                                </svg>
                                Add to Cart
                              </button>
                            </div>
                          ) /* end isInCart ternary */
                        }
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Mobile "View All" link */}
              <div className="sm:hidden text-center mt-8">
                <a
                  href="products"
                  className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  View all products
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
