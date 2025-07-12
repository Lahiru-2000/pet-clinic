import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentNotification } from '../models/appointment-notification.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getAllAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/appointments`);
  }

  acceptAppointment(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments/${id}/accept`, {});
  }

  declineAppointment(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments/${id}/decline`, {});
  }

 getNotifications(): Observable<AppointmentNotification[]> {
  return this.http.get<AppointmentNotification[]>(`${this.apiUrl}/appointment-notifications`);
}

getNotificationsByUser(userEmail: string): Observable<AppointmentNotification[]> {
  return this.http.get<AppointmentNotification[]>(`${this.apiUrl}/appointment-notifications/user/${encodeURIComponent(userEmail)}`);
}

}


