// ── Product ───────────────────────────────────────────────────────────────────
export type ProductRating = {
  rate: number;  // average star rating, e.g. 4.2
  count: number; // number of reviews
};

// Matches the shape returned by https://fakestoreapi.com/products
export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string; // URL string to the product image
  rating: ProductRating;
};

// One row in the shopping cart — wraps a Product with a quantity counter
export type CartItem = {
  product: Product;
  quantity: number;
};

// ── Navigation ────────────────────────────────────────────────────────────────
export type NavLink = {
  label: string;
  href: string;
};

// ── Shared component props ────────────────────────────────────────────────────
export type StarRatingProps = {
  rate: number;
};

// ── Toast system ──────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info';

export type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

// Shape exposed by ToastContext — only one toast is visible at a time
export type ToastContextType = {
  currentToast: ToastItem | null;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
};

// ── Home page ─────────────────────────────────────────────────────────────────
export type HomeVM = {
  featuredProducts: Product[] | null;
  loading: boolean;
  error: string | null;
};

// ── Products page ─────────────────────────────────────────────────────────────
export type ProductsVM = {
  products: Product[] | null;
  loading: boolean;
  error: string | null;
};

// ── Product detail page ───────────────────────────────────────────────────────
export type ProductDetailVM = {
  product: Product | null;
  loading: boolean;
  error: string | null;
};

// ── Admin dashboard ───────────────────────────────────────────────────────────
export type DashboardVM = {
  products: Product[] | null;
  loading: boolean;
  error: string | null;
};

// Form field values for the add/edit product modal.
// price is kept as string here — parseFloat is applied on submit.
export type ProductFormValues = {
  title: string;
  price: string;
  category: string;
  description: string;
  image: string;
};

// ── Login page ────────────────────────────────────────────────────────────────
export type LoginFormValues = {
  username: string;
  password: string;
};

// ── Auth ──────────────────────────────────────────────────────────────────────
// Shape of the response from https://dummyjson.com/auth/login
export type DummyJsonAuthResponse = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;  // JWT — used in Authorization: Bearer <token>
  refreshToken: string; // JWT — used to obtain a new accessToken
};

// Shape stored in localStorage after a successful admin login.
// Includes the auth tokens so API calls can be made on behalf of the user.
export type AuthSession = {
  username: string;
  displayName: string;
  role: 'admin';
  accessToken: string;  // persisted so the user stays authenticated across refreshes
  refreshToken: string;
};

// Public API exposed by AuthContext
export type AuthContextType = {
  currentUser: AuthSession | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoggedIn: () => boolean;
  isAdmin: () => boolean;
};

// ── Cart ──────────────────────────────────────────────────────────────────────
// Return type of addToCart — carries success flag and a user-facing message
export type AddToCartResult = {
  success: boolean;
  message: string;
};

// Public API exposed by CartContext
export type CartContextType = {
  cartItems: CartItem[];
  itemCount: number;        // total units across all rows (sum of quantities)
  totalPrice: number;       // sum of (price × quantity) for all items
  uniqueItemCount: number;  // number of distinct products regardless of quantity
  addToCart: (product: Product) => AddToCartResult;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
};

// ── Checkout form ─────────────────────────────────────────────────────────────
export type CheckoutFormValues = {
  fullName: string;
  address: string;
  phone: string;
};
