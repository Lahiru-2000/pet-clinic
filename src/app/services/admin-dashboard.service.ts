import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface AdminStats {
  totalUsers: number;
  todayAppointments: number;
  totalAppointments: number;
  totalPets: number;
  pendingAppointments: number;
  completedAppointments: number;
}

export interface TodayAppointment {
  id: number;
  date: string;
  time: string;
  petname: string;
  docname: string;
  name: string;
  email: string;
  status: string;
  contactNumber?: string;
  appointmentType?: string;
  notes?: string;
}

export interface AdminAppointment {
  id: number;
  date: string;
  time: string;
  petname: string;
  docname: string;
  name: string;
  email: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  contactNumber?: string;
  appointmentType?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  petAge?: string;
  petBreed?: string;
  reasonForVisit?: string;
}

export interface AppointmentFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  doctor?: string;
  searchTerm?: string;
}

export interface CreateAppointmentRequest {
  date: string;
  time: string;
  petname: string;
  docname: string;
  name: string;
  email: string;
  contactNumber?: string;
  appointmentType?: string;
  notes?: string;
  petAge?: string;
  petBreed?: string;
  reasonForVisit?: string;
}

export interface UpdateAppointmentRequest {
  date?: string;
  time?: string;
  petname?: string;
  docname?: string;
  name?: string;
  email?: string;
  contactNumber?: string;
  appointmentType?: string;
  notes?: string;
  status?: string;
  petAge?: string;
  petBreed?: string;
  reasonForVisit?: string;
}

