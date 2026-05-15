import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { CartComponent } from './components/cart/cart.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { SellerDashboardComponent } from './components/seller-dashboard/seller-dashboard.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { OrdersComponent } from './components/orders/orders.component';
import { JwtInterceptor } from './interceptors/jwt.interceptor';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { BuyerGuard } from './guards/buyer.guard';
import { SellerGuard } from './guards/seller.guard';

// Services
import { WishlistService } from './services/wishlist.service';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    ProductListComponent,
    ProductDetailComponent,
    CartComponent,
    UserDetailComponent,
    SellerDashboardComponent,
    WishlistComponent,
    OrdersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    CommonModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    AuthGuard,
    BuyerGuard,
    SellerGuard,
    WishlistService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
