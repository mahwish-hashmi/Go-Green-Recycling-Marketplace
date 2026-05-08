import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  userRole = '';
  username = '';
  searchTerm = '';
  scrolled = false;
  isSellerDashboard = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.readAuth();

    // Re-read auth on every navigation (handles login/logout redirects)
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.readAuth();
        this.isSellerDashboard = e.url.startsWith('/seller');
      });
  }

  readAuth(): void {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.userRole = localStorage.getItem('userRole') || '';
    this.username = localStorage.getItem('username') || '';
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 20;
  }

  search(): void {
    if (this.searchTerm.trim()) {
      this.router.navigateByUrl('/shop/' + encodeURIComponent(this.searchTerm.trim()));
      this.searchTerm = '';
    }
  }

  logout(): void {
    localStorage.clear();
    this.isLoggedIn = false;
    this.userRole = '';
    this.username = '';
    this.router.navigateByUrl('/login');
  }
}
