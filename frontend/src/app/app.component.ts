import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'frontend';
    public term : string
    public isTokenThere : boolean

    constructor(
      private router: Router,
      private authService: AuthService
    ) {
        console.log("Token:  " + localStorage.getItem('token'));
        this.isTokenThere = localStorage.getItem('token') != null
    }

    search () {
      this.router.navigate(["/shop", this.term]).then(() => window.location.reload())
    }

    logout() {
      this.authService.logout();
    }
  
  public scrolled = false;

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 10;
  }
  
}
