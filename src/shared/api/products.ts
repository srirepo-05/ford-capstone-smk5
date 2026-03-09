import type { Product } from '../models/types';
import http from './http';

// Pure HTTP wrapper — all calls go to https://fakestoreapi.com/products

// Fetch a limited number of products — used by the HomePage featured section
export const getProducts = async (limit: number): Promise<Product[]> => {
  const response = await http.get<Product[]>('/products', { params: { limit } });
  return response.data;
};

// Fetch all products — used by ProductsPage
export const getAllProducts = async (): Promise<Product[]> => {
  const response = await http.get<Product[]>('/products');
  return response.data;
};

// Fetch a single product by id — used by ProductDetailPage
export const getProductById = async (id: string | number): Promise<Product> => {
  const response = await http.get<Product>(`/products/${id}`);
  return response.data;
};

// Fetch all available category names — used by ProductsPage category pills
export const getCategories = async (): Promise<string[]> => {
  const response = await http.get<string[]>('/products/categories');
  return response.data;
};

// Fetch products belonging to a specific category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const response = await http.get<Product[]>(`/products/category/${category}`);
  return response.data;
};
