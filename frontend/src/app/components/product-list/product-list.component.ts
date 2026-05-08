import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/models/Product';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  public term: string = '';
  public products: Product[] | null = null;
  public hoveredId: any = null;
  public isLoggedIn: boolean = false;
  public userRole: string = '';
  public toast: string = '';

  get filteredCount(): number {
    if (!this.products) return 0;
    return this.products.filter(p =>
      p.name.toLowerCase().includes(this.term.toLowerCase())
    ).length;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productsService: ProductsService
  ) {
    this.term = route.snapshot.paramMap.get('term') || '';
  }

  ngOnInit(): void {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.userRole = localStorage.getItem('userRole') || '';
    this.loadProducts();
  }

  loadProducts(): void {
    this.productsService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products.map(p => ({
          ...p,
          imageUrl: p.image
            ? 'data:image/jpeg;base64,' + p.image
            : null
        }));
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.products = [];
      }
    });
  }

  addToCart(productId: any): void {
    if (!this.isLoggedIn) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.showToast('Added to cart! 🛒');
  }

  showToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => this.toast = '', 3000);
  }
}
