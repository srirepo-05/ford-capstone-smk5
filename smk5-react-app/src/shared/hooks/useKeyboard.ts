import { useEffect } from 'react';

// ── useKeyboard ───────────────────────────────────────────────────────────────
// Attaches a keydown listener to the window for the given key.
// The handler is only called when `active` is true (defaults to true).
// Automatically cleans up the listener when the component unmounts or
// when the dependencies change.
//
// Usage:
//   useKeyboard('Escape', closeModal);
//   useKeyboard('Escape', closeModal, isOpen); // only active when modal is open

const useKeyboard = (
  key: string,
  handler: (e: KeyboardEvent) => void,
  active = true,
): void => {
  useEffect(() => {
    if (!active) return;

    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === key) handler(e);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, handler, active]);
};

export default useKeyboard;
