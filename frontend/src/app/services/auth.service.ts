import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: any) {
    return this.http.post<any>('http://localhost:8080/api/login', credentials)
      .pipe(
        tap(response => {

          localStorage.setItem('token', response.token);

          localStorage.setItem('role', response.role);

          localStorage.setItem('username', response.username);

        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');

    this.router.navigate(['/login']);
  }
}