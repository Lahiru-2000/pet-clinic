import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) {}

  onSubmit() {
    // Create a login object to pass to the service
    const loginData = {
      email: this.email,
      password: this.password,
      rememberMe: this.rememberMe
    };

    // Call the AuthService with the login data
    this.authService.login(loginData).subscribe((response: any) => {
      console.log("response: ", response);
      if (response.success) {
        this.toastr.success('Login successful!', 'Success');

        this.router.navigate(['/dashboard']);

      } else {
        this.toastr.error('Authentication failed!', 'Error');

        this.email = '';
        this.password = '';
        this.rememberMe = false;
      }
    });
  }
}
