import { Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import AuthProvider from './contexts/AuthContext';
import CartProvider from './contexts/CartContext';
import ToastProvider from './contexts/ToastContext';
import Header from './shared/components/Header';
import HomePage from './pages/home/HomePage';
import ProductsPage from './pages/products/ProductsPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import CartPage from './pages/cart/CartPage';
import LoginPage from './pages/login/LoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ProtectedRoute, { GuestOnlyRoute } from './shared/components/ProtectedRoute';
import NotFound from './shared/components/NotFound';
import Footer from './shared/components/Footer';
import Toast from './shared/components/Toast';

// Context provider tree: AuthProvider wraps CartProvider wraps ToastProvider.
// Auth is outermost so all other contexts can read the current user if needed.
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <div className="app-container">
                <ErrorBoundary FallbackComponent={() => <div className="p-8 text-center text-red-500 font-semibold">Something went wrong!</div>}>
                  <Routes>
                    <Route path="/"                element={<HomePage />} />
                    <Route path="/home"            element={<HomePage />} />
                    <Route path="/login"           element={<LoginPage />} />
                    <Route path="/products"        element={<ProductsPage />} />
                    <Route path="/products/:id"    element={<ProductDetailPage />} />
                    {/* Guest-only route — GuestOnlyRoute redirects admins to /not-authorized */}
                    <Route
                      path="/cart"
                      element={
                        <GuestOnlyRoute>
                          <CartPage />
                        </GuestOnlyRoute>
                      }
                    />
                    {/* Admin-only route — ProtectedRoute redirects to /login if not admin */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <ProtectedRoute>
                          <AdminDashboardPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ErrorBoundary>
              </div>
            </main>
            <Footer />
          </div>
          {/* Global toast outlet — rendered outside the flex layout so it overlays all content */}
          <Toast />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
