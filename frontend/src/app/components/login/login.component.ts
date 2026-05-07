import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public username: string = '';
  public password: string = '';
  public error: string = '';
  public loading: boolean = false;

  constructor(private usersService: UsersService, private router: Router) {}

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      this.router.navigateByUrl('/account');
    }
  }

  logIn() {
    this.error = '';

    if (!this.username || !this.password) {
      this.error = 'Please enter username and password';
      return;
    }

    this.loading = true;

    this.usersService.login(this.username, this.password).subscribe({
      next: (response: any) => {
        this.loading = false;
        console.log('Login successful:', response);

        // Store token and role
        localStorage.setItem('token', response.token);
        localStorage.setItem('userRole', response.role || 'ROLE_BUYER');

        // Reload so app.component.ts re-reads localStorage and updates navbar
        this.router.navigateByUrl('/account').then(() => window.location.reload());
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Login error:', err);

        if (err.status === 0) {
          this.error = 'Cannot connect to server. Is the backend running?';
        } else {
          this.error = 'Invalid username or password';
        }
      }
    });
  }
}
