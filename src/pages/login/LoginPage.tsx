import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import type { LoginFormValues } from '../../shared/models/types';
import { useAuth } from '../../contexts/AuthContext';
import usePageTitle from '../../shared/hooks/usePageTitle';

// ── LoginPage ─────────────────────────────────────────────────────────────────
// Admin-only login form. Calls AuthContext.login() and redirects to
// the dashboard on success.

const LoginPage = () => {
  usePageTitle('Login');

  // Tracks the async login request to show a spinner and disable the button
  const [loading, setLoading] = useState(false);
  // Shows the error banner when credentials are invalid
  const [loginFailed, setLoginFailed] = useState(false);

  // react-hook-form — validates on blur (onTouched), then on each change
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    mode: 'onTouched',
    defaultValues: { username: '', password: '' },
  });

  // Login function from AuthContext
  const { login } = useAuth();
  const navigate = useNavigate();

  // Called by handleSubmit after validation passes
  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    setLoading(true);
    setLoginFailed(false);

    const success = await login(values.username, values.password);

    setLoading(false);

    if (!success) {
      setLoginFailed(true);
      return;
    }

    // Redirect to admin dashboard after a successful login
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* ── Logo / Brand ───────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 font-extrabold text-2xl"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
            SRIStore
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* ── Heading ──────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 mb-7">
            <div>
              <h1 className="text-lg font-bold text-gray-800">Admin Login</h1>
              <p className="text-xs text-gray-400">Store management access only</p>
            </div>
          </div>

          {/* ── Login Form ───────────────────────────────────────────────── */}
          {/* noValidate — validation handled by react-hook-form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Username */}
            <div className="mb-5">
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                placeholder="Admin username"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition ${errors.username ? 'border-red-300' : 'border-gray-200'}`}
                {...register('username', {
                  required: 'Username is required.',
                })}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                placeholder="Admin password"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition ${errors.password ? 'border-red-300' : 'border-gray-200'}`}
                {...register('password', {
                  required: 'Password is required.',
                })}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Error banner — shown when loginFailed is true */}
            {loginFailed && (
              <div
                role="alert"
                className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                Invalid credentials. Please check your username and password.
              </div>
            )}

            {/* Submit — disabled while loading to prevent duplicate requests */}
            <button
              type="submit"
              disabled={loading}
              aria-label={loading ? 'Signing in' : 'Sign in'}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>

          </form>
        </div>

        {/* ── Back to store ─────────────────────────────────────────────── */}
        <p className="text-center text-sm text-gray-400 mt-5">
          <Link to="/" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">
            ← Back to Store
          </Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
