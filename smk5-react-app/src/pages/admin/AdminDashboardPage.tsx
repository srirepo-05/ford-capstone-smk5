import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type {
  DashboardVM,
  Product,
  ProductFormValues,
} from "../../shared/models/types";
import { getAllProducts } from "../../shared/api/products";
import { useToast } from "../../contexts/ToastContext";
import useKeyboard from "../../shared/hooks/useKeyboard";
import usePageTitle from "../../shared/hooks/usePageTitle";

const AdminDashboardPage = () => {
  usePageTitle("Admin Dashboard");

  // VM state: tracks loading / error / data for the products fetch
  const [vm, setVm] = useState<DashboardVM>({
    products: null,
    loading: true,
    error: null,
  });

  // Local product list — decoupled from vm so add/edit/delete update the table instantly
  // without re-fetching from the API
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // 'add' | 'edit' | null — controls which modal (if any) is open
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);

  // The product currently being edited (null when adding a new product)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // The product pending deletion — when non-null a confirmation dialog is shown
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const { showToast } = useToast();

  // react-hook-form manages the add/edit form — reset() pre-fills fields for edit mode
  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors, touchedFields },
  } = useForm<ProductFormValues>({
    mode: "onTouched",
    defaultValues: {
      title: "",
      price: "",
      category: "",
      description: "",
      image: "",
    },
  });

  // ── Computed values ───────────────────────────────────────────────────────

  // Total number of products in the local list
  const totalProducts = useMemo(() => allProducts.length, [allProducts]);

  // Number of distinct categories across all products
  const totalCategories = useMemo(
    () => new Set(allProducts.map((p) => p.category)).size,
    [allProducts],
  );

  // Sorted list of unique categories — used by the category <select> in the form
  const categories = useMemo(
    () => [...new Set(allProducts.map((p) => p.category))].sort(),
    [allProducts],
  );

  // Fetch all products on mount; cancelled flag prevents setState after unmount
  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setVm({ products: null, loading: true, error: null });
      try {
        const products = await getAllProducts();
        if (!cancelled) {
          setAllProducts(products);
          setVm({ products, loading: false, error: null });
        }
      } catch {
        if (!cancelled)
          setVm({
            products: null,
            loading: false,
            error: "Failed to load products.",
          });
      }
    };

    void fetch();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Modal helpers ─────────────────────────────────────────────────────────

  const openAdd = (): void => {
    reset({ title: "", price: "", category: "", description: "", image: "" });
    setSelectedProduct(null);
    setModalMode("add");
  };

  const openEdit = (product: Product): void => {
    setSelectedProduct(product);
    // Pre-fill the form with the existing product values
    reset({
      title: product.title,
      price: String(product.price),
      category: product.category,
      description: product.description,
      image: product.image,
    });
    setModalMode("edit");
  };

  const closeModal = (): void => {
    setModalMode(null);
    setSelectedProduct(null);
    reset({ title: "", price: "", category: "", description: "", image: "" });
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const onSubmit = (values: ProductFormValues): void => {
    if (modalMode === "add") {
      // Build a local product with a temporary id — no API call needed
      const fakeProduct: Product = {
        id: Date.now(),
        title: values.title,
        price: parseFloat(values.price),
        category: values.category,
        description: values.description,
        image: values.image,
        rating: { rate: 0, count: 0 },
      };
      // Prepend to the list so the new product appears at the top
      setAllProducts((prev) => [fakeProduct, ...prev]);
      console.log("[AdminDashboard] Product created:", fakeProduct);
      showToast(`"${values.title}" added successfully!`, "success");
    } else if (selectedProduct) {
      const updatedProduct: Product = {
        ...selectedProduct,
        ...values,
        price: parseFloat(values.price),
      };
      // Replace the existing product entry with the updated values
      setAllProducts((prev) =>
        prev.map((p) => (p.id === selectedProduct.id ? updatedProduct : p)),
      );
      console.log("[AdminDashboard] Product edited:", updatedProduct);
      showToast(`"${values.title}" updated successfully!`, "success");
    }
    closeModal();
  };

  // Called when submit is clicked but validation fails — trigger() forces all
  // fields to run validation and become "touched" so errors render immediately,
  // even for fields the user never focused.
  const onInvalidSubmit = async (): Promise<void> => {
    await trigger();
  };

  // ── Delete helpers ────────────────────────────────────────────────────────

  // Opens the delete confirmation dialog for the given product
  const requestDelete = (product: Product): void => {
    setPendingDelete(product);
  };

  const confirmDelete = (): void => {
    if (!pendingDelete) return;
    setAllProducts((prev) => prev.filter((p) => p.id !== pendingDelete.id));
    console.log("[AdminDashboard] Product deleted:", pendingDelete);
    showToast(`"${pendingDelete.title}" deleted.`, "info");
    setPendingDelete(null);
  };

  const cancelDelete = (): void => {
    setPendingDelete(null);
  };

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  // Escape: close the add/edit modal or cancel a pending delete confirmation

  const handleEscape = useCallback(() => {
    if (modalMode !== null) {
      closeModal();
      return;
    }
    if (pendingDelete !== null) {
      cancelDelete();
    }
  }, [modalMode, pendingDelete]); // eslint-disable-line react-hooks/exhaustive-deps

  useKeyboard("Escape", handleEscape);
  // Returns true only after the field has been touched AND has an error.
  // This prevents showing red borders on fields the user hasn't interacted with yet.
  const isInvalid = (field: keyof ProductFormValues): boolean =>
    !!(errors[field] && touchedFields[field]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Products Table ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header row */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Products</h2>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Product
            </button>
          </div>

          {/* Loading Spinner */}
          {vm.loading && (
            <div
              role="status"
              aria-label="Loading products"
              className="flex items-center justify-center py-24 gap-3"
            >
              <div
                className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"
                aria-hidden="true"
              />
              <p className="text-gray-400 text-sm">Loading products...</p>
            </div>
          )}

          {/* Error State */}
          {!vm.loading && vm.error && (
            <div className="px-6 py-12 text-center">
              <p role="alert" className="text-red-500 font-medium">
                {vm.error}
              </p>
            </div>
          )}

          {/* Products Table */}
          {!vm.loading && !vm.error && allProducts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Products list">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left font-semibold"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left font-semibold"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left font-semibold"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right font-semibold"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Product image + title */}
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-contain p-1"
                              loading="lazy"
                            />
                          </div>
                          <span className="font-medium text-gray-800 line-clamp-1 max-w-xs">
                            {product.title}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>

                      {/* Actions — clicking Delete opens the confirmation dialog */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(product)}
                              aria-label={`Edit "${product.title}"`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => requestDelete(product)}
                              aria-label={`Delete "${product.title}"`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </button>
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────
          Backdrop click closes the modal; inner panel stops propagation. */}
      {modalMode !== null && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* Modal Panel */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2
                  id="modal-title"
                  className="text-lg font-bold text-gray-900"
                >
                  {modalMode === "add" ? "Add New Product" : "Edit Product"}
                </h2>
                <button
                  onClick={closeModal}
                  aria-label="Close modal"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Form — react-hook-form handleSubmit validates then calls onSubmit */}
              <form
                onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
                className="px-6 py-5 space-y-5"
              >
                {/* Title */}
                <div>
                  <label
                    htmlFor="product-title"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="product-title"
                    type="text"
                    placeholder="Product title"
                    aria-describedby={
                      isInvalid("title") ? "title-error" : undefined
                    }
                    aria-invalid={isInvalid("title")}
                    {...register("title", {
                      required: true,
                      minLength: 3,
                    })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 ${isInvalid("title") ? "border-red-300" : "border-gray-200"}`}
                  />
                  {isInvalid("title") && (
                    <p
                      id="title-error"
                      role="alert"
                      className="text-red-500 text-xs mt-1"
                    >
                      Title is required (min 3 characters).
                    </p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label
                    htmlFor="product-price"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="product-price"
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 29.99"
                    aria-describedby={
                      isInvalid("price") ? "price-error" : undefined
                    }
                    aria-invalid={isInvalid("price")}
                    {...register("price", {
                      required: true,
                      pattern: /^\d+(\.\d{1,2})?$/,
                    })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 ${isInvalid("price") ? "border-red-300" : "border-gray-200"}`}
                  />
                  {isInvalid("price") && (
                    <p
                      id="price-error"
                      role="alert"
                      className="text-red-500 text-xs mt-1"
                    >
                      Price must be a valid number greater than 0 (e.g. 19.99).
                    </p>
                  )}
                </div>

                {/* Category — populated from the computed categories list */}
                <div>
                  <label
                    htmlFor="product-category"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="product-category"
                    aria-describedby={
                      isInvalid("category") ? "category-error" : undefined
                    }
                    aria-invalid={isInvalid("category")}
                    {...register("category", { required: true })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 bg-white transition focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 appearance-none cursor-pointer ${isInvalid("category") ? "border-red-300" : "border-gray-200"}`}
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {isInvalid("category") && (
                    <p
                      id="category-error"
                      role="alert"
                      className="text-red-500 text-xs mt-1"
                    >
                      Please select a category.
                    </p>
                  )}
                </div>

                {/* Image URL */}
                <div>
                  <label
                    htmlFor="product-image"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Image URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="product-image"
                    type="url"
                    placeholder="https://..."
                    aria-describedby={
                      isInvalid("image") ? "image-error" : undefined
                    }
                    aria-invalid={isInvalid("image")}
                    {...register("image", { required: true })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 ${isInvalid("image") ? "border-red-300" : "border-gray-200"}`}
                  />
                  {isInvalid("image") && (
                    <p
                      id="image-error"
                      role="alert"
                      className="text-red-500 text-xs mt-1"
                    >
                      Image URL is required.
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="product-description"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="product-description"
                    rows={3}
                    placeholder="Describe the product..."
                    aria-describedby={
                      isInvalid("description") ? "description-error" : undefined
                    }
                    aria-invalid={isInvalid("description")}
                    {...register("description", {
                      required: true,
                      minLength: 10,
                    })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 ${isInvalid("description") ? "border-red-300" : "border-gray-200"}`}
                  />
                  {isInvalid("description") && (
                    <p
                      id="description-error"
                      role="alert"
                      className="text-red-500 text-xs mt-1"
                    >
                      Description is required (min 10 characters).
                    </p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                  >
                    {modalMode === "add" ? "Add Product" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
      {/* ── Delete Confirmation Dialog ───────────────────────────────────────
          Shown when the admin clicks Delete on a product row. Backdrop click
          and Escape both cancel. */}
      {pendingDelete !== null && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={cancelDelete}
            aria-hidden="true"
          />

          {/* Dialog panel */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-dialog-title"
              aria-describedby="delete-dialog-desc"
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon + heading */}
              <div className="px-6 pt-7 pb-4 flex flex-col items-center text-center">
                {/* Red trash icon circle */}
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <svg
                    className="w-7 h-7 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>

                <h2
                  id="delete-dialog-title"
                  className="text-lg font-bold text-gray-900 mb-2"
                >
                  Delete Product?
                </h2>

                <p
                  id="delete-dialog-desc"
                  className="text-sm text-gray-500 leading-relaxed"
                >
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-800">
                    "{pendingDelete.title}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex gap-3 mt-2">
                <button
                  onClick={cancelDelete}
                  aria-label="Cancel deletion"
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  aria-label={`Confirm delete "${pendingDelete.title}"`}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
