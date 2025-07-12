import { Component, OnInit } from '@angular/core';
import { AdminDashboardService, AdminAppointment, AppointmentFilters, CreateAppointmentRequest, UpdateAppointmentRequest, Doctor } from '../../services/admin-dashboard.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-admin-appointments',
  templateUrl: './admin-appointments.component.html',
  styleUrls: ['./admin-appointments.component.scss']
})
export class AdminAppointmentsComponent implements OnInit {
  appointments: AdminAppointment[] = [];
  filteredAppointments: AdminAppointment[] = [];
  doctors: Doctor[] = [];
  
  // Loading states
  isLoading = false;
  isCreating = false;
  isUpdating = false;
  
  // Filters
  filters: AppointmentFilters = {};
  statusOptions = ['pending', 'confirmed', 'completed', 'cancelled'];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  
  // Current appointment for editing/deleting
  currentAppointment: AdminAppointment | null = null;
  
  // Form data
  appointmentForm: CreateAppointmentRequest = {
    date: '',
    time: '',
    petname: '',
    docname: '',
    name: '',
    email: '',
    contactNumber: '',
    appointmentType: '',
    notes: '',
    petAge: '',
    petBreed: '',
    reasonForVisit: ''
  };
  
  // Edit form data
  editForm: UpdateAppointmentRequest = {};
  
  // Search and filter form
  searchTerm = '';
  dateFrom = '';
  dateTo = '';
  selectedStatus = '';
  selectedDoctor = '';
  
  constructor(
    private adminService: AdminDashboardService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.loadDoctors();
  }

  // ============ DATA LOADING ============

  loadAppointments(): void {
    this.isLoading = true;
    this.adminService.getAllAppointments(this.filters).subscribe(
      (appointments) => {
        this.appointments = appointments;
        this.applyFilters();
        this.isLoading = false;
        console.log('Appointments loaded:', appointments.length);
      },
      (error) => {
        console.error('Error loading appointments:', error);
        this.toastr.error('Failed to load appointments', 'Error');
        this.isLoading = false;
      }
    );
  }

  loadDoctors(): void {
    this.adminService.getDoctors().subscribe(
      (doctors) => {
        this.doctors = doctors;
        console.log('Doctors loaded:', doctors.length);
      },
      (error) => {
        console.error('Error loading doctors:', error);
      }
    );
  }

  // ============ FILTERING & SEARCH ============

  applyFilters(): void {
    this.filters = {
      dateFrom: this.dateFrom || undefined,
      dateTo: this.dateTo || undefined,
      status: this.selectedStatus || undefined,
      doctor: this.selectedDoctor || undefined,
      searchTerm: this.searchTerm || undefined
    };
    
    this.filteredAppointments = this.appointments.filter(appointment => {
      // Date range filter
      if (this.dateFrom && appointment.date < this.dateFrom) return false;
      if (this.dateTo && appointment.date > this.dateTo) return false;
      
      // Status filter
      if (this.selectedStatus && appointment.status !== this.selectedStatus) return false;
      
      // Doctor filter
      if (this.selectedDoctor && !appointment.docname.toLowerCase().includes(this.selectedDoctor.toLowerCase())) return false;
      
      // Search term filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        return appointment.name.toLowerCase().includes(searchLower) ||
               appointment.petname.toLowerCase().includes(searchLower) ||
               appointment.email.toLowerCase().includes(searchLower) ||
               appointment.docname.toLowerCase().includes(searchLower);
      }
      
      return true;
    });
    
