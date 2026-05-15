import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/Product';
import { WishlistService } from 'src/app/services/wishlist.service';
import { CartItemsService } from 'src/app/services/cart-items.service';
import { UsersService } from 'src/app/services/users.service';
import { User } from 'src/app/models/User';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  items: Product[] = [];
  user: User | null = null;
  toast = '';
  addingId: number | null = null;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartItemsService,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.items = this.wishlistService.getAll();
    this.usersService.getUserByToken().subscribe({
      next: (u) => { this.user = u; },
      error: () => {}
    });
  }

  remove(product: Product): void {
    this.wishlistService.toggle(product);
    this.items = this.wishlistService.getAll();
    this.showToast('Removed from wishlist');
  }

  addToCart(product: Product): void {
    if (!this.user) { this.router.navigateByUrl('/login'); return; }
    this.addingId = product.id;
    this.cartService.addToUserCart(String(this.user.id), String(product.id)).subscribe({
      next: () => {
        this.addingId = null;
        this.showToast('Added to cart! 🛒');
      },
      error: () => { this.addingId = null; this.showToast('Could not add to cart'); }
    });
  }

  getImageUrl(p: Product): string | null {
    return p.image ? 'data:image/jpeg;base64,' + p.image : null;
  }

  showToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => this.toast = '', 3000);
  }
}
