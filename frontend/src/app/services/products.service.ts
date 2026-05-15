import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product } from '../models/Product';

@Injectable({ providedIn: 'root' })
export class ProductsService {

  constructor(private http: HttpClient) {}

  // GET http://localhost:8080/api/products  (public)
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.API_URL}/products`);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${environment.API_URL}/products/${id}`);
  }

  /**
   * Add product with optional image — sends as multipart/form-data.
   * POST http://localhost:8080/api/products/upload
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
    return this.http.post<Product>(
      `${environment.API_URL}/products/upload`, formData
    );
  }

  /**
   * Update product with optional new image.
   * PUT http://localhost:8080/api/products/{id}/upload
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
    return this.http.put<Product>(
      `${environment.API_URL}/products/${id}/upload`, formData
    );
  }

  // JSON add/update (kept for backward compat)
  addProduct(product: any): Observable<Product> {
    return this.http.post<Product>(`${environment.API_URL}/products`, product);
  }

  updateProduct(id: string, product: any): Observable<Product> {
    return this.http.put<Product>(`${environment.API_URL}/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${environment.API_URL}/products/${id}`);
  }
}
