import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { WishlistService } from './services/wishlist.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isLoggedIn   = false;
  userRole     = '';
  username     = '';
  searchTerm   = '';
  scrolled     = false;
  isSellerPage = false;

  get isBuyer():  boolean { return this.isLoggedIn && this.userRole === 'ROLE_BUYER'; }
  get isSeller(): boolean { return this.isLoggedIn && this.userRole === 'ROLE_SELLER'; }
  get wishlistCount(): number { return this.wishlistService.count; }

  constructor(
    private router: Router,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.readAuth();
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.readAuth();
        this.isSellerPage = e.url.startsWith('/seller');
      });
  }

  readAuth(): void {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.userRole   = localStorage.getItem('userRole') || '';
    this.username   = localStorage.getItem('username') || '';
  }

  @HostListener('window:scroll')
  onScroll(): void { this.scrolled = window.scrollY > 20; }

  search(): void {
    const t = this.searchTerm.trim();
    if (t) {
      this.router.navigateByUrl('/shop/' + encodeURIComponent(t));
      this.searchTerm = '';
    }
  }

  logout(): void {
    localStorage.clear();
    this.isLoggedIn = false;
    this.userRole   = '';
    this.username   = '';
    this.router.navigateByUrl('/login');
  }
}
