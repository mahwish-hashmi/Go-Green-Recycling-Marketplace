import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/Product';
import { ProductsService } from 'src/app/services/products.service';
import { UsersService } from 'src/app/services/users.service';
import { User } from 'src/app/models/User';

@Component({
  selector: 'app-seller-dashboard',
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.css']
})
export class SellerDashboardComponent implements OnInit {
  user: User | null = null;
  products: Product[] = [];
  loading = true;
  showAddForm = false;
  editingProduct: Product | null = null;
  deleteConfirmId: any = null;
  toast = '';
  toastType = 'success';

  // Form fields
  formName = '';
  formDescription = '';
  formPrice: number = 0;

  constructor(
    private router: Router,
    private productsService: ProductsService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    const role = localStorage.getItem('userRole');
    if (!localStorage.getItem('token')) {
      this.router.navigateByUrl('/login');
      return;
    }
    if (role !== 'ROLE_SELLER') {
      this.router.navigateByUrl('/account');
      return;
    }

    this.usersService.getUserByToken().subscribe({
      next: (user: User) => { this.user = user; },
      error: () => {}
    });

    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productsService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openAddForm(): void {
    this.showAddForm = true;
    this.editingProduct = null;
    this.formName = '';
    this.formDescription = '';
    this.formPrice = 0;
  }

  openEditForm(product: Product): void {
    this.editingProduct = product;
    this.showAddForm = true;
    this.formName = product.name;
    this.formDescription = product.description;
    this.formPrice = Number(product.price);
  }

  closeForm(): void {
    this.showAddForm = false;
    this.editingProduct = null;
  }

  submitForm(): void {
    if (!this.formName || !this.formDescription || !this.formPrice) {
      this.showToast('Please fill all fields', 'error');
      return;
    }

    const payload = {
      name: this.formName,
      description: this.formDescription,
      price: this.formPrice
    };

    if (this.editingProduct) {
      this.productsService.updateProduct(String(this.editingProduct.id), payload).subscribe({
        next: () => {
          this.closeForm();
          this.loadProducts();
          this.showToast('Product updated successfully!');
        },
        error: () => this.showToast('Failed to update product', 'error')
      });
    } else {
      this.productsService.addProduct(payload).subscribe({
        next: () => {
          this.closeForm();
          this.loadProducts();
          this.showToast('Product added successfully!');
        },
        error: () => this.showToast('Failed to add product', 'error')
      });
    }
  }

  confirmDelete(id: any): void {
    this.deleteConfirmId = id;
  }

  deleteProduct(id: any): void {
    this.productsService.deleteProduct(String(id)).subscribe({
      next: () => {
        this.deleteConfirmId = null;
        this.loadProducts();
        this.showToast('Product deleted');
      },
      error: () => this.showToast('Failed to delete product', 'error')
    });
  }

  showToast(msg: string, type: string = 'success'): void {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => this.toast = '', 3000);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigateByUrl('/login').then(() => window.location.reload());
  }
}
