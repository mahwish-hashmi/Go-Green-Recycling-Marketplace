import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem } from 'src/app/models/CartItem';
import { User } from 'src/app/models/User';
import { CartItemsService } from 'src/app/services/cart-items.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  user: User | null = null;
  cartItems: CartItem[] = [];
  loading = true;
  toast = '';
  checkoutDone = false;

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) =>
      sum + Number(item.pk?.product?.price ?? 0) * Number(item.quantity ?? 1), 0);
  }
  get shipping(): number { return this.subtotal > 0 && this.subtotal < 50 ? 4.99 : 0; }
  get total(): number    { return this.subtotal + this.shipping; }
  get co2Saved(): number { return Math.round(this.subtotal * 0.12 * 10) / 10; }

  constructor(
    private router: Router,
    private usersService: UsersService,
    private cartItemsService: CartItemsService
  ) {}

  ngOnInit(): void {
    if (!localStorage.getItem('token')) { this.router.navigateByUrl('/login'); return; }
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.usersService.getUserByToken().subscribe({
      next: (user: User) => {
        this.user = user;
        this.cartItemsService.getUserCart(String(user.id)).subscribe({
          next: (items: CartItem[]) => { this.cartItems = items; this.loading = false; },
          error: () => { this.cartItems = (user as any).cartItems || []; this.loading = false; }
        });
      },
      error: () => { this.loading = false; this.router.navigateByUrl('/login'); }
    });
  }

  increment(item: CartItem): void {
    if (!this.user) return;
    const qty = item.quantity + 1;
    this.cartItemsService.updateUserCartItem(String(this.user.id), String(item.pk.product.id), qty)
      .subscribe({ next: () => { item.quantity = qty; }, error: () => this.showToast('Could not update') });
  }

  decrement(item: CartItem): void {
    if (!this.user) return;
    if (item.quantity <= 1) { this.removeItem(item); return; }
    const qty = item.quantity - 1;
    this.cartItemsService.updateUserCartItem(String(this.user.id), String(item.pk.product.id), qty)
      .subscribe({ next: () => { item.quantity = qty; }, error: () => this.showToast('Could not update') });
  }

  removeItem(item: CartItem): void {
    if (!this.user) return;
    const pid = String(item.pk.product.id);
    this.cartItemsService.deleteUserCartItem(String(this.user.id), pid).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(ci => String(ci.pk.product.id) !== pid);
        this.showToast('Item removed');
      },
      error: () => this.showToast('Could not remove item')
    });
  }

  checkout(): void {
    // Save order to localStorage for order history
    const order = {
      id: Date.now().toString(36).toUpperCase(),
      date: new Date().toISOString(),
      status: 'Processing',
      items: this.cartItems.map(ci => ({
        name:  ci.pk.product.name,
        qty:   ci.quantity,
        price: Number(ci.pk.product.price)
      })),
      total: this.total
    };
    const existing = JSON.parse(localStorage.getItem('gogreen_orders') || '[]');
    localStorage.setItem('gogreen_orders', JSON.stringify([order, ...existing]));

    this.checkoutDone = true;
    this.showToast('Order placed! Thank you 🌿');
    setTimeout(() => { this.cartItems = []; }, 1500);
  }

  itemTotal(item: CartItem): number {
    return Number(item.pk?.product?.price ?? 0) * Number(item.quantity ?? 1);
  }

  getImageUrl(item: CartItem): string | null {
    const img = item.pk?.product?.image;
    return img ? 'data:image/jpeg;base64,' + img : null;
  }

  showToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => this.toast = '', 3000);
  }
}
