import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ProductDetailVM } from "../../shared/models/types";
import type { Product } from "../../shared/models/types";
import { getProductById } from "../../shared/api/products";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";
import StarRating from "../../shared/components/StarRating";
import usePageTitle from "../../shared/hooks/usePageTitle";

// ── ProductDetailPage ─────────────────────────────────────────────────────────
// Reads the product id from the URL via useParams (/products/:id), fetches the
// product, and renders the detail view with a quantity stepper add-to-cart flow.

// ── Component ─────────────────────────────────────────────────────────────────

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [vm, setVm] = useState<ProductDetailVM>({
    product: null,
    loading: true,
    error: null,
  });

  // Currently selected quantity for the stepper
  // Stepper removed — "Add to Cart" now adds 1 unit immediately.

  const { addToCart, isInCart, cartItems, removeFromCart, updateQuantity } = useCart();
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  // Looks up the quantity currently in the cart for this product
  const cartQuantity = vm.product
    ? (cartItems.find((item) => item.product.id === vm.product!.id)?.quantity ?? 0)
    : 0;

  // Show product title once loaded; fall back to a generic label while fetching
  usePageTitle(vm.product ? vm.product.title : "Product");

  // Fetch the product by id on mount; cancelled flag prevents setState after unmount
  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      if (!id) {
        setVm({
          product: null,
          loading: false,
          error: "Product not found or failed to load.",
        });
        return;
      }

      setVm({ product: null, loading: true, error: null }); // reset before each fetch
      try {
        const product = await getProductById(id);
        if (!cancelled) setVm({ product, loading: false, error: null });
      } catch (err) {
        console.error("Error fetching product:", err);
        if (!cancelled)
          setVm({
            product: null,
            loading: false,
            error: "Product not found or failed to load.",
          });
      }
    };

    void fetch();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ── Cart helpers ──────────────────────────────────────────────────────────

  // Adds 1 unit to the cart immediately and shows a toast
  const handleAddToCart = (product: Product): void => {
    const result = addToCart(product);
    if (result.success) {
      showToast(`"${product.title}" added to cart!`, "success");
    } else {
      showToast(result.message, "error");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Products
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Loading Spinner */}
        {vm.loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600" />
            <p className="text-gray-400 text-sm">Loading product...</p>
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
            <p className="text-red-600 font-medium mb-3">{vm.error}</p>
            <Link
              to="/products"
              className="text-blue-600 text-sm underline hover:text-blue-700"
            >
              Go back to products
            </Link>
          </div>
        )}

        {/* Product Detail Card */}
        {!vm.loading && vm.product && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="md:grid md:grid-cols-2">
              {/* Left: Image Panel */}
              <div className="bg-gray-50 flex items-center justify-center p-10 md:min-h-120">
                <img
                  src={vm.product.image}
                  alt={vm.product.title}
                  className="max-h-80 w-full object-contain drop-shadow-md"
                />
              </div>

              {/* Right: Info Panel */}
              <div className="p-8 md:p-10 flex flex-col">
                {/* Category + Title */}
                <div className="mb-5">
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">
                    {vm.product.category}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2 leading-snug">
                    {vm.product.title}
                  </h1>
                </div>

                {/* Rating Row */}
                <div className="flex items-center gap-2 mb-6">
                  <StarRating rate={vm.product.rating.rate} />
                  <span className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">
                      {vm.product.rating.rate}
                    </span>
                    {" · "}
                    {vm.product.rating.count} reviews
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-500 leading-relaxed text-sm mb-8 flex-1">
                  {vm.product.description}
                </p>

                {/* Divider */}
                <div className="border-t border-gray-100 pt-6">
                  {/* Price */}
                  <div className="mb-5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                      Price
                    </p>
                    <span className="text-4xl font-extrabold text-gray-900">
                      ${vm.product.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Add to Cart CTA — admin sees disabled button; in-cart shows counter; others see stepper */}
                  {
                    isAdmin() ? (
                      /* Admin view — cart disabled */
                      <button
                        disabled
                        className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 font-semibold py-3.5 px-6 rounded-xl cursor-not-allowed select-none"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Admin View
                      </button>
                    ) : isInCart(vm.product.id) ? (
                      /* ── In-cart counter ───────────────────────────────
                         Replaces "Add to Cart" once the product is in the
                         cart. − reduces qty (removes item at 0). + adds one.
                         Pressing − all the way returns to the Add to Cart
                         button automatically. */
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 font-medium">In cart:</span>
                        <div className="flex items-center rounded-xl border border-blue-200 bg-blue-50 overflow-hidden flex-1 justify-center">
                          {/* Decrease / remove */}
                          <button
                            onClick={() => {
                              const newQty = cartQuantity - 1;
                              if (newQty <= 0) {
                                removeFromCart(vm.product!.id);
                              } else {
                                updateQuantity(vm.product!.id, newQty);
                              }
                            }}
                            className="w-11 h-11 flex items-center justify-center text-blue-600 hover:bg-blue-100 font-bold text-lg transition-colors"
                            aria-label="Remove one from cart"
                          >
                            −
                          </button>
                          {/* Current cart quantity */}
                          <span
                            className="flex-1 text-center text-base font-bold text-blue-700"
                            aria-live="polite"
                            aria-label={`${cartQuantity} in cart`}
                          >
                            {cartQuantity}
                          </span>
                          {/* Increase */}
                          <button
                            onClick={() => updateQuantity(vm.product!.id, cartQuantity + 1)}
                            disabled={cartQuantity >= 99}
                            className="w-11 h-11 flex items-center justify-center text-blue-600 hover:bg-blue-100 font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Add one more to cart"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Add to Cart — adds 1 unit immediately */
                      <button
                        onClick={() => handleAddToCart(vm.product!)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
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
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Add to Cart
                      </button>
                    ) /* end isInCart ternary */
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
