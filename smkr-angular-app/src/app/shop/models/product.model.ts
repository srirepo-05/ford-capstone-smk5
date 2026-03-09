// TypeScript interfaces for Fake Store API data.
// Interfaces are compile-time only — zero runtime cost compared to classes.

// Nested rating object returned inside every Product
export interface ProductRating {
  rate: number; // average star rating, e.g. 4.2
  count: number; // number of reviews
}

// Matches the shape of a product from https://fakestoreapi.com/products
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string; // URL string to the product image
  rating: ProductRating;
}

// One row in the shopping cart — wraps a Product with a quantity counter
export interface CartItem {
  product: Product;
  quantity: number;
}
