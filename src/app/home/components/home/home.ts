import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, startWith } from 'rxjs/operators';

import { ProductService } from '../../../shop/services/product-service/product-service';
import { CartService } from '../../../shop/services/cart-service/cart-service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Product } from '../../../shop/models/product.model';
import { AsyncPipe } from '@angular/common';

// ViewModel — ensures the template always receives a well-defined object shape
interface HomeVM {
  featuredProducts: Product[] | null; // 8 products from the API
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  // The async pipe in the template subscribes, renders latest value, and auto-unsubscribes on destroy
  homeVM$!: Observable<HomeVM>;

  Math = Math; // exposed so the template can call Math.round() / Math.floor() inline

  // Tracks the selected quantity for each featured product card (keyed by product id)
  quantities = signal<Map<number, number>>(new Map());

  // Tracks which featured product cards are currently showing the quantity stepper
  stepperOpen = signal<Set<number>>(new Set());

  constructor(
    public productService: ProductService,
    public cartService: CartService,
    public toastService: ToastService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.homeVM$ = this.productService.getLimitedProducts(8).pipe(
      // map: transforms the raw API array into the ViewModel shape
      map((products) => ({
        featuredProducts: products,
        loading: false,
        error: null,
      })),
      // catchError: intercepts any HTTP failure and returns a safe fallback so the template never breaks
      catchError((error) => {
        console.error('Error loading featured products:', error);
        return of({
          featuredProducts: null,
          loading: false,
          error: 'Failed to load products. Please try again later.',
        });
      }),
      // startWith: emits immediately (before the HTTP response) to show the loading spinner right away
      startWith({
        featuredProducts: null,
        loading: true,
        error: null,
      }),
    );
  }

  addToCart(product: Product): void {
    const qty = this.getQuantity(product.id);
    for (let i = 0; i < qty; i++) {
      this.cartService.addToCart(product);
    }
    this.toastService.showToast(`"${product.title}" ×${qty} added to cart!`, 'success');
    this.closeStepper(product.id);
  }

  // Shows the stepper for a product and initialises its quantity to 1
  openStepper(productId: number): void {
    this.setQuantity(productId, 1);
    this.stepperOpen.update(set => new Set(set).add(productId));
  }

  // Hides the stepper and resets the quantity back to 1
  closeStepper(productId: number): void {
    this.stepperOpen.update(set => {
      const next = new Set(set);
      next.delete(productId);
      return next;
    });
    this.setQuantity(productId, 1);
  }

  // Returns true when the stepper for a product is visible
  isStepperOpen(productId: number): boolean {
    return this.stepperOpen().has(productId);
  }

  // Returns the current quantity for a product (defaults to 1)
  getQuantity(productId: number): number {
    return this.quantities().get(productId) ?? 1;
  }

  // Sets the quantity for a product, clamped between 1 and 99
  setQuantity(productId: number, qty: number): void {
    const clamped = Math.min(Math.max(1, qty), 99);
    this.quantities.update(map => {
      const next = new Map(map);
      next.set(productId, clamped);
      return next;
    });
  }

  // Increments the quantity by 1
  increment(productId: number): void {
    this.setQuantity(productId, this.getQuantity(productId) + 1);
  }

  // Decrements the quantity by 1 (floor is 1)
  decrement(productId: number): void {
    this.setQuantity(productId, this.getQuantity(productId) - 1);
  }
}
