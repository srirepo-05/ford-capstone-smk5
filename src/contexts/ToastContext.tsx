import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ToastContextType, ToastItem, ToastType } from '../shared/models/types';

// ── Context ───────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextType | null>(null);

// ── Custom hook ───────────────────────────────────────────────────────────────
export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return ctx;
};

// ── Provider ──────────────────────────────────────────────────────────────────
// Holds a single active toast and exposes showToast / hideToast to the tree.
// Only one toast is displayed at a time; showing a new one cancels the previous timer.

const TOAST_DURATION_MS = 3000;

type Props = { children: React.ReactNode };

const ToastProvider = ({ children }: Props) => {
  // null = no toast visible; a ToastItem = one toast is currently shown
  const [currentToast, setCurrentToast] = useState<ToastItem | null>(null);

  // Ref to the auto-hide timer so we can cancel it if a new toast arrives early
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    // Cancel any pending auto-hide before clearing the toast
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setCurrentToast(null);
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      // Clear existing timer so back-to-back calls don't dismiss the new toast too early
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }

      setCurrentToast({ id: 0, message, type });

      hideTimer.current = setTimeout(() => {
        setCurrentToast(null);
        hideTimer.current = null;
      }, TOAST_DURATION_MS);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ currentToast, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
