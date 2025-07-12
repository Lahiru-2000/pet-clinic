import { Component, OnInit } from '@angular/core';
import { UserService, UserProfile, PasswordChangeRequest } from '../../services/user.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: UserProfile = {
    name: '',
    email: '',
    phone: '',
    contactNumber: ''
  };
  
  editingUser: boolean = false;
  editingPassword: boolean = false;
  loading: boolean = false;
  editedUser: UserProfile = { ...this.user };
  
  // Password change form
  passwordForm: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  } = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  
  // Validation states
  passwordValidation: {
    currentPasswordValid: boolean;
    newPasswordValid: boolean;
    passwordsMatch: boolean;
    showValidation: boolean;
  } = {
    currentPasswordValid: false,
    newPasswordValid: false,
    passwordsMatch: false,
    showValidation: false
  };

  // Messages
  successMessage: string = '';
  errorMessage: string = '';
  
  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const userEmail = this.authService.getUserEmail();
    if (userEmail) {
      this.loading = true;
      this.userService.getUserProfile(userEmail).subscribe(
        (profile: UserProfile) => {
          this.user = profile;
          this.editedUser = { ...profile };
          this.loading = false;
        },
        (error) => {
          console.error('Error loading user profile:', error);
          this.loading = false;
          this.showError('Failed to load user profile');
        }
      );
    }
  }

  startEditUser() {
    this.editedUser = { ...this.user };
    this.editingUser = true;
    this.editingPassword = false;
    this.clearMessages();
  }

  saveEditUser() {
    if (!this.validateUserForm()) {
      return;
    }

    this.loading = true;
    const userEmail = this.authService.getUserEmail();
    
    if (userEmail) {
      this.userService.updateUserProfile(userEmail, this.editedUser).subscribe(
        (response) => {
          if (response.success !== false) {
            this.user = { ...this.editedUser };
            this.editingUser = false;
            this.loading = false;
            this.showSuccess('Profile updated successfully!');
            
            // Update localStorage if name or email changed
            if (this.user.name !== this.authService.getUsername()) {
              localStorage.setItem('authUsername', this.user.name);
            }
          } else {
            this.loading = false;
            this.showError(response.message || 'Failed to update profile');
          }
        },
        (error) => {
          console.error('Error updating profile:', error);
          this.loading = false;
          this.showError('Failed to update profile');
        }
      );
    }
  }

  cancelEditUser() {
    this.editingUser = false;
    this.editedUser = { ...this.user };
    this.clearMessages();
  }

  startEditPassword() {
    this.editingPassword = true;
    this.editingUser = false;
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.resetPasswordValidation();
    this.clearMessages();
  }

  validatePassword() {
    this.passwordValidation.showValidation = true;
    
    // Validate current password length
    this.passwordValidation.currentPasswordValid = this.passwordForm.currentPassword.length >= 6;
    
    // Validate new password (at least 8 characters, contains letter and number)
    const newPassword = this.passwordForm.newPassword;
    this.passwordValidation.newPasswordValid = 
      newPassword.length >= 8 && 
      /[A-Za-z]/.test(newPassword) && 
      /\d/.test(newPassword);
    
    // Check if passwords match
    this.passwordValidation.passwordsMatch = 
      this.passwordForm.newPassword === this.passwordForm.confirmPassword &&
      this.passwordForm.newPassword.length > 0;
  }

  savePassword() {
    this.validatePassword();
    
    if (!this.passwordValidation.currentPasswordValid || 
        !this.passwordValidation.newPasswordValid || 
        !this.passwordValidation.passwordsMatch) {
      this.showError('Please fix the validation errors before submitting.');
      return;
    }

    this.loading = true;
    const userEmail = this.authService.getUserEmail();
    
    if (userEmail) {
      const passwordData: PasswordChangeRequest = {
        current_password: this.passwordForm.currentPassword,
        new_password: this.passwordForm.newPassword,
        new_password_confirmation: this.passwordForm.confirmPassword
      };

      this.userService.changePassword(userEmail, passwordData).subscribe(
        (response) => {
          if (response.success !== false) {
            this.editingPassword = false;
            this.loading = false;
            this.showSuccess('Password changed successfully!');
            this.resetPasswordForm();
          } else {
            this.loading = false;
            this.showError(response.message || 'Failed to change password');
          }
        },
        (error) => {
          console.error('Error changing password:', error);
          this.loading = false;
          this.showError('Failed to change password');
        }
      );
    }
  }

  cancelEditPassword() {
    this.editingPassword = false;
    this.resetPasswordForm();
    this.clearMessages();
  }

  // Helper methods
  private validateUserForm(): boolean {
    if (!this.editedUser.name || this.editedUser.name.trim().length < 2) {
      this.showError('Name must be at least 2 characters long');
      return false;
    }
    
    if (!this.editedUser.email || !this.isValidEmail(this.editedUser.email)) {
      this.showError('Please enter a valid email address');
      return false;
    }
    
    if (this.editedUser.phone && !this.isValidPhone(this.editedUser.phone)) {
      this.showError('Please enter a valid phone number');
      return false;
    }
    
    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  private resetPasswordForm() {
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.resetPasswordValidation();
  }

  private resetPasswordValidation() {
    this.passwordValidation = {
      currentPasswordValid: false,
      newPasswordValid: false,
      passwordsMatch: false,
      showValidation: false
    };
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 5000);
  }

  private showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 5000);
  }

  private clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
