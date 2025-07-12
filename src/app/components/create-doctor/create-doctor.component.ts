import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-doctor',
  templateUrl: './create-doctor.component.html',
  styleUrl: './create-doctor.component.scss'
})
export class CreateDoctorComponent implements OnInit{

  username: string | null = '';
  useremail: string | null = '';
  userIsAdmin: string | null = '';
  doctorData = { dname: '', demail: '', dtp: '' };

  constructor(private authService: AuthService, private http: HttpClient, private router: Router, private toastr: ToastrService){}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.useremail = this.authService.getUserEmail();
    this.userIsAdmin = this.authService.getUserIsAdmin();
  }

  onSubmitDoctor() {
    // Construct the new doctor data
    const newDoctor = {
      dname: this.doctorData.dname,
      demail: this.doctorData.demail,
      dtp: this.doctorData.dtp,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),  // Current time in 'YYYY-MM-DD HH:MM:SS' format
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    // Call the API to create the doctor
    this.http.post('http://localhost:8000/api/addDoc', newDoctor).subscribe(
      (response) => {
        this.toastr.success('Doctor added successfully!', 'Success');
        this.doctorData = { dname: '', demail: '', dtp: '' };
      },
      (error) => {
        console.error('Error adding doctor:', error);
        this.toastr.error('Failed to add doctor.', 'Error');
      }
    );
  }

  signOut() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
