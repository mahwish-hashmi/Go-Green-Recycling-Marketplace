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
  loading      = true;
  showForm     = false;
  editingProduct: Product | null = null;
  deleteConfirmId: any = null;
  toast        = '';
  toastType    = 'success';
  submitting   = false;

  // Form fields
  formName         = '';
  formDescription  = '';
  formPrice: number = 0;
  formImageFile: File | null = null;
  formImagePreview: string | null = null;

  constructor(
    private router: Router,
    private productsService: ProductsService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.router.navigateByUrl('/login');
      return;
    }
    if (localStorage.getItem('userRole') !== 'ROLE_SELLER') {
      this.router.navigateByUrl('/shop');
      return;
    }
    this.usersService.getUserByToken().subscribe({
      next: (u: User) => { this.user = u; },
      error: () => {}
    });
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    // KEY FIX: use getMyProducts() — returns only THIS seller's products
    this.productsService.getMyProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products.map(p => ({
          ...p,
          imageUrl: p.image ? 'data:image/jpeg;base64,' + p.image : null
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        // Fallback: load all products if seller endpoint fails
        this.productsService.getProducts().subscribe({
          next: (all) => {
            const username = this.user?.username || localStorage.getItem('username');
            this.products = all
              .filter(p => !p.sellerUsername || p.sellerUsername === username)
              .map(p => ({
                ...p,
                imageUrl: p.image ? 'data:image/jpeg;base64,' + p.image : null
              }));
            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      }
    });
  }

  openAddForm(): void {
    this.showForm        = true;
    this.editingProduct  = null;
    this.formName        = '';
    this.formDescription = '';
    this.formPrice       = 0;
    this.formImageFile   = null;
    this.formImagePreview = null;
  }

  openEditForm(product: Product): void {
    this.editingProduct  = product;
    this.showForm        = true;
    this.formName        = product.name;
    this.formDescription = product.description;
    this.formPrice       = Number(product.price);
    this.formImageFile   = null;
    this.formImagePreview = (product as any).imageUrl || null;
  }

  closeForm(): void {
    this.showForm        = false;
    this.editingProduct  = null;
    this.formImageFile   = null;
    this.formImagePreview = null;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.showToast('Please select an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('Image must be under 5MB', 'error');
      return;
    }
    this.formImageFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => { this.formImagePreview = e.target.result; };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.formImageFile   = null;
    this.formImagePreview = null;
  }

  submitForm(): void {
    if (!this.formName.trim() || !this.formDescription.trim() || !this.formPrice) {
      this.showToast('Please fill all required fields', 'error');
      return;
    }
    if (this.formPrice <= 0) {
      this.showToast('Price must be greater than 0', 'error');
      return;
    }
    this.submitting = true;

    if (this.editingProduct) {
      // UPDATE — PUT /api/products/{id}/upload
      this.productsService.updateProductWithImage(
        String(this.editingProduct.id),
        this.formName,
        this.formDescription,
        this.formPrice,
        this.formImageFile || undefined
      ).subscribe({
        next: () => {
          this.submitting = false;
          this.closeForm();
          this.loadProducts();
          this.showToast('Product updated! ✓');
        },
        error: (err) => {
          this.submitting = false;
          console.error('Update error:', err);
          this.showToast(
            err.status === 403
              ? 'You can only edit your own products'
              : 'Failed to update product',
            'error'
          );
        }
      });
    } else {
      // ADD — POST /api/products/upload
      this.productsService.addProductWithImage(
        this.formName,
        this.formDescription,
        this.formPrice,
        this.formImageFile || undefined
      ).subscribe({
        next: () => {
          this.submitting = false;
          this.closeForm();
          this.loadProducts();
          this.showToast('Product added! 🌿');
        },
        error: (err) => {
          this.submitting = false;
          console.error('Add error:', err);
          this.showToast('Failed to add product', 'error');
        }
      });
    }
  }

  confirmDelete(id: any): void { this.deleteConfirmId = id; }

  deleteProduct(id: any): void {
    this.productsService.deleteProduct(String(id)).subscribe({
      next: () => {
        this.deleteConfirmId = null;
        this.loadProducts();
        this.showToast('Product deleted');
      },
      error: (err) => {
        this.deleteConfirmId = null;
        this.showToast(
          err.status === 403
            ? 'You can only delete your own products'
            : 'Failed to delete product',
          'error'
        );
      }
    });
  }

  showToast(msg: string, type = 'success'): void {
    this.toast     = msg;
    this.toastType = type;
    setTimeout(() => this.toast = '', 3500);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigateByUrl('/login').then(() => window.location.reload());
  }
}
