import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      console.log("can Activate: User is authenticated");
      return true; // Allow access
    } else {
      console.log("Authentication failed. Redirecting to login.");
      // Instead of alert, consider using a service to show notifications if needed
      this.router.navigate(['']);
      return false; // Prevent access
    }
  }
}
