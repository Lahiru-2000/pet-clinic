import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { NotificationService } from '../../services/notification.service';
import { AdminDashboardService, AdminStats, TodayAppointment, AdminNotification } from '../../services/admin-dashboard.service';
import { AppointmentNotification } from '../../models/appointment-notification.model';
import { Subscription } from 'rxjs';

interface Appointment {
  date: string;
  time: string;
  petname: string;
  docname: string;
  name: string;
}

interface HealthSummary {
  pet: string;
  lastVisit: string;
  nextVaccine: string;
  notes: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  username: string | null = '';
  useremail: string | null = '';
  userIsAdmin: string | null = '';
  isAdmin: boolean = false;

  // Client dashboard data
  upcomingAppointments: Appointment[] = [];
  petHealthSummaries: HealthSummary[] = [];
  notifications: AppointmentNotification[] = [];
  private notificationSubscription: Subscription = new Subscription();

  // Admin dashboard data
  adminStats: AdminStats = {
    totalUsers: 0,
    todayAppointments: 0,
    totalAppointments: 0,
    totalPets: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  };
  todayAppointments: TodayAppointment[] = [];
  adminNotifications: AdminNotification[] = [];
  isLoadingStats = false;
  isLoadingAppointments = false;
  isLoadingNotifications = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private appointmentService: AppointmentService,
    private notificationService: NotificationService,
    private adminDashboardService: AdminDashboardService
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.useremail = this.authService.getUserEmail();
    this.userIsAdmin = this.authService.getUserIsAdmin();
    this.isAdmin = this.userIsAdmin === '1' || this.userIsAdmin === 'true';

    console.log('Dashboard initialized - Is Admin:', this.isAdmin);

