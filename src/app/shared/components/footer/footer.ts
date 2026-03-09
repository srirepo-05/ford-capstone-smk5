import { Component } from '@angular/core';

// Simple presentational component — no inputs, no services.
// Inline template is fine for very small components like this.
@Component({
  selector: 'app-footer',
  imports: [],
  template: `
    <footer class="bg-slate-800 text-white mt-auto">
      <div class="mx-auto max-w-7xl px-4 py-6 text-center">
        <p class="text-sm text-slate-400">
          <!-- currentYear is set once at construction time — always shows the correct year -->
          &copy; {{ currentYear }} SRIStore. All rights reserved.
        </p>
      </div>
    </footer>
  `,
  styles: ``,
})
export class Footer {
  // getFullYear() reads the year from the user's local clock at component creation
  currentYear = new Date().getFullYear();
}
