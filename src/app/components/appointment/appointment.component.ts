import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css'
})
export class AppointmentComponent implements OnInit {

  username: string | null = '';
  useremail: string | null = '';
  userIsAdmin: string | null = '';
  doctors: any[] = [];

  appointmentData = {
    name: '',
    email: '',
    tp: '',
    date: '',
    petname: '',
    docname: '',
    message: ''
  };

  constructor(private authService: AuthService, private http: HttpClient, private router: Router, private toastr: ToastrService){}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.useremail = this.authService.getUserEmail();
    this.userIsAdmin = this.authService.getUserIsAdmin();

    this.appointmentData.name = this.username || '';
    this.appointmentData.email = this.useremail || '';

    this.fetchDoctors();
  }

  fetchDoctors(): void {
    this.http.get<any[]>('http://localhost:8000/api/doctors')  // Replace with your actual API URL
      .subscribe(
        (data) => {
          this.doctors = data;
        },
        (error) => {
          console.error('Error fetching doctors:', error);
        }
      );
  }

  onSubmit(): void {
    // Copying appointment data for submission
    const appointment = {
      name: this.appointmentData.name,
      email: this.appointmentData.email,
      tp: this.appointmentData.tp,
      date: this.appointmentData.date,
      petname: this.appointmentData.petname,
      docname: this.appointmentData.docname,
      message: this.appointmentData.message,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),  // Current time in 'YYYY-MM-DD HH:MM:SS' format
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    // Sending appointment data via HTTP POST
    this.http.post('http://localhost:8000/api/addappointment', appointment) // Replace with actual API endpoint
      .subscribe(
        (response) => {

          this.toastr.success('Appointment added successfully!', 'Success');

          this.appointmentData = {
            name: '',      // Assuming you don't want to reset the logged-in user's name
            email: '',     // Assuming you don't want to reset the logged-in user's email
            tp:'',
            date: '',
            petname: '',
            docname: '',
            message: ''
          };
        },
        (error) => {
          this.toastr.error('Appointment Creation Error!', 'error');
          console.error('Error creating appointment:', error);
        }
      );
  }

  signOut() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
