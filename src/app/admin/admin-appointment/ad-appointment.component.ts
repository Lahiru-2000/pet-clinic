import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../services/appointment.service'; // ✅ Update the path if necessary
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-appointment',
  templateUrl: './ad-appointment.component.html',
  styleUrls: ['./ad-appointment.component.scss']
})
export class AdminAppointmentComponent implements OnInit {

  appointments: any[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService.getAllAppointments().subscribe(
      (data: any[]) => {
        this.appointments = data;
      },
      (error) => {
        console.error('Failed to load appointments', error);
      }
    );
  }

  acceptAppointment(id: number): void {
    this.appointmentService.acceptAppointment(id).subscribe(
      () => {
        this.toastr.success('Appointment accepted.');
        this.loadAppointments(); // Refresh
      },
      (error) => {
        this.toastr.error('Error accepting appointment');
        console.error(error);
      }
    );
  }

  declineAppointment(id: number): void {
    this.appointmentService.declineAppointment(id).subscribe(
      () => {
        this.toastr.success('Appointment declined.');
        this.loadAppointments(); // Refresh
      },
      (error) => {
        this.toastr.error('Error declining appointment');
        console.error(error);
      }
    );
  }

  changeStatus(id: number, status: string): void {
  if (status === 'accepted') {
    this.appointmentService.acceptAppointment(id).subscribe(
      (response) => {
        console.log('Appointment accepted', response);
        this.loadAppointments(); // Reload list after status change
      },
      (error: any) => {
        console.error('Error accepting appointment:', error);
      }
    );
  } else if (status === 'declined') {
    this.appointmentService.declineAppointment(id).subscribe(
      (response) => {
        console.log('Appointment declined', response);
        this.loadAppointments();
      },
      (error: any) => {
        console.error('Error declining appointment:', error);
      }
    );
  }
}

}


