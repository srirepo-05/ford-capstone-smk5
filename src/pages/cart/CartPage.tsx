import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import type { CheckoutFormValues, Product } from "../../shared/models/types";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";
import useKeyboard from "../../shared/hooks/useKeyboard";
import usePageTitle from "../../shared/hooks/usePageTitle";

// ── CartPage ──────────────────────────────────────────────────────────────────
// Displays cart items, an order summary, and a checkout form.
// All cart state comes from CartContext; toast notifications from ToastContext.

const TAX_RATE = 0.1; // 10% tax applied to the order subtotal

const CartPage = () => {
  usePageTitle("Shopping Cart");

  const {
    cartItems,
    itemCount,
    totalPrice,
    uniqueItemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const { showToast } = useToast();

  // Inline helpers for adjusting item quantity
  const increaseQty = (productId: number, currentQty: number) =>
    updateQuantity(productId, currentQty + 1);
  const decreaseQty = (productId: number, currentQty: number) =>
    updateQuantity(productId, currentQty - 1);

  // Tracks which item is pending removal — shows inline Yes/No confirmation
  const [pendingRemoveId, setPendingRemoveId] = useState<number | null>(null);

  // Controls visibility of the checkout form section
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  // Switches to the order-placed success screen after a successful checkout
  const [orderPlaced, setOrderPlaced] = useState(false);

  // react-hook-form for the checkout form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    mode: "onTouched",
    defaultValues: { fullName: "", address: "", phone: "" },
  });

  // Ref used to scroll the checkout form into view when it opens
  const checkoutRef = useRef<HTMLDivElement>(null);

  // ── Computed values ─────────────────────────────────────────────────────────
  // Derived from CartContext totals

  const estimatedTax = totalPrice * TAX_RATE;
  const grandTotal = totalPrice + estimatedTax;

  // ── Handlers ────────────────────────────────────────────────────────────────

  // Stages a removal — shows inline Yes/No confirmation on the item row
  const requestRemove = (productId: number): void => {
    setPendingRemoveId(productId);
  };

  // Confirmed removal — removes item and shows a toast
  const confirmRemove = (product: Product): void => {
    removeFromCart(product.id);
    setPendingRemoveId(null);
    showToast(`"${product.title}" removed from cart.`, "info");
  };

  // User cancelled the removal confirmation
  const cancelRemove = (): void => {
    setPendingRemoveId(null);
  };

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  // Escape: dismiss pending remove confirmation, then close the checkout form

  const handleEscape = useCallback(() => {
    if (pendingRemoveId !== null) {
      setPendingRemoveId(null);
      return;
    }
    if (showCheckoutForm) {
      setShowCheckoutForm(false);
    }
  }, [pendingRemoveId, showCheckoutForm]);

  useKeyboard("Escape", handleEscape);
  const handleClearCart = (): void => {
    if (window.confirm("Remove all items from your cart?")) {
      clearCart();
      showToast("Cart cleared.", "info");
      setShowCheckoutForm(false);
      setOrderPlaced(false);
    }
  };

  // Shows the checkout form and scrolls it into view after React has rendered it
  const openCheckoutForm = (): void => {
    setShowCheckoutForm(true);
    setTimeout(() => {
      checkoutRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  // Called by handleSubmit after react-hook-form validation passes
  const onCheckoutSubmit = (): void => {
    clearCart();
    reset();
    setOrderPlaced(true);
    setShowCheckoutForm(false);
    showToast("Order placed successfully! 🎉", "success");
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-4H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            {itemCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-2.5 py-0.5 rounded-full">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── EMPTY STATE ─────────────────────────────────────────────────────
            Rendered outside the grid so it spans the full page width and is
            truly centred regardless of viewport size. */}
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-blue-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-4H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              Looks like you haven't added anything yet. Browse our products
              and find something you love!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Shop Now
            </Link>
          </div>
        ) : (
          /* ── CART WITH ITEMS ──────────────────────────────────────────────── */
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* LEFT: Cart item list */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors mb-2"
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
              Continue Shopping
            </Link>

            {/* Item list */}
            {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex gap-4">
                    {/* Product image */}
                    <Link
                      to={`/products/${item.product.id}`}
                      className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-full h-full object-contain p-2"
                        loading="lazy"
                      />
                    </Link>

                    {/* Product info + controls */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-1 capitalize">
                            {item.product.category}
                          </span>
                          <Link
                            to={`/products/${item.product.id}`}
                            className="block text-sm sm:text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                          >
                            {item.product.title}
                          </Link>
                          <p className="text-blue-600 font-bold mt-1">
                            ${item.product.price.toFixed(2)}
                            <span className="text-gray-400 font-normal text-xs">
                              {" "}
                              / unit
                            </span>
                          </p>
                        </div>

                        {/* Line subtotal */}
                        <p className="text-right shrink-0 font-bold text-gray-900 text-sm sm:text-base">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity stepper + remove */}
                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
                          <button
                            onClick={() =>
                              decreaseQty(item.product.id, item.quantity)
                            }
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-lg"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-10 text-center text-sm font-semibold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              increaseQty(item.product.id, item.quantity)
                            }
                            disabled={item.quantity >= 99}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-lg"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Inline remove confirmation — shown when this item is pending removal */}
                        {pendingRemoveId === item.product.id ? (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">Remove item?</span>
                            <button
                              onClick={() => confirmRemove(item.product)}
                              className="text-red-600 font-semibold hover:text-red-700 transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              onClick={cancelRemove}
                              className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => requestRemove(item.product.id)}
                            aria-label="Remove item from cart"
                            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }

            {/* Clear Cart button — only shown when cart has items */}
            {cartItems.length > 0 && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleClearCart}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium flex items-center gap-1.5"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Clear Cart
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Order Summary — only shown when cart has items */}
          {cartItems.length > 0 && (
            <div className="mt-8 lg:mt-0 lg:col-span-5 xl:col-span-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-5">
                  Order Summary
                </h2>

                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">
                      Subtotal{" "}
                      <span className="text-gray-400">
                        ({uniqueItemCount}{" "}
                        {uniqueItemCount === 1 ? "product" : "products"},{" "}
                        {itemCount} {itemCount === 1 ? "unit" : "units"})
                      </span>
                    </dt>
                    <dd className="font-semibold text-gray-900">
                      ${totalPrice.toFixed(2)}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-gray-500">Shipping</dt>
                    <dd className="text-emerald-600 font-semibold">FREE</dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-gray-500">Estimated Tax (10%)</dt>
                    <dd className="font-semibold text-gray-900">
                      ${estimatedTax.toFixed(2)}
                    </dd>
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-bold">
                    <dt className="text-gray-900">Total</dt>
                    <dd className="text-blue-600 text-lg">
                      ${grandTotal.toFixed(2)}
                    </dd>
                  </div>
                </dl>

                <button
                  onClick={openCheckoutForm}
                  className="mt-6 w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Proceed to Checkout
                </button>

                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    Secure Checkout
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    Safe Payment
                  </span>
                </div>
              </div>
            </div>
          )}
          </div>
        )}

        {/* ── CHECKOUT FORM ───────────────────────────────────────────────────
            Shown when the user clicks "Proceed to Checkout".
            id="checkout-form" is targeted by scrollIntoView (via checkoutRef). */}
        {showCheckoutForm && (
          <div
            id="checkout-form"
            ref={checkoutRef}
            className="mt-10 max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Delivery Details
                  </h2>
                  <p className="text-sm text-gray-400">
                    Tell us where to send your order
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onCheckoutSubmit)} noValidate>
                {/* Full Name */}
                <div className="mb-5">
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="e.g. John Smith"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition ${errors.fullName ? "border-red-300" : "border-gray-200"}`}
                    {...register("fullName", {
                      required: "Please enter your full name.",
                      // pattern blocks digits and special chars before validate runs
                      pattern: {
                        value: /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]{2,}$/,
                        message:
                          "Name must contain only letters and be at least 2 characters.",
                      },
                      // validate ensures at least two words (first + last name)
                      validate: (v) =>
                        v.trim().split(/\s+/).filter(Boolean).length >= 2 ||
                        "Please enter both a first and last name.",
                    })}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Delivery Address */}
                <div className="mb-5">
                  <label
                    htmlFor="address"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="address"
                    rows={3}
                    placeholder="Street, City, State, ZIP"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition resize-none ${errors.address ? "border-red-300" : "border-gray-200"}`}
                    {...register("address", {
                      required: "Please enter a delivery address.",
                      // validate checks length, presence of street name (letters) and
                      // house number (digits) to reject vague inputs like "my house"
                      validate: (v) => {
                        const trimmed = v.trim();
                        if (trimmed.length < 10)
                          return "Address must be at least 10 characters.";
                        if (!/[A-Za-z]/.test(trimmed))
                          return "Address must include a street name.";
                        if (!/\d/.test(trimmed))
                          return "Address must include a street number.";
                        return true;
                      },
                    })}
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="mb-7">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="e.g. +1 555 000 1234"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition ${errors.phone ? "border-red-300" : "border-gray-200"}`}
                    {...register("phone", {
                      required: "Please enter a phone number.",
                      // Strip non-digits first so formats like "+1 (555) 000-1234"
                      // are counted correctly — pure pattern matching would reject them.
                      validate: (v) => {
                        const digits = v.replace(/\D/g, "");
                        if (digits.length < 7)
                          return "Phone number must have at least 7 digits.";
                        if (digits.length > 15)
                          return "Phone number must not exceed 15 digits.";
                        if (!/^[0-9+\-\s()]{7,20}$/.test(v.trim()))
                          return "Please enter a valid phone number.";
                        return true;
                      },
                    })}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Order total recap */}
                <div className="flex items-center justify-between bg-blue-50 rounded-xl px-5 py-4 mb-7">
                  <span className="text-sm font-semibold text-gray-700">
                    Order Total
                  </span>
                  <span className="text-lg font-extrabold text-blue-600">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCheckoutForm(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    ← Back to Cart
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Place Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── ORDER PLACED SUCCESS ─────────────────────────────────────────────
            Shown after a successful checkout */}
        {orderPlaced && (
          <div className="mt-10 max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              Order Placed!
            </h2>
            <p className="text-gray-500 mb-8">
              Thank you for your purchase. We'll get it to you soon.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-sm"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
