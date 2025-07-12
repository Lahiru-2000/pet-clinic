
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent implements OnInit{
username: string | null = '';
  useremail: string | null = '';
  userIsAdmin: string | null = '';

  constructor(private authService: AuthService, private router: Router){}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.useremail = this.authService.getUserEmail();
    this.userIsAdmin = this.authService.getUserIsAdmin();

    console.log("Username: " , this.username);
  }

  signOut() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
