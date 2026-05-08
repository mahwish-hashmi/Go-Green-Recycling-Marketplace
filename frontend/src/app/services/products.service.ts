import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product } from '../models/Product';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  constructor(private http: HttpClient) {}

  // context-path = /api, no @RequestMapping on APIController
  // => http://localhost:8080/api/products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.API_URL}/products`);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${environment.API_URL}/products/${id}`);
  }

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
