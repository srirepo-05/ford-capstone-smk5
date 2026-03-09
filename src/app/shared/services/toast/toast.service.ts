import { Injectable, signal } from '@angular/core';

const TOAST_DURATION_MS = 3000; // toast auto-dismisses after 3 seconds

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root' // singleton — one global toast state for the whole app
})
export class ToastService {

  // Null means no toast is visible; a Toast object means one should be shown
  currentToast = signal<Toast | null>(null);

  // ReturnType<typeof setTimeout> is the correct cross-platform type for a timer reference
  // (it's a number in browsers but a NodeJS.Timeout in Node environments)
  hideTimer: ReturnType<typeof setTimeout> | null = null;

  showToast(message: string, type: Toast['type'] = 'success'): void {
    // Clear any existing timer so back-to-back toasts don't dismiss too early
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }

    this.currentToast.set({ message, type });

    // Auto-hide after the duration; clear the ref so we can null-check it later
    this.hideTimer = setTimeout(() => {
      this.currentToast.set(null);
      this.hideTimer = null;
    }, TOAST_DURATION_MS);
  }

  hideToast(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer); // cancel the auto-hide before it fires
      this.hideTimer = null;
    }
    this.currentToast.set(null);
  }
}