export interface AdminNotification {
  id?: number;
  message: string;
  type: 'reminder' | 'alert' | 'info' | 'appointment';
  date: string;
  userEmail?: string;
  userName?: string;
  appointmentId?: number;
  isRead?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export interface Doctor {
  id: number;
  name: string;
  specialization?: string;
  email?: string;
  phone?: string;
  available?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Get admin dashboard statistics
  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/admin/stats`).pipe(
      catchError(error => {
        console.error('Error fetching admin stats:', error);
        // Return fallback stats
        return this.getFallbackStats();
      })
    );
  }

  // Get today's appointments
  getTodayAppointments(): Observable<TodayAppointment[]> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return this.http.get<TodayAppointment[]>(`${this.apiUrl}/admin/appointments/today`).pipe(
      catchError(error => {
        console.error('Error fetching today\'s appointments:', error);
        // Fallback to getting all appointments and filtering
        return this.getAllAppointmentsAndFilter();
      })
    );
  }

  // ============ APPOINTMENT MANAGEMENT METHODS ============

  // Get all appointments with optional filters
  getAllAppointments(filters?: AppointmentFilters): Observable<AdminAppointment[]> {
    let url = `${this.apiUrl}/admin/appointments`;
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.status) params.append('status', filters.status);
      if (filters.doctor) params.append('doctor', filters.doctor);
      if (filters.searchTerm) params.append('search', filters.searchTerm);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return this.http.get<AdminAppointment[]>(url).pipe(
      catchError(error => {
        console.error('Error fetching appointments:', error);
        // Fallback to basic appointments endpoint
        return this.getBasicAppointments().pipe(
          map(appointments => this.applyClientSideFilters(appointments, filters))
        );
      })
    );
  }

  // Get basic appointments (fallback)
  private getBasicAppointments(): Observable<AdminAppointment[]> {
    return this.http.get<any[]>(`${this.apiUrl}/appointments`).pipe(
      map(appointments => 
        appointments.map(appt => ({
          id: appt.id,
          date: appt.date,
          time: appt.time,
          petname: appt.petname,
          docname: appt.docname,
          name: appt.name,
          email: appt.email,
          status: appt.status || 'pending',
          contactNumber: appt.contactNumber,
          appointmentType: appt.appointmentType,
          notes: appt.notes,
          createdAt: appt.created_at,
          updatedAt: appt.updated_at,
          petAge: appt.petAge,
          petBreed: appt.petBreed,
          reasonForVisit: appt.reasonForVisit
        } as AdminAppointment))
      ),
      catchError(error => {
        console.error('Error fetching basic appointments:', error);
        return of([]);
      })
    );
  }

  // Apply client-side filters (fallback)
  private applyClientSideFilters(appointments: AdminAppointment[], filters?: AppointmentFilters): AdminAppointment[] {
    if (!filters) return appointments;

    return appointments.filter(appt => {
      // Date range filter
      if (filters.dateFrom && appt.date < filters.dateFrom) return false;
      if (filters.dateTo && appt.date > filters.dateTo) return false;
      
      // Status filter
      if (filters.status && appt.status !== filters.status) return false;
      
      // Doctor filter
      if (filters.doctor && !appt.docname.toLowerCase().includes(filters.doctor.toLowerCase())) return false;
      
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return appt.name.toLowerCase().includes(searchLower) ||
               appt.petname.toLowerCase().includes(searchLower) ||
               appt.email.toLowerCase().includes(searchLower) ||
               appt.docname.toLowerCase().includes(searchLower);
      }
      
      return true;
    });
  }

  // Create new appointment
  createAppointment(appointmentData: CreateAppointmentRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/appointments`, appointmentData).pipe(
      catchError(error => {
        console.error('Error creating appointment:', error);
        return of({ success: false, message: 'Failed to create appointment' });
      })
    );
  }

  // Update appointment
  updateAppointment(appointmentId: number, appointmentData: UpdateAppointmentRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/appointments/${appointmentId}`, appointmentData).pipe(
      catchError(error => {
        console.error('Error updating appointment:', error);
        return of({ success: false, message: 'Failed to update appointment' });
      })
    );
  }

  // Delete appointment
  deleteAppointment(appointmentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/appointments/${appointmentId}`).pipe(
      catchError(error => {
        console.error('Error deleting appointment:', error);
        return of({ success: false, message: 'Failed to delete appointment' });
      })
    );
  }

  // Update appointment status
  updateAppointmentStatus(appointmentId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/appointments/${appointmentId}/status`, { status }).pipe(
      catchError(error => {
        console.error('Error updating appointment status:', error);
        return of({ success: false, message: 'Failed to update appointment status' });
      })
    );
  }

  // Get appointment by ID
  getAppointmentById(appointmentId: number): Observable<AdminAppointment> {
    return this.http.get<AdminAppointment>(`${this.apiUrl}/admin/appointments/${appointmentId}`).pipe(
      catchError(error => {
        console.error('Error fetching appointment:', error);
        return of({} as AdminAppointment);
      })
    );
  }

  // Get available doctors
  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/doctors`).pipe(
      catchError(error => {
        console.error('Error fetching doctors:', error);
        // Return mock doctors as fallback
        return of([
          { id: 1, name: 'Dr. John Smith', specialization: 'General Veterinarian' },
          { id: 2, name: 'Dr. Sarah Johnson', specialization: 'Pet Surgery' },
          { id: 3, name: 'Dr. Mike Wilson', specialization: 'Pet Dentistry' },
          { id: 4, name: 'Dr. Emily Brown', specialization: 'Exotic Animals' }
        ]);
      })
    );
  }

  // Get appointment statistics
  getAppointmentStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/appointments/stats`).pipe(
      catchError(error => {
        console.error('Error fetching appointment stats:', error);
        return of({
          totalAppointments: 0,
          pendingAppointments: 0,
          confirmedAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0
        });
      })
    );
  }

  // ============ EXISTING METHODS ============

  // Get all appointments and filter for today (fallback)
  private getAllAppointmentsAndFilter(): Observable<TodayAppointment[]> {
    return this.http.get<any[]>(`${this.apiUrl}/appointments`).pipe(
      map(appointments => {
        const today = new Date().toISOString().split('T')[0];
        return appointments
          .filter(appt => {
            const apptDate = new Date(appt.date).toISOString().split('T')[0];
            return apptDate === today;
          })
          .map(appt => ({
            id: appt.id,
            date: appt.date,
            time: appt.time,
            petname: appt.petname,
            docname: appt.docname,
            name: appt.name,
            email: appt.email,
            status: appt.status || 'pending',
            contactNumber: appt.contactNumber,
            appointmentType: appt.appointmentType,
            notes: appt.notes
          }));
      }),
      catchError(error => {
        console.error('Error in fallback appointment fetch:', error);
        return of([]);
      })
    );
  }

  // Get admin notifications
  getAdminNotifications(): Observable<AdminNotification[]> {
    return this.http.get<AdminNotification[]>(`${this.apiUrl}/admin/notifications`).pipe(
      catchError(error => {
        console.error('Error fetching admin notifications:', error);
        // Generate fallback notifications
        return this.generateFallbackNotifications();
      })
    );
  }

  // Get user count
  getUserCount(): Observable<number> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      map(users => users.length),
      catchError(error => {
        console.error('Error fetching user count:', error);
        return of(0);
      })
    );
  }

  // Get total appointments count
  getTotalAppointments(): Observable<number> {
    return this.http.get<any[]>(`${this.apiUrl}/appointments`).pipe(
      map(appointments => appointments.length),
      catchError(error => {
        console.error('Error fetching total appointments:', error);
        return of(0);
      })
    );
  }

  // Get pets count
  getPetsCount(): Observable<number> {
    return this.http.get<any[]>(`${this.apiUrl}/pets`).pipe(
      map(pets => pets.length),
      catchError(error => {
        console.error('Error fetching pets count:', error);
        return of(0);
      })
    );
  }

  // Mark notification as read
  markNotificationAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/notifications/${notificationId}/read`, {}).pipe(
      catchError(error => {
        console.error('Error marking notification as read:', error);
        return of({ success: false });
      })
    );
  }

  // Private helper methods
  private getFallbackStats(): Observable<AdminStats> {
    // Combine multiple API calls to get stats
    return new Observable(observer => {
      Promise.all([
        this.getUserCount().toPromise(),
        this.getTotalAppointments().toPromise(),
        this.getPetsCount().toPromise(),
        this.getTodayAppointments().toPromise()
      ]).then(([userCount, totalAppointments, petsCount, todayAppointments]) => {
        const stats: AdminStats = {
          totalUsers: userCount || 0,
          todayAppointments: todayAppointments?.length || 0,
          totalAppointments: totalAppointments || 0,
          totalPets: petsCount || 0,
          pendingAppointments: todayAppointments?.filter(appt => appt.status === 'pending').length || 0,
          completedAppointments: todayAppointments?.filter(appt => appt.status === 'completed').length || 0
        };
        observer.next(stats);
        observer.complete();
      }).catch(error => {
        console.error('Error getting fallback stats:', error);
        observer.next({
          totalUsers: 0,
          todayAppointments: 0,
          totalAppointments: 0,
          totalPets: 0,
          pendingAppointments: 0,
          completedAppointments: 0
        });
        observer.complete();
      });
    });
  }

  private generateFallbackNotifications(): Observable<AdminNotification[]> {
    return this.getTodayAppointments().pipe(
      map(appointments => {
        const notifications: AdminNotification[] = [];
        const today = new Date().toISOString().split('T')[0];
        
        appointments.forEach(appt => {
          // Create notification for each today's appointment
          notifications.push({
            message: `${appt.name} has an appointment today at ${appt.time} for ${appt.petname} with ${appt.docname}`,
            type: 'appointment',
            date: today,
            userEmail: appt.email,
            userName: appt.name,
            appointmentId: appt.id,
            isRead: false,
            priority: 'medium'
          });

          // Add high priority notification for pending appointments
          if (appt.status === 'pending') {
            notifications.push({
              message: `Pending appointment: ${appt.name}'s appointment for ${appt.petname} needs confirmation`,
              type: 'alert',
              date: today,
              userEmail: appt.email,
              userName: appt.name,
              appointmentId: appt.id,
              isRead: false,
              priority: 'high'
            });
          }
        });

        return notifications;
      })
    );
  }
} 