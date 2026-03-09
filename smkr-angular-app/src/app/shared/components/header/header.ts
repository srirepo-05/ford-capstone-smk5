import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CartService } from '../../../shop/services/cart-service/cart-service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive], // RouterLinkActive adds an "active" CSS class to the current nav link
  templateUrl: './header.html',
})
export class Header {
  // signal(false) — tracks mobile menu open/closed state reactively
  isMobileMenuOpen = signal(false);

  constructor(
    public cartService: CartService, // used in the template to read itemCount() for the cart badge
    public authService: AuthService, // used in the template to show/hide the Admin link
    public router: Router,
  ) {}

  toggleMobileMenu(): void {
    // update() receives the current value and returns the next value — clean boolean toggle
    this.isMobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false); // called when a nav link is clicked (closes the drawer)
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']); // redirect to home after logout
  }
}
