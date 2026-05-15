import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/Product';

@Injectable({ providedIn: 'root' })
export class WishlistService {

  private KEY = 'gogreen_wishlist';
  private items$ = new BehaviorSubject<Product[]>(this.load());

  get wishlist$() { return this.items$.asObservable(); }

  get count(): number { return this.items$.value.length; }

  private load(): Product[] {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || '[]');
    } catch { return []; }
  }

  private save(items: Product[]): void {
    localStorage.setItem(this.KEY, JSON.stringify(items));
    this.items$.next(items);
  }

  isWishlisted(productId: number): boolean {
    return this.items$.value.some(p => p.id === productId);
  }

  toggle(product: Product): boolean {
    const items = this.items$.value;
    const idx = items.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      items.splice(idx, 1);
      this.save([...items]);
      return false; // removed
    } else {
      this.save([...items, product]);
      return true;  // added
    }
  }

  getAll(): Product[] {
    return this.items$.value;
  }

  clear(): void {
    this.save([]);
  }
}
