import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../../services/appointment.service';



@Component({
  selector: 'app-admin-view-appointment',
  templateUrl: './admin-view-appointment.component.html',
  styleUrls: ['./admin-view-appointment.component.css']
})
export class AdminViewAppointmentComponent implements OnInit {
  appointments: any[] = [];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.fetchAppointments();
  }

  fetchAppointments(): void {
    this.appointmentService.getAllAppointments().subscribe(
      (data: any[]) => {
        this.appointments = data;
      },
      (err: any) => {
        console.error('Error fetching appointments:', err);
      }
    );
  }

  acceptAppointment(id: number): void {
    this.appointmentService.acceptAppointment(id).subscribe(
      () => this.fetchAppointments(),
      (err: any) => console.error('Error accepting appointment:', err)
    );
  }

  declineAppointment(id: number): void {
    this.appointmentService.declineAppointment(id).subscribe(
      () => this.fetchAppointments(),
      (err: any) => console.error('Error declining appointment:', err)
    );
  }
}
