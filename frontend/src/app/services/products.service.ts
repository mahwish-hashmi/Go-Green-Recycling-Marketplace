import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product } from '../models/Product';

@Injectable({ providedIn: 'root' })
export class ProductsService {

  constructor(private http: HttpClient) {}

  // ── Public ────────────────────────────────────────────────────────

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.API_URL}/products`);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${environment.API_URL}/products/${id}`);
  }

  /** Products listed by a specific seller (public store page) */
  getProductsBySeller(username: string): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${environment.API_URL}/products/seller/${username}`
    );
  }

  // ── Seller: own products only ─────────────────────────────────────

  /** Returns only the logged-in seller's products */
  getMyProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.API_URL}/seller/products`);
  }

  /**
   * Add a new product WITH optional image.
   * POST /api/products/upload  (multipart/form-data)
   * This is the CORRECT endpoint the seller dashboard must call.
   */
  addProductWithImage(
    name: string,
    description: string,
    price: number,
    imageFile?: File
  ): Observable<Product> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', String(price));
    if (imageFile) {
      formData.append('image', imageFile, imageFile.name);
    }
    // POST to /api/products/upload
    return this.http.post<Product>(
      `${environment.API_URL}/products/upload`, formData
    );
  }

  /**
   * Update an existing product WITH optional new image.
   * PUT /api/products/{id}/upload  (multipart/form-data)
   */
  updateProductWithImage(
    id: string,
    name: string,
    description: string,
    price: number,
    imageFile?: File
  ): Observable<Product> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', String(price));
    if (imageFile) {
      formData.append('image', imageFile, imageFile.name);
    }
    // PUT to /api/products/{id}/upload
    return this.http.put<Product>(
      `${environment.API_URL}/products/${id}/upload`, formData
    );
  }

  // ── JSON variants (kept for fallback) ────────────────────────────

  addProduct(product: any): Observable<Product> {
    return this.http.post<Product>(`${environment.API_URL}/products`, product);
  }

  updateProduct(id: string, product: any): Observable<Product> {
    return this.http.put<Product>(
      `${environment.API_URL}/products/${id}`, product
    );
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${environment.API_URL}/products/${id}`);
  }
}
