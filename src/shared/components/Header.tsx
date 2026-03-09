import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import type { NavLink } from '../models/types';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import useKeyboard from '../hooks/useKeyboard';

// Desktop nav links — About is desktop-only; all three appear in the mobile drawer
const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
];

// Mobile-only extra link (matches Angular header mobile drawer)
const MOBILE_EXTRA: NavLink = { label: 'About', href: '/about' };

// ── Header ────────────────────────────────────────────────────────────────────

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth state from context — used to show/hide admin vs cart icon and login/logout
  const { isLoggedIn, isAdmin, currentUser, logout } = useAuth();

  // Cart item count from context — displayed as badge on the cart icon
  const { itemCount: cartCount } = useCart();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Escape closes the mobile drawer when it is open
  const handleEscape = useCallback(() => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  }, [isMobileMenuOpen]);

  useKeyboard('Escape', handleEscape);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-blue-600 font-extrabold text-xl tracking-tight hover:text-blue-700 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
            SRIStore
          </Link>

          {/* Right side: desktop nav + auth/cart + mobile toggle */}
          <div className="flex items-center gap-1">

            {/* Desktop nav links */}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="hidden sm:block text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center gap-3 ml-2">

              {/* Admin dashboard icon (admin) or cart icon (regular user) */}
              {isAdmin() ? (
                <Link
                  to="/admin/dashboard"
                  title="Admin Dashboard"
                  className="relative flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </Link>
              ) : (
                <Link
                  to="/cart"
                  aria-label={`Shopping Cart — ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
                  className="relative flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none" aria-hidden="true">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Auth — show user info + logout when logged in, Login button when logged out */}
              {isLoggedIn() ? (
                <div className="hidden sm:flex items-center gap-2">
                  {/* Admin mode badge — only visible when logged in as admin */}
                  {isAdmin() && (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 1a1 1 0 011 1v.5a7.5 7.5 0 010 15V18a1 1 0 11-2 0v-.5a7.5 7.5 0 010-15V2a1 1 0 011-1zm0 3a5.5 5.5 0 100 11A5.5 5.5 0 0010 4zm0 2a1 1 0 011 1v2.586l1.707 1.707a1 1 0 01-1.414 1.414l-2-2A1 1 0 019 10V7a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Admin Mode
                    </span>
                  )}
                  <span className="text-sm font-semibold text-gray-700">{currentUser?.displayName}</span>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-100 py-3 space-y-1">
            {[...NAV_LINKS, MOBILE_EXTRA].map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={closeMobileMenu}
                className="block text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile auth section */}
            <div className="border-t border-gray-100 pt-2 mt-1">
              {isLoggedIn() ? (
                <div className="px-4 py-2 flex items-center justify-between">
                  {/* Left side: display name + admin badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">{currentUser?.displayName}</span>
                    {/* Admin mode badge — only visible when logged in as admin */}
                    {isAdmin() && (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 1a1 1 0 011 1v.5a7.5 7.5 0 010 15V18a1 1 0 11-2 0v-.5a7.5 7.5 0 010-15V2a1 1 0 011-1zm0 3a5.5 5.5 0 100 11A5.5 5.5 0 0010 4zm0 2a1 1 0 011 1v2.586l1.707 1.707a1 1 0 01-1.414 1.414l-2-2A1 1 0 019 10V7a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Admin Mode
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => { closeMobileMenu(); logout(); }}
                    className="text-sm text-red-500 font-semibold hover:text-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block text-blue-600 font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-blue-50 transition-all"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
