import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Product } from '../../models/product.model';

const MAX_QUANTITY = 99; // prevents absurdly large cart quantities

@Injectable({
  providedIn: 'root' // singleton — one shared cart instance across the whole app
})
export class CartService {
  // Private writable signal — only this service can call .set() or .update() on it
  cartItemsSignal = signal<CartItem[]>([]);

  // Public read-only view — components can read the signal but cannot mutate it directly
  cartItems = this.cartItemsSignal.asReadonly();

  // computed() values recalculate automatically whenever cartItemsSignal changes
  itemCount = computed(() =>
    this.cartItemsSignal().reduce((total, item) => total + item.quantity, 0)
  );

  totalPrice = computed(() =>
    this.cartItemsSignal().reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    )
  );

  uniqueItemCount = computed(() =>
    this.cartItemsSignal().length // number of distinct products, ignoring quantity
  );

  constructor() {
    this.loadCartFromStorage();
  }

  addToCart(product: Product): { success: boolean; message: string } {
    if (!product || !product.id) {
      return { success: false, message: 'Invalid product.' };
    }
    if (typeof product.price !== 'number' || product.price <= 0) {
      return { success: false, message: 'This product has an invalid price.' };
    }

    const currentItems = this.cartItemsSignal();
    const existingItem = currentItems.find(item => item.product.id === product.id);

    if (existingItem && existingItem.quantity >= MAX_QUANTITY) {
      return {
        success: false,
        message: `You can only add up to ${MAX_QUANTITY} of the same item.`
      };
    }

    if (existingItem) {
      // Immutable update: map() returns a brand-new array.
      // Signals detect changes by reference, so we must avoid mutating the existing array.
      const updatedItems = currentItems.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      this.cartItemsSignal.set(updatedItems);
    } else {
      // spread existing items into a new array and append the new CartItem
      this.cartItemsSignal.set([...currentItems, { product, quantity: 1 }]);
    }

    this.saveCartToStorage();
    return { success: true, message: `"${product.title}" added to cart!` };
  }

  removeFromCart(productId: number): void {
    const updatedItems = this.cartItemsSignal().filter(
      item => item.product.id !== productId
    );
    this.cartItemsSignal.set(updatedItems);
    this.saveCartToStorage();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const safeQuantity = Math.min(quantity, MAX_QUANTITY);

    const updatedItems = this.cartItemsSignal().map(item =>
      item.product.id === productId
        ? { ...item, quantity: safeQuantity }
        : item
    );
    this.cartItemsSignal.set(updatedItems);
    this.saveCartToStorage();
  }

  clearCart(): void {
    this.cartItemsSignal.set([]);
    this.saveCartToStorage();
  }

  isInCart(productId: number): boolean {
    return this.cartItemsSignal().some(item => item.product.id === productId);
  }

  saveCartToStorage(): void {
    try {
      // JSON.stringify serialises the signal's current value to a string for localStorage
      localStorage.setItem('sristore_cart', JSON.stringify(this.cartItemsSignal()));
    } catch (error) {
      console.error('Could not save cart to localStorage:', error);
    }
  }

  loadCartFromStorage(): void {
    try {
      const savedCart = localStorage.getItem('sristore_cart');
      if (!savedCart) return;

      const parsed = JSON.parse(savedCart);

      // Validate each item before restoring — guards against corrupted / outdated stored data
      const validItems = parsed.filter(
        (item: any) =>
          item &&
          item.product &&
          typeof item.product.id === 'number' &&
          typeof item.product.price === 'number' &&
          typeof item.quantity === 'number' &&
          item.quantity > 0
      );

      this.cartItemsSignal.set(validItems);
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      localStorage.removeItem('sristore_cart');
    }
  }
}
