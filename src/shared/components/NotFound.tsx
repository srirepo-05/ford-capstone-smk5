import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

// Rendered when no route matches the current URL path.
// The catch-all <Route path="*"> in App.tsx points here.
// usePageTitle sets the browser tab title so users see "404 — Page Not Found"
// instead of the generic "SRIStore" title.
const NotFound = () => {
  usePageTitle('404 — Page Not Found');

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center px-4">
      <div className="mb-8">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
        Page Not Found
      </h2>

      <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been moved or deleted.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go Home
        </Link>

        <Link
          to="/products"
          className="inline-flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Browse Products
        </Link>
      </div>
    </div>
  </div>
  );
};

export default NotFound;