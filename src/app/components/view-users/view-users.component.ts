import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-users',
  templateUrl: './view-users.component.html',
  styleUrl: './view-users.component.scss'
})
export class ViewUsersComponent  implements OnInit{

  username: string | null = '';
  useremail: string | null = '';
  userIsAdmin: string | null = '';

  users: any[] = []; // Store all appointments here
  filteredAppointments: any[] = []; // Store filtered appointments based on user role

  constructor(private authService: AuthService, private http: HttpClient, private toastr: ToastrService, private router: Router){}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.useremail = this.authService.getUserEmail();
    this.userIsAdmin = this.authService.getUserIsAdmin();

    this.fetchUsers();
  }

  fetchUsers() {
    this.http.get<any[]>('http://localhost:8000/api/users')
      .subscribe((data) => {
        this.users = data;
        this.filteredAppointments = [...this.users];
      }, (error) => {
        console.error('Error fetching appointments:', error);
      });
  }

  signOut() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
