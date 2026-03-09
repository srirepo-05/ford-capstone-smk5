import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../../models/product.model';

// Pure HTTP wrapper — no local state, no signals.
// Every method returns a cold Observable: the HTTP request only fires when something subscribes.
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  API_URL = 'https://fakestoreapi.com';

  constructor(public http: HttpClient) {}

  // Returns all products — used by the Products page and Admin Dashboard
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/products`);
  }

  // The generic type parameter <Product> tells HttpClient how to type the parsed JSON response
  getProductById(id: string | number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/products/${id}`);
  }

  // ?limit=N returns the first N products — used by the Home page featured section
  getLimitedProducts(limit: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/products?limit=${limit}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/products/categories`);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/products/category/${category}`);
  }
}
