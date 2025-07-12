import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { response } from 'express';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isAuthenticated: boolean;
  private tokenKey = 'authToken'; // LocalStorage key for storing the token
  private usernameKey = 'authUsername';
  private userEmailKey = 'authEmail';
  private userIsAdminKey = 'authIsAdmin';
  private apiUrl = 'http://localhost:8000/api/login'; // Replace with your backend login endpoint

  constructor(private http: HttpClient) {
    this.isAuthenticated = this.checkTokenExists(); // Initialize isAuthenticated
  }

  private checkTokenExists(): boolean {
    if (typeof window !== 'undefined' && localStorage) {
      const token = localStorage.getItem(this.tokenKey);
      return !!token; // true if token exists, false otherwise
    }
    return false; // Default to false if localStorage is not available
  }

  login(loginData: { email: string, password: string, rememberMe: boolean }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(this.apiUrl, loginData, { headers }).pipe(
      map((response: any) => {
        if (response.success) {
          // Set isAuthenticated and store necessary data in localStorage (if available)
          this.isAuthenticated = true;
          if (typeof window !== 'undefined' && localStorage) {
            localStorage.setItem(this.tokenKey, "AAAAA");  // Use actual token here
            localStorage.setItem(this.usernameKey, response.name);
            localStorage.setItem(this.userEmailKey, response.email);
            localStorage.setItem(this.userIsAdminKey, response.isAdmin);
          }
        }
        return response;
      }),
      catchError(error => {
        console.error('Login error', error);
        return of({ success: false, message: 'Login failed' });
      })
    );
  }

  getUserIsAdmin(): string | null {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem(this.userIsAdminKey);
    }
    return null;
  }

  getUsername(): string | null {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem(this.usernameKey);
    }
    return null;
  }

  getUserEmail(): string | null {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem(this.userEmailKey);
    }
    return null;
  }

  logout() {
    this.isAuthenticated = false;
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.usernameKey);
      localStorage.removeItem(this.userEmailKey);
      localStorage.removeItem(this.userIsAdminKey);
    }
  }

  isLoggedIn(): boolean {
    this.isAuthenticated = this.checkTokenExists(); // Update isAuthenticated based on localStorage
    return this.isAuthenticated;
  }
}
// export class AuthService {

//   private isAuthenticated = false;
//   private tokenKey = 'authToken'; // LocalStorage key for storing the token
//   private usernameKey = 'authUsername';
//   private userEmailKey = 'authEmail';
//   private userIsAdminKey = 'authIsAdmin';
//   private apiUrl = 'http://localhost:8000/api/login'; // Replace with your backend login endpoint

//   constructor(private http: HttpClient) {}

//   login(loginData: { email: string, password: string, rememberMe: boolean }): Observable<any> {
//     const headers = new HttpHeaders({
//       'Content-Type': 'application/json',
//     });

//     return this.http.post(this.apiUrl, loginData, { headers }).pipe(
//       map((response: any) => {

//         if (response.success) {
//           this.isAuthenticated = true;

//           localStorage.setItem(this.tokenKey, "AAAAA");
//           localStorage.setItem(this.usernameKey, response.name);
//           localStorage.setItem(this.userEmailKey, response.email);
//           localStorage.setItem(this.userIsAdminKey, response.isAdmin);
//           if (loginData.rememberMe) {

//           }
//       }
//         return response;
//       }),
//       catchError(error => {
//         console.error('Login error', error);
//         return of({ success: false, message: 'Login failed' });
//       })
//     );
//   }

//   getUserIsAdmin(): string | null {
//     return localStorage.getItem(this.userIsAdminKey);
//   }

//   getUsername(): string | null {
//     return localStorage.getItem(this.usernameKey); // Retrieve the username
//   }

//   getUserEmail(): string | null {
//     return localStorage.getItem(this.userEmailKey);
//   }

//   logout() {
//     this.isAuthenticated = false;
//     localStorage.removeItem(this.tokenKey);
//   }

//   isLoggedIn(): boolean {
//     return this.isAuthenticated;
//   }
// }
