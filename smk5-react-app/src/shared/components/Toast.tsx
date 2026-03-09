import { useToast } from '../../contexts/ToastContext';
import type { ToastItem } from '../models/types';

// ── Per-type background colour ────────────────────────────────────────────────
const BG: Record<ToastItem['type'], string> = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

// ── Per-type icon ─────────────────────────────────────────────────────────────
const ToastIcon = ({ type }: { type: ToastItem['type'] }) => {
  if (type === 'success') {
    return (
      <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (type === 'error') {
    return (
      <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  // info
  return (
    <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
  );
};

// ── Toast outlet — placed once in App.tsx ────────────────────────────────────
// Reads from ToastContext and renders the current toast, or nothing when there is none.
const Toast = () => {
  const { currentToast, hideToast } = useToast();

  if (!currentToast) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed top-6 right-6 z-50 flex items-start gap-3 min-w-72 max-w-sm
                  rounded-xl shadow-2xl px-4 py-3 text-white text-sm font-medium
                  ${BG[currentToast.type]}`}
    >
      <ToastIcon type={currentToast.type} />
      <span className="flex-1 leading-snug">{currentToast.message}</span>
      <button
        onClick={hideToast}
        aria-label="Dismiss notification"
        className="ml-2 text-white/70 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
