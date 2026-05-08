import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/models/Product';
import { ProductsService } from 'src/app/services/products.service';
import { User } from 'src/app/models/User';
import { UsersService } from 'src/app/services/users.service';
import { CartItemsService } from 'src/app/services/cart-items.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  public product: Product | undefined | null = undefined;
  public user: User | null = null;
  public isProductInCart: boolean = false;
  public isLoggedIn: boolean = false;
  public addingToCart: boolean = false;
  public toast: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private usersService: UsersService,
    private cartItemsService: CartItemsService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = !!localStorage.getItem('token');
    const id = this.route.snapshot.paramMap.get('id');

    this.productsService.getProduct(id!).subscribe({
      next: (product: Product) => {
        this.product = product;
        this.product.imageUrl = product.image
          ? 'data:image/jpeg;base64,' + product.image
          : null;
      },
      error: () => { this.product = null; }
    });

    if (this.isLoggedIn) {
      this.usersService.getUserByToken().subscribe({
        next: (user: User) => {
          this.user = user;
          this.checkCartItem();
        },
        error: () => {}
      });
    }
  }

  addToCart(): void {
    if (!this.user) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.addingToCart = true;
    this.cartItemsService.addToUserCart(
      String(this.user.id), String(this.product!.id)
    ).subscribe({
      next: () => {
        this.addingToCart = false;
        this.isProductInCart = true;
        this.showToast('Added to cart! 🛒');
      },
      error: () => {
        this.addingToCart = false;
        this.showToast('Failed to add to cart');
      }
    });
  }

  checkCartItem(): void {
    if (!this.user || !this.product) return;
    this.cartItemsService.getCartItem(
      String(this.user.id), String(this.product.id)
    ).subscribe({
      next: () => { this.isProductInCart = true; },
      error: () => { this.isProductInCart = false; }
    });
  }

  showToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => this.toast = '', 3000);
  }
}
