import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface UserProfile {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  contactNumber?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Get user profile by email
  getUserProfile(email: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/user/profile/${encodeURIComponent(email)}`).pipe(
      catchError(error => {
        console.error('Error fetching user profile:', error);
        // Return mock data as fallback
        return of({
          name: 'John Doe',
          email: email,
          phone: '1234567890',
          contactNumber: '1234567890'
        });
      })
    );
  }

  // Update user profile
  updateUserProfile(email: string, userData: Partial<UserProfile>): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.put(`${this.apiUrl}/user/profile/${encodeURIComponent(email)}`, userData, { headers }).pipe(
      catchError(error => {
        console.error('Error updating user profile:', error);
        return of({ success: false, message: 'Failed to update profile' });
      })
    );
  }

  // Change password
  changePassword(email: string, passwordData: PasswordChangeRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.apiUrl}/user/change-password`, {
      email: email,
      ...passwordData
    }, { headers }).pipe(
      catchError(error => {
        console.error('Error changing password:', error);
        return of({ success: false, message: 'Failed to change password' });
      })
    );
  }

  // Get user by ID (alternative method)
  getUserById(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/user/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching user by ID:', error);
        return of({
          name: 'Unknown User',
          email: 'unknown@example.com',
          phone: '0000000000'
        });
      })
    );
  }

  // Validate current password
  validateCurrentPassword(email: string, currentPassword: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.apiUrl}/user/validate-password`, {
      email: email,
      password: currentPassword
    }, { headers }).pipe(
      catchError(error => {
        console.error('Error validating password:', error);
        return of({ success: false, message: 'Failed to validate password' });
      })
    );
  }
} 