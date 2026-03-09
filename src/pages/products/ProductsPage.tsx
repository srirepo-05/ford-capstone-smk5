import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Product, ProductsVM } from "../../shared/models/types";
import { getAllProducts } from "../../shared/api/products";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";
import StarRating from "../../shared/components/StarRating";
import useKeyboard from "../../shared/hooks/useKeyboard";
import usePageTitle from "../../shared/hooks/usePageTitle";

// ── ProductsPage ──────────────────────────────────────────────────────────────
// Displays all products with live search and category filter.
// Each card has a quantity stepper that appears after clicking "Add to Cart".

const ProductsPage = () => {
  usePageTitle("All Products");

  // VM state: tracks loading / error / data for the products fetch
  const [vm, setVm] = useState<ProductsVM>({
    products: null,
    loading: true,
    error: null,
  });

  // Controlled search input and active category filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Ref to the search input — used by keyboard shortcuts to focus/blur it
  const searchRef = useRef<HTMLInputElement>(null);

  const { addToCart, isInCart, cartItems, removeFromCart, updateQuantity } = useCart();
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  // Looks up the quantity currently in the cart for a given product id
  const getCartQuantity = (productId: number): number =>
    cartItems.find((item) => item.product.id === productId)?.quantity ?? 0;

  // Fetch all products on mount; cancelled flag prevents setState after unmount
  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setVm({ products: null, loading: true, error: null });
      try {
        const products = await getAllProducts();
        if (!cancelled) setVm({ products, loading: false, error: null });
      } catch (err) {
        console.error("Error fetching products:", err);
        if (!cancelled)
          setVm({
            products: null,
            loading: false,
            error: "Failed to load products. Please try again later.",
          });
      }
    };

    void fetch();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Computed values ───────────────────────────────────────────────────────

  // Products filtered by current search term and selected category
  const filteredProducts = useMemo<Product[]>(() => {
    if (!vm.products) return [];
    const term = searchTerm.toLowerCase().trim();
    return vm.products.filter((p) => {
      const matchesSearch = !term || p.title.toLowerCase().includes(term);
      const matchesCategory =
        !selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [vm.products, searchTerm, selectedCategory]);

  // Sorted unique category list — used to render the filter pills
  const categories = useMemo<string[]>(() => {
    if (!vm.products) return [];
    return [...new Set(vm.products.map((p) => p.category))].sort();
  }, [vm.products]);

  // Adds 1 unit to the cart and shows a toast
  const handleAddToCart = (product: Product): void => {
    const result = addToCart(product);
    if (result.success) {
      showToast(`"${product.title}" added to cart!`, "success");
    } else {
      showToast(result.message, "error");
    }
  };

  const clearFilters = (): void => {
    setSearchTerm("");
    setSelectedCategory("");
  };

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  // Escape: clear the search term and active category filter, then blur the input
  const handleEscape = useCallback(() => {
    if (searchTerm || selectedCategory) {
      clearFilters();
      searchRef.current?.blur();
    }
  }, [searchTerm, selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // /  key: focus the search input (only when the user is NOT already typing in an input)
  const handleSlash = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    e.preventDefault();
    searchRef.current?.focus();
  }, []);

  useKeyboard("Escape", handleEscape);
  useKeyboard("/", handleSlash);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            All Products
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Browse our full collection from the store.
          </p>

          {/* Search Bar */}
          <div className="mt-5 flex items-center gap-3 max-w-lg">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
                />
              </svg>
              <input
                type="text"
                ref={searchRef}
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
              />
            </div>

            {/* Show clear button only when a filter is active */}
            {(searchTerm || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-red-500 font-medium transition-colors whitespace-nowrap"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Category filter pills — only shown once products have loaded */}
          {categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("")}
                className={
                  selectedCategory === ""
                    ? "px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-600 text-white"
                    : "px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                }
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={
                    selectedCategory === cat
                      ? "px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-600 text-white capitalize"
                      : "px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors capitalize"
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Loading Spinner */}
        {vm.loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600" />
            <p className="text-gray-400 text-sm">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {!vm.loading && vm.error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-10 text-center">
            <svg
              className="w-12 h-12 text-red-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
            <p className="text-red-600 font-medium">{vm.error}</p>
          </div>
        )}

        {/* Product Grid */}
        {!vm.loading && vm.products && (
          <>
            {/* Result count */}
            <p className="text-sm text-gray-400 mb-6">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {filteredProducts.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {vm.products.length}
              </span>{" "}
              products
            </p>

            {/* No results after filtering */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <svg
                  className="w-16 h-16 text-gray-200 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
                  />
                </svg>
                <p className="text-lg font-semibold text-gray-700 mb-1">
                  No products found
                </p>
                <p className="text-sm text-gray-400 mb-5">
                  Try a different search term or category.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    {/* Image area */}
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
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                        {product.category}
                      </span>
                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-sm font-semibold text-gray-800 mb-3 line-clamp-2 hover:text-blue-600 transition-colors leading-snug">
                          {product.title}
                        </h3>
                      </Link>

                      {/* Star Rating */}
                      <div className="flex items-center gap-1.5 mb-4">
                        <StarRating rate={product.rating.rate} />
                        <span className="text-xs text-gray-400">
                          ({product.rating.count})
                        </span>
                      </div>

                      {/* Price + Add to Cart */}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                        <span className="text-lg font-extrabold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>

                        {/* Admin badge or Add-to-Cart button/in-cart counter */}
                        {isAdmin() ? (
                          /* Admin view — cart disabled */
                          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-2 rounded-lg cursor-not-allowed select-none">
                            Admin View
                          </span>
                        ) : isInCart(product.id) ? (
                          /* ── In-cart counter ───────────────────────────
                             Shown when the product is already in the cart.
                             − decreases qty (removes when qty reaches 0).
                             + increases qty. Replaces the Add to Cart button. */
                          <div className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 overflow-hidden">
                            {/* Decrease / remove */}
                            <button
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
                        ) : (
                          /* Add to Cart — adds 1 unit immediately */
                          <button
                            onClick={() => handleAddToCart(product)}
                            aria-label={`Add ${product.title} to cart`}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all"
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
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
