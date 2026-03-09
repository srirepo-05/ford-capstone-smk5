import { Component, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, startWith } from 'rxjs/operators';

import { ProductService } from '../../services/product-service/product-service';
import { CartService } from '../../services/cart-service/cart-service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Product } from '../../models/product.model';
import { AsyncPipe } from '@angular/common';

// ViewModel — the template always receives a predictable object; never a raw Observable
interface ProductsVM {
  products: Product[] | null;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-products',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './products.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products implements OnInit {

  // The async pipe in the template subscribes to this Observable and handles lifecycle automatically
  productsVM$!: Observable<ProductsVM>;

  // Exposed so the template can call Math.round() without importing it — templates have no imports
  Math = Math;

  // All products loaded from the API — updated once data arrives
  allProducts = signal<Product[]>([]);

  // Tracks the selected quantity per product (keyed by product id)
  quantities = signal<Map<number, number>>(new Map());

  // Tracks which product cards are showing the stepper (keyed by product id)
  stepperOpen = signal<Set<number>>(new Set());

  // Controlled by the search input and category pills in the template
  searchTerm = signal('');
  selectedCategory = signal('');

  // Derived list — recomputes automatically whenever allProducts, searchTerm, or selectedCategory changes
  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const cat  = this.selectedCategory();

    return this.allProducts().filter(p => {
      const matchesSearch   = !term || p.title.toLowerCase().includes(term);
      const matchesCategory = !cat  || p.category === cat;
      return matchesSearch && matchesCategory;
    });
  });

  // Unique categories derived from allProducts — used to render the filter pills
  categories = computed(() => {
    const cats = this.allProducts().map(p => p.category);
    return [...new Set(cats)].sort(); // Set removes duplicates; spread converts it back to an array
  });

  constructor(
    public productService: ProductService,
    public cartService: CartService,
    public toastService: ToastService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.productsVM$ = this.productService.getAllProducts().pipe(
      map(products => {
        this.allProducts.set(products); // store in signal so computed filters can react
        return { products, loading: false, error: null };
      }),
      catchError(error => {
        console.error('Error fetching products:', error);
        return of({ products: null, loading: false, error: 'Failed to load products. Please try again later.' });
      }),
      startWith({ products: null, loading: true, error: null }) // emits immediately to show the spinner
    );
  }

  // Opens the stepper for a product — called when the "Add to Cart" button is first clicked
  openStepper(productId: number): void {
    this.setQuantity(productId, 1);
    this.stepperOpen.update(set => new Set(set).add(productId));
  }

  // Closes the stepper without adding to cart
  closeStepper(productId: number): void {
    this.stepperOpen.update(set => { const next = new Set(set); next.delete(productId); return next; });
    this.setQuantity(productId, 1);
  }

  // Returns true if the stepper is visible for this product
  isStepperOpen(productId: number): boolean {
    return this.stepperOpen().has(productId);
  }

  // Confirms the quantity and adds to cart — resets the card back to the button
  addToCart(product: Product): void {
    const qty = this.quantities().get(product.id) ?? 1;
    for (let i = 0; i < qty; i++) {
      this.cartService.addToCart(product);
    }
    this.toastService.showToast(`"${product.title}" ×${qty} added to cart!`, 'success');
    // Close the stepper and reset quantity
    this.stepperOpen.update(set => { const next = new Set(set); next.delete(product.id); return next; });
    this.setQuantity(product.id, 1);
  }

  // Returns the current selected quantity for a given product (defaults to 1)
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

  // Increments the quantity counter for a product
  increment(productId: number): void {
    this.setQuantity(productId, this.getQuantity(productId) + 1);
  }

  // Decrements the quantity counter for a product (min 1)
  decrement(productId: number): void {
    this.setQuantity(productId, this.getQuantity(productId) - 1);
  }

  // Resets both filter signals — the filteredProducts computed will re-run automatically
  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set('');
  }
}
