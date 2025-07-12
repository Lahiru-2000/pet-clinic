import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update-doctor',
  templateUrl: './update-doctor.component.html',
  styleUrl: './update-doctor.component.scss'
})
export class UpdateDoctorComponent implements OnInit {

  username: string | null = '';
  useremail: string | null = '';
  userIsAdmin: string | null = '';

  doctors: any[] = [];
  selectedDoctor: any = null;

  constructor(private authService: AuthService, private router: Router, private http: HttpClient, private toastr: ToastrService){}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.useremail = this.authService.getUserEmail();
    this.userIsAdmin = this.authService.getUserIsAdmin();

    console.log("Username: " , this.username);

    this.fetchDoctors();
  }

  fetchDoctors(): void {
    this.http.get('http://localhost:8000/api/doctors').subscribe(
      (response: any) => {
        this.doctors = response;
      },
      (error) => {
        console.error('Error fetching doctors:', error);
        this.toastr.error('Failed to load doctors.', 'Error');
      }
    );
  }

  onEditDoctor(doctor: any): void {
    this.selectedDoctor = { ...doctor };  // Clone the doctor object for editing
  }

  onSubmitUpdateDoctor(): void {
    this.http.put(`http://localhost:8000/api/updatedoc/${this.selectedDoctor.id}`, this.selectedDoctor).subscribe(
      (response) => {
        this.toastr.success('Doctor updated successfully!', 'Success');
        this.fetchDoctors();  // Refresh the doctors list after updating
        this.selectedDoctor = null;  // Reset the form
      },
      (error) => {
        console.error('Error updating doctor:', error);
        this.toastr.error('Failed to update doctor.', 'Error');
      }
    );
  }

  // Cancel editing
  cancelEdit(): void {
    this.selectedDoctor = null;  // Clear the selected doctor and hide the form
  }

  signOut() {
    localStorage.clear();
    this.router.navigate(['/']);
  }

}
