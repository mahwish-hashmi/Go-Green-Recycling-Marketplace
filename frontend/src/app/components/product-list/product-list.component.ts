import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/models/Product';
import { ProductsService } from 'src/app/services/products.service';
import { WishlistService } from 'src/app/services/wishlist.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  term      = '';
  products: Product[] | null = null;
  hoveredId: any = null;
  isLoggedIn = false;
  isBuyer    = false;
  isSeller   = false;
  toast      = '';

  get filteredProducts(): Product[] {
    if (!this.products) return [];
    if (!this.term) return this.products;
    return this.products.filter(p =>
      p.name.toLowerCase().includes(this.term.toLowerCase()) ||
      p.description?.toLowerCase().includes(this.term.toLowerCase())
    );
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private wishlistService: WishlistService
  ) {
    this.term = route.snapshot.paramMap.get('term') || '';
  }

  ngOnInit(): void {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.isBuyer    = localStorage.getItem('userRole') === 'ROLE_BUYER';
    this.isSeller   = localStorage.getItem('userRole') === 'ROLE_SELLER';
    this.loadProducts();
  }

  loadProducts(): void {
    this.productsService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products.map(p => ({
          ...p,
          imageUrl: p.image ? 'data:image/jpeg;base64,' + p.image : null
        }));
      },
      error: () => { this.products = []; }
    });
  }

  isWishlisted(product: Product): boolean {
    return this.wishlistService.isWishlisted(product.id);
  }

  toggleWishlist(product: Product, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (!this.isLoggedIn) { this.router.navigateByUrl('/login'); return; }
    if (!this.isBuyer) { this.showToast('Only buyers can use wishlist'); return; }
    const added = this.wishlistService.toggle(product);
    this.showToast(added ? 'Added to wishlist ❤️' : 'Removed from wishlist');
  }

  showToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => this.toast = '', 3000);
  }
}
