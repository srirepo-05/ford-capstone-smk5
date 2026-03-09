import { Component, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, startWith } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';

import { ProductService } from '../../../shop/services/product-service/product-service';
import { ToastService } from '../../../shared/services/toast/toast.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Product } from '../../../shop/models/product.model';

// ViewModel shape — the template only ever sees this object, never the raw Observable
interface DashboardVM {
  products: Product[] | null;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, AsyncPipe, ReactiveFormsModule],
  templateUrl: './admin-dashboard.html',
  // OnPush — Angular only re-renders this component when a signal or input reference changes,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboard implements OnInit {
  // dashboardVM$ is an Observable — the async pipe in the template subscribes to it,
  // automatically shows the latest value, and unsubscribes when the component is destroyed
  dashboardVM$!: Observable<DashboardVM>;

  // signal<Product[]>([]) creates a reactive state container.
  allProducts = signal<Product[]>([]);

  // Controls which modal is open: null = closed, 'add' = Add form, 'edit' = Edit form
  modalMode = signal<'add' | 'edit' | null>(null);

  // Holds a reference to the product row the admin clicked "Edit" on
  selectedProduct = signal<Product | null>(null);

  // Tracks which product row is in the "confirm delete?" state (null = none pending)
  pendingDeleteId = signal<number | null>(null);

  // ReactiveFormsModule FormGroup — each control maps to a form field in the template
  productForm!: FormGroup;

  // computed() derives a value from one or more signals.
  // totalProducts re-runs automatically whenever allProducts() changes — no manual event needed
  totalProducts = computed(() => this.allProducts().length);

  // Set removes duplicate values
  totalCategories = computed(() => {
    const cats = this.allProducts().map((p) => p.category);
    return new Set(cats).size;
  });

  // Spread operator + Set to get a unique sorted list of category strings.
  // [...new Set(arr)] converts the Set back to a plain array so @for can iterate it
  categories = computed(() => {
    const cats = this.allProducts().map((p) => p.category);
    return [...new Set(cats)].sort();
  });

  constructor(
    public productService: ProductService,
    public toastService: ToastService,
    public authService: AuthService,
    public fb: FormBuilder, // FormBuilder is a helper service that creates FormGroups concisely
  ) {}

  ngOnInit(): void {
    this.buildForm(); // always build the form before the HTTP call so the template never sees undefined

    this.dashboardVM$ = this.productService.getAllProducts().pipe(
      // map transforms the raw Product[] the API returns into our ViewModel shape
      map((products) => {
        this.allProducts.set(products); // store in signal so computed values and table react instantly
        return { products, loading: false, error: null };
      }),
      // catchError intercepts any HTTP failure and returns a safe fallback ViewModel
      // so the template always gets a valid object to render (no uncaught exceptions)
      catchError(() => of({ products: null, loading: false, error: 'Failed to load products.' })),
      // startWith emits immediately before the HTTP response arrives,
      // giving the template a loading:true state to show the spinner straight away
      startWith({ products: null, loading: true, error: null }),
    );
  }

  buildForm(): void {
    // fb.group() creates a FormGroup where each key is a form control name
    // The first array item is the initial value, the second is the list of validators
    this.productForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      // Validators.pattern checks the value against a regex — here we accept digits with up to 2 decimal places
      price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      image: ['', Validators.required],
    });
  }

  openAdd(): void {
    this.productForm.reset(); // clear any previous values / validation state
    this.selectedProduct.set(null); // no product is being edited
    this.modalMode.set('add'); // signal change triggers @if(modalMode()) in template
  }

  openEdit(product: Product): void {
    this.selectedProduct.set(product); // remember which product we are editing
    // patchValue fills only the fields provided — unlike setValue it won't throw if a field is missing
    this.productForm.patchValue({
      title: product.title,
      price: product.price,
      category: product.category,
      description: product.description,
      image: product.image,
    });
    this.modalMode.set('edit');
  }

  closeModal(): void {
    this.modalMode.set(null); // hides the modal in the template
    this.selectedProduct.set(null);
    this.productForm.reset(); // clear validation errors so next open starts fresh
  }

  submitForm(): void {
    if (this.productForm.invalid) {
      // markAllAsTouched makes every control "dirty" so @if(isInvalid('field')) messages appear
      this.productForm.markAllAsTouched();
      return;
    }

    const values = this.productForm.value;

    if (this.modalMode() === 'add') {
      // We cannot actually write to FakeStore permanently, so we build a fake Product object locally.
      // Date.now() gives a unique number to use as a temporary id (milliseconds since epoch)
      const fakeProduct: Product = {
        id: Date.now(),
        title: values.title,
        price: parseFloat(values.price), // form value is a string — parseFloat converts it to a number
        category: values.category,
        description: values.description,
        image: values.image,
        rating: { rate: 0, count: 0 },
      };
      // signal.update() receives the current array and returns a new one — immutable update pattern
      this.allProducts.update((list) => [fakeProduct, ...list]);
      this.toastService.showToast(`"${values.title}" added successfully!`, 'success');
    } else {
      const edited = this.selectedProduct();
      if (edited) {
        // map() returns a new array where only the matching product is replaced.
        // Spread ...p keeps all original fields, then ...values overwrites the changed ones
        this.allProducts.update((list) =>
          list.map((p) =>
            p.id === edited.id ? { ...p, ...values, price: parseFloat(values.price) } : p,
          ),
        );
        this.toastService.showToast(`"${values.title}" updated successfully!`, 'success');
      }
    }

    this.closeModal();
  }

  requestDelete(id: number): void {
    // Just sets the pending id — the template swaps Edit/Delete buttons for Yes/Cancel buttons
    this.pendingDeleteId.set(id);
  }

  confirmDelete(product: Product): void {
    // filter() returns every product except the deleted one — again an immutable update
    this.allProducts.update((list) => list.filter((p) => p.id !== product.id));
    this.toastService.showToast(`"${product.title}" deleted.`, 'info');
    this.pendingDeleteId.set(null); // clear confirmation state
  }

  cancelDelete(): void {
    this.pendingDeleteId.set(null); // user changed their mind — restore normal action buttons
  }

  // isInvalid checks two things: the control has a validation error AND the user has interacted with it.
  // We only show errors after touch so the form doesn't look broken before the user types anything.
  isInvalid(field: string): boolean {
    const control = this.productForm.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
