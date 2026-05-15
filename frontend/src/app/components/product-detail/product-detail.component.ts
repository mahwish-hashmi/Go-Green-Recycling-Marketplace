import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/models/Product';
import { ProductsService } from 'src/app/services/products.service';
import { User } from 'src/app/models/User';
import { UsersService } from 'src/app/services/users.service';
import { CartItemsService } from 'src/app/services/cart-items.service';
import { WishlistService } from 'src/app/services/wishlist.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {

  product: Product | null = null;
  user: User | null = null;
  isProductInCart  = false;
  isWishlisted     = false;
  isLoggedIn       = false;
  isBuyer          = false;
  addingToCart     = false;
  toast = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private usersService: UsersService,
    private cartItemsService: CartItemsService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.isBuyer    = localStorage.getItem('userRole') === 'ROLE_BUYER';
    const id = this.route.snapshot.paramMap.get('id');

    this.productsService.getProduct(id!).subscribe({
      next: (product: Product) => {
        this.product = product;
        this.product.imageUrl = product.image
          ? 'data:image/jpeg;base64,' + product.image : null;
        this.isWishlisted = this.wishlistService.isWishlisted(product.id);
      },
      error: () => { this.product = null; }
    });

    if (this.isLoggedIn) {
      this.usersService.getUserByToken().subscribe({
        next: (user: User) => {
          this.user = user;
          if (this.product) this.checkCartItem();
        },
        error: () => { this.user = null; }
      });
    }
  }

  addToCart(): void {
    if (!this.isLoggedIn) { this.router.navigateByUrl('/login'); return; }
    if (!this.isBuyer) { this.showToast('Only buyers can add to cart'); return; }

    if (!this.user) {
      this.usersService.getUserByToken().subscribe({
        next: (u) => { this.user = u; this.doAddToCart(); },
        error: () => this.showToast('Please log in again')
      });
      return;
    }
    this.doAddToCart();
  }

  doAddToCart(): void {
    if (!this.user || !this.product) return;
    this.addingToCart = true;
    this.cartItemsService.addToUserCart(String(this.user.id), String(this.product.id))
      .subscribe({
        next: () => { this.addingToCart = false; this.isProductInCart = true; this.showToast('Added to cart! 🛒'); },
        error: (err: any) => {
          this.addingToCart = false;
          this.showToast(err.status === 403 ? 'Only buyers can add to cart' : 'Could not add to cart');
        }
      });
  }

  toggleWishlist(): void {
    if (!this.isLoggedIn) { this.router.navigateByUrl('/login'); return; }
    if (!this.isBuyer) { this.showToast('Only buyers can use wishlist'); return; }
    if (!this.product) return;
    const added = this.wishlistService.toggle(this.product);
    this.isWishlisted = added;
    this.showToast(added ? 'Added to wishlist ❤️' : 'Removed from wishlist');
  }

  checkCartItem(): void {
    if (!this.user || !this.product) return;
    this.cartItemsService.getCartItem(String(this.user.id), String(this.product.id))
      .subscribe({ next: () => { this.isProductInCart = true; }, error: () => { this.isProductInCart = false; } });
  }

  showToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => this.toast = '', 3500);
  }
}
