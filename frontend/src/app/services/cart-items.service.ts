import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CartItem } from '../models/CartItem';
import { User } from '../models/User';

@Injectable({ providedIn: 'root' })
export class CartItemsService {

  constructor(private http: HttpClient) {}

  // environment.API_URL = 'http://localhost:8080/api'
  // context-path already adds /api, so just append the path directly
  // WRONG: ${API_URL}/api/users/...  →  /api/api/users  → 404
  // RIGHT: ${API_URL}/users/...      →  /api/users      → 200

  getUserCart(userId: string): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(
      `${environment.API_URL}/users/${userId}/cart`
    );
  }

  addToUserCart(userId: string, productId: string): Observable<any> {
    return this.http.post<any>(
      `${environment.API_URL}/users/${userId}/cart/add/${productId}`, {}
    );
  }

  updateUserCartItem(userId: string, productId: string, quantity: number): Observable<any> {
    return this.http.put<any>(
      `${environment.API_URL}/users/${userId}/cart/update/${productId}`,
      { quantity }
    );
  }

  deleteUserCartItem(userId: string, productId: string): Observable<any> {
    return this.http.delete(
      `${environment.API_URL}/users/${userId}/cart/remove/${productId}`
    );
  }

  // Check if a product is already in the cart
  getCartItem(userId: string, productId: string): Observable<CartItem> {
    return new Observable(observer => {
      this.getUserCart(userId).subscribe({
        next: (items: CartItem[]) => {
          const found = items.find(
            item => String(item.pk?.product?.id) === String(productId)
          );
          if (found) {
            observer.next(found);
            observer.complete();
          } else {
            observer.error('Not in cart');
          }
        },
        error: (err) => observer.error(err)
      });
    });
  }
}