    if (this.isAdmin) {
      this.loadAdminDashboard();
    } else {
      this.loadClientDashboard();
    }
  }

  ngOnDestroy(): void {
    this.notificationSubscription.unsubscribe();
  }

  // Admin Dashboard Methods
  loadAdminDashboard(): void {
    this.loadAdminStats();
    this.loadTodayAppointments();
    this.loadAdminNotifications();
  }

  loadAdminStats(): void {
    this.isLoadingStats = true;
    this.adminDashboardService.getAdminStats().subscribe(
      (stats) => {
        this.adminStats = stats;
        this.isLoadingStats = false;
        console.log('Admin stats loaded:', stats);
      },
      (error) => {
        console.error('Error loading admin stats:', error);
        this.isLoadingStats = false;
      }
    );
  }

  loadTodayAppointments(): void {
    this.isLoadingAppointments = true;
    this.adminDashboardService.getTodayAppointments().subscribe(
      (appointments) => {
        this.todayAppointments = appointments;
        this.isLoadingAppointments = false;
        console.log('Today\'s appointments loaded:', appointments);
      },
      (error) => {
        console.error('Error loading today\'s appointments:', error);
        this.isLoadingAppointments = false;
      }
    );
  }

  loadAdminNotifications(): void {
    this.isLoadingNotifications = true;
    this.adminDashboardService.getAdminNotifications().subscribe(
      (notifications) => {
        this.adminNotifications = notifications;
        this.isLoadingNotifications = false;
        console.log('Admin notifications loaded:', notifications);
      },
      (error) => {
        console.error('Error loading admin notifications:', error);
        this.isLoadingNotifications = false;
      }
    );
  }

  updateAppointmentStatus(appointmentId: number, status: string): void {
    this.adminDashboardService.updateAppointmentStatus(appointmentId, status).subscribe(
      (response) => {
        if (response.success !== false) {
          // Update local data
          const appointment = this.todayAppointments.find(appt => appt.id === appointmentId);
          if (appointment) {
            appointment.status = status;
          }
          // Refresh stats
          this.loadAdminStats();
          console.log('Appointment status updated successfully');
        }
      },
      (error) => {
        console.error('Error updating appointment status:', error);
      }
    );
  }

  markAdminNotificationAsRead(notification: AdminNotification, index: number): void {
    if (notification.id) {
      this.adminDashboardService.markNotificationAsRead(notification.id).subscribe(
        (response) => {
          if (response.success !== false) {
            this.adminNotifications.splice(index, 1);
          }
        },
        (error) => {
          console.error('Error marking notification as read:', error);
        }
      );
    } else {
      // Remove from local array if no ID
      this.adminNotifications.splice(index, 1);
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'badge bg-success';
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'cancelled':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'badge bg-danger';
      case 'medium':
        return 'badge bg-warning text-dark';
      case 'low':
        return 'badge bg-info';
      default:
        return 'badge bg-secondary';
    }
  }

  // Client Dashboard Methods (existing functionality)
  loadClientDashboard(): void {
    // Subscribe to notifications
    this.notificationSubscription = this.notificationService.getNotifications()
      .subscribe(notifications => {
        this.notifications = notifications;
      });

    this.fetchAppointments();
    this.loadMockHealthData();
  }

  fetchAppointments() {
    this.appointmentService.getAllAppointments().subscribe(
      (data: any[]) => {
        const now = new Date();

        this.upcomingAppointments = data
          .filter(appt => new Date(appt.date) >= now)
          .map(appt => {
            const dt = new Date(appt.date);
            return {
              ...appt,
              date: dt.toISOString().split('T')[0],
              time: dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
            };
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        this.fetchNotifications();
      },
      (err) => {
        console.error('Error fetching appointments', err);
        this.fetchNotifications();
      }
    );
  }

  fetchNotifications() {
    if (this.useremail) {
      this.appointmentService.getNotificationsByUser(this.useremail).subscribe(
        (data: AppointmentNotification[]) => {
          this.notificationService.setNotifications(data);
        },
        (err) => {
          console.error('Error loading user-specific notifications', err);
          this.fetchGeneralNotifications();
        }
      );
    } else {
      this.fetchGeneralNotifications();
    }
  }

  fetchGeneralNotifications() {
    this.appointmentService.getNotifications().subscribe(
      (data: AppointmentNotification[]) => {
        this.notificationService.setNotifications(data);
      },
      (err) => {
        console.error('Error loading general notifications', err);
        this.generateNotificationsFromAppointments();
      }
    );
  }

  generateNotificationsFromAppointments() {
    const generatedNotifications: AppointmentNotification[] = [];
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    this.upcomingAppointments.forEach(appt => {
      const apptDate = new Date(appt.date);
      
      if (apptDate.toDateString() === tomorrow.toDateString()) {
        generatedNotifications.push({
          message: `Reminder: ${appt.petname} has an appointment tomorrow at ${appt.time} with ${appt.docname}`,
          type: 'reminder',
          date: now.toISOString().split('T')[0]
        });
      }
      
      if (apptDate >= now && apptDate <= nextWeek) {
        generatedNotifications.push({
          message: `Upcoming: ${appt.petname} appointment on ${appt.date} at ${appt.time}`,
          type: 'info',
          date: now.toISOString().split('T')[0]
        });
      }
    });

    this.notificationService.setNotifications(generatedNotifications);
  }

  loadMockHealthData() {
    this.petHealthSummaries = [
      { pet: 'Buddy', lastVisit: '2024-05-10', nextVaccine: '2024-07-01', notes: 'Healthy, next vaccine due soon.' },
      { pet: 'Milo', lastVisit: '2024-05-15', nextVaccine: '2024-08-10', notes: 'Monitor weight, next checkup in August.' }
    ];
  }

  // Common methods
  refreshDashboard() {
    if (this.isAdmin) {
      this.loadAdminDashboard();
    } else {
      this.loadClientDashboard();
    }
  }

  markNotificationAsRead(index: number) {
    this.notificationService.dismissNotification(index);
  }

  signOut() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
