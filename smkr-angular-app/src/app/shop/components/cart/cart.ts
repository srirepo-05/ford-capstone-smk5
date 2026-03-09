import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

import { CartService } from '../../services/cart-service/cart-service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, FormsModule], // FormsModule needed for the checkout NgForm
  templateUrl: './cart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart {
  readonly TAX_RATE = 0.1; // 10% tax applied to the order total

  // Holds the id of the row awaiting delete confirmation (null = no pending removal)
  pendingRemoveId: number | null = null;

  // Checkout form state
  showCheckoutForm = signal(false); // toggles the checkout form section
  orderPlaced = signal(false); // true after a successful order — shows the confirmation screen

  constructor(
    public cartService: CartService,
    public toastService: ToastService,
    public authService: AuthService,
  ) {}

  increaseQty(productId: number, currentQty: number): void {
    this.cartService.updateQuantity(productId, currentQty + 1);
  }

  decreaseQty(productId: number, currentQty: number): void {
    this.cartService.updateQuantity(productId, currentQty - 1); // CartService handles removal at 0
  }

  // Two-step delete: first click shows inline confirm buttons; second click actually removes
  requestRemove(productId: number): void {
    this.pendingRemoveId = productId;
  }

  confirmRemove(product: Product): void {
    this.cartService.removeFromCart(product.id);
    this.pendingRemoveId = null;
    this.toastService.showToast(`"${product.title}" removed from cart.`, 'info');
  }

  cancelRemove(): void {
    this.pendingRemoveId = null; // user changed mind — restore normal action buttons
  }

  clearCart(): void {
    if (confirm('Remove all items from your cart?')) {
      this.cartService.clearCart();
      this.toastService.showToast('Cart cleared.', 'info');
      this.showCheckoutForm.set(false);
      this.orderPlaced.set(false);
    }
  }

  openCheckoutForm(): void {
    this.showCheckoutForm.set(true);
    // setTimeout defers the scroll until after Angular renders the checkout form in the DOM
    setTimeout(() => {
      document
        .getElementById('checkout-form')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  handleCheckout(form: NgForm): void {
    if (form.invalid) return; // template validation must pass first

    // Simulate placing an order — clears the cart and shows the success screen
    this.cartService.clearCart();
    this.orderPlaced.set(true);
    this.showCheckoutForm.set(false);
    this.toastService.showToast('Order placed successfully! 🎉', 'success');
  }

  // Getters are recalculated on every change-detection cycle — fine here since
  // they derive from computed() signals which only update when the cart changes
  get estimatedTax(): number {
    return this.cartService.totalPrice() * this.TAX_RATE;
  }

  get grandTotal(): number {
    return this.cartService.totalPrice() + this.estimatedTax;
  }
}
