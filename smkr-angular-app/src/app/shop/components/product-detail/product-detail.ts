import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { map, catchError, startWith } from 'rxjs/operators';

import { ProductService } from '../../services/product-service/product-service';
import { CartService } from '../../services/cart-service/cart-service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Product } from '../../models/product.model';
import { AsyncPipe } from '@angular/common';

interface ProductDetailVM {
  product: Product | null; // the single product loaded from the API
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './product-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail implements OnInit {

  productVM$!: Observable<ProductDetailVM>;
  Math = Math; // exposed so templates can call Math.round() / Math.floor() without imports

  // Quantity counter for the detail page stepper
  quantity = signal(1);

  // Controls whether the stepper is shown or the default "Add to Cart" button
  stepperOpen = signal(false);

  constructor(
    public route: ActivatedRoute,  // provides access to the current URL's :id param
    public productService: ProductService,
    public cartService: CartService,
    public toastService: ToastService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    // route.paramMap emits a new value every time the URL param changes (e.g., user clicks a different product)
    this.productVM$ = this.route.paramMap.pipe(
      // switchMap cancels the previous in-flight HTTP request when a new param value arrives,
      // preventing stale responses from overwriting the correct product
      switchMap(params => {
  const id = params.get('id')!;

        return this.productService.getProductById(id).pipe(
          map(product => ({
            product,
            loading: false,
            error: null
          })),
          catchError(error => {
            console.error('Error fetching product:', error);
            return of({
              product: null,
              loading: false,
              error: 'Product not found or failed to load.'
            });
          }),
          // startWith runs first — gives the template an immediate loading:true state
          // before the HTTP response arrives
          startWith({
            product: null,
            loading: true,
            error: null
          })
        );
      })
    );
  }

  addToCart(product: Product): void {
    const qty = this.quantity();
    for (let i = 0; i < qty; i++) {
      this.cartService.addToCart(product);
    }
    this.toastService.showToast(`"${product.title}" ×${qty} added to cart!`, 'success');
    // Reset stepper back to default button
    this.stepperOpen.set(false);
    this.quantity.set(1);
  }

  // Opens the stepper when "Add to Cart" is first clicked
  openStepper(): void {
    this.quantity.set(1);
    this.stepperOpen.set(true);
  }

  // Closes the stepper without adding to cart
  closeStepper(): void {
    this.stepperOpen.set(false);
    this.quantity.set(1);
  }

  increment(): void {
    if (this.quantity() < 99) this.quantity.update(q => q + 1);
  }

  decrement(): void {
    if (this.quantity() > 1) this.quantity.update(q => q - 1);
  }
}
