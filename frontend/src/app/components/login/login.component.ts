import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  error    = '';
  loading  = false;

  constructor(private usersService: UsersService, private router: Router) {}

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      this.redirectByRole();
    }
  }

  logIn(): void {
    this.error = '';
    if (!this.username || !this.password) {
      this.error = 'Please enter username and password';
      return;
    }
    this.loading = true;

    this.usersService.login(this.username, this.password).subscribe({
      next: (response: any) => {
        this.loading = false;
        localStorage.setItem('token',    response.token);
        localStorage.setItem('userRole', response.role || 'ROLE_BUYER');
        localStorage.setItem('username', this.username);
        this.redirectByRole();
        window.location.reload();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.status === 0
          ? 'Cannot connect to server.'
          : 'Invalid username or password';
      }
    });
  }

  redirectByRole(): void {
    const role = localStorage.getItem('userRole');
    if (role === 'ROLE_SELLER') {
      this.router.navigateByUrl('/seller');
    } else {
      this.router.navigateByUrl('/shop');
    }
  }
}