    this.totalItems = this.filteredAppointments.length;
    this.currentPage = 1; // Reset to first page
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.selectedStatus = '';
    this.selectedDoctor = '';
    this.filters = {};
    this.filteredAppointments = [...this.appointments];
    this.totalItems = this.filteredAppointments.length;
    this.currentPage = 1;
  }

  // ============ PAGINATION ============

  get paginatedAppointments(): AdminAppointment[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredAppointments.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // ============ APPOINTMENT CRUD OPERATIONS ============

  // Create appointment
  openCreateModal(): void {
    this.resetAppointmentForm();
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetAppointmentForm();
  }

  createAppointment(): void {
    if (!this.validateAppointmentForm()) {
      return;
    }

    this.isCreating = true;
    this.adminService.createAppointment(this.appointmentForm).subscribe(
      (response) => {
        if (response.success !== false) {
          this.toastr.success('Appointment created successfully', 'Success');
          this.closeCreateModal();
          this.loadAppointments();
        } else {
          this.toastr.error(response.message || 'Failed to create appointment', 'Error');
        }
        this.isCreating = false;
      },
      (error) => {
        console.error('Error creating appointment:', error);
        this.toastr.error('Failed to create appointment', 'Error');
        this.isCreating = false;
      }
    );
  }

  // Edit appointment
  openEditModal(appointment: AdminAppointment): void {
    this.currentAppointment = appointment;
    this.editForm = {
      date: appointment.date,
      time: appointment.time,
      petname: appointment.petname,
      docname: appointment.docname,
      name: appointment.name,
      email: appointment.email,
      contactNumber: appointment.contactNumber,
      appointmentType: appointment.appointmentType,
      notes: appointment.notes,
      status: appointment.status,
      petAge: appointment.petAge,
      petBreed: appointment.petBreed,
      reasonForVisit: appointment.reasonForVisit
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.currentAppointment = null;
    this.editForm = {};
  }

  updateAppointment(): void {
    if (!this.currentAppointment) return;

    this.isUpdating = true;
    this.adminService.updateAppointment(this.currentAppointment.id, this.editForm).subscribe(
      (response) => {
        if (response.success !== false) {
          this.toastr.success('Appointment updated successfully', 'Success');
          this.closeEditModal();
          this.loadAppointments();
        } else {
          this.toastr.error(response.message || 'Failed to update appointment', 'Error');
        }
        this.isUpdating = false;
      },
      (error) => {
        console.error('Error updating appointment:', error);
        this.toastr.error('Failed to update appointment', 'Error');
        this.isUpdating = false;
      }
    );
  }

  // Delete appointment
  openDeleteModal(appointment: AdminAppointment): void {
    this.currentAppointment = appointment;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.currentAppointment = null;
  }

  deleteAppointment(): void {
    if (!this.currentAppointment) return;

    this.adminService.deleteAppointment(this.currentAppointment.id).subscribe(
      (response) => {
        if (response.success !== false) {
          this.toastr.success('Appointment deleted successfully', 'Success');
          this.closeDeleteModal();
          this.loadAppointments();
        } else {
          this.toastr.error(response.message || 'Failed to delete appointment', 'Error');
        }
      },
      (error) => {
        console.error('Error deleting appointment:', error);
        this.toastr.error('Failed to delete appointment', 'Error');
      }
    );
  }

  // ============ STATUS MANAGEMENT ============

  updateAppointmentStatus(appointment: AdminAppointment, newStatus: string): void {
    this.adminService.updateAppointmentStatus(appointment.id, newStatus).subscribe(
      (response) => {
        if (response.success !== false) {
          appointment.status = newStatus as any;
          this.toastr.success(`Appointment ${newStatus} successfully`, 'Success');
        } else {
          this.toastr.error(response.message || 'Failed to update appointment status', 'Error');
        }
      },
      (error) => {
        console.error('Error updating appointment status:', error);
        this.toastr.error('Failed to update appointment status', 'Error');
      }
    );
  }

  // ============ UTILITY METHODS ============

  resetAppointmentForm(): void {
    this.appointmentForm = {
      date: '',
      time: '',
      petname: '',
      docname: '',
      name: '',
      email: '',
      contactNumber: '',
      appointmentType: '',
      notes: '',
      petAge: '',
      petBreed: '',
      reasonForVisit: ''
    };
  }

  validateAppointmentForm(): boolean {
    if (!this.appointmentForm.date || !this.appointmentForm.time || 
        !this.appointmentForm.petname || !this.appointmentForm.docname ||
        !this.appointmentForm.name || !this.appointmentForm.email) {
      this.toastr.error('Please fill in all required fields', 'Validation Error');
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.appointmentForm.email)) {
      this.toastr.error('Please enter a valid email address', 'Validation Error');
      return false;
    }
    
    return true;
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'badge bg-success';
      case 'completed':
        return 'badge bg-primary';
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'cancelled':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    
    // Handle different time formats
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    
    return timeString;
  }

  refreshAppointments(): void {
    this.loadAppointments();
  }

  exportAppointments(): void {
    // Implementation for exporting appointments to CSV/Excel
    this.toastr.info('Export functionality will be implemented soon', 'Info');
  }
} 