import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-appointment',
  templateUrl: './view-appointment.component.html',
  styleUrl: './view-appointment.component.scss'
})
export class ViewAppointmentComponent implements OnInit{

  username: string | null = '';
  useremail: string | null = '';
  userIsAdmin: string | null = '';

  appointments: any[] = [];
  filteredAppointments: any[] = [];

  constructor(private authService: AuthService, private http: HttpClient, private toastr: ToastrService, private router: Router){}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.useremail = this.authService.getUserEmail();
    this.userIsAdmin = this.authService.getUserIsAdmin();

    console.log("userIsAdmin: " , this.userIsAdmin);

    this.fetchAppointments();
  }

  fetchAppointments() {
    this.http.get<any[]>('http://localhost:8000/api/appointments')
      .subscribe((data) => {
        console.log("data: ", data);
        console.log("is admin: ", this.userIsAdmin);
        if (this.userIsAdmin == 'true') {
          console.log("true User Email: ", this.useremail);
          this.appointments = data; // Admin can see all appointments
        } else {
          console.log("else User Email: ", this.useremail);
          // Filter appointments for non-admin users
          this.appointments = data.filter(appointment => appointment.email === this.useremail);

        }
        this.filteredAppointments = [...this.appointments]; // Initialize filtered appointments
      }, (error) => {
        console.error('Error fetching appointments:', error);
      });


  }

  signOut() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}


