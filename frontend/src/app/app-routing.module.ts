import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { CartComponent } from './components/cart/cart.component';
import { LoginComponent } from './components/login/login.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { RegisterComponent } from './components/register/register.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { SellerDashboardComponent } from './components/seller-dashboard/seller-dashboard.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { OrdersComponent } from './components/orders/orders.component';
import { AuthGuard } from './guards/auth.guard';
import { BuyerGuard } from './guards/buyer.guard';
import { SellerGuard } from './guards/seller.guard';

const routes: Routes = [
  // Public
  { path: '', redirectTo: '/shop', pathMatch: 'full' },
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Public product browsing
  { path: 'shop/products/:id', component: ProductDetailComponent },
  { path: 'shop',              component: ProductListComponent },
  { path: 'shop/:term',        component: ProductListComponent },

  // Buyer-only routes (require ROLE_BUYER)
  { path: 'cart',     component: CartComponent,       canActivate: [BuyerGuard] },
  { path: 'wishlist', component: WishlistComponent,   canActivate: [BuyerGuard] },
  { path: 'orders',   component: OrdersComponent,     canActivate: [BuyerGuard] },

  // Seller-only routes (require ROLE_SELLER)
  { path: 'seller',   component: SellerDashboardComponent, canActivate: [SellerGuard] },

  // Any logged-in user
  { path: 'account',  component: UserDetailComponent, canActivate: [AuthGuard] },

  // Catch-all
  { path: '**', redirectTo: '/shop' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor(router: Router) {}
}
