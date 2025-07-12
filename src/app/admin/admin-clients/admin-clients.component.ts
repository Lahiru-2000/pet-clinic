import { Component, OnInit } from '@angular/core';
import { AdminClientService, Client, ClientFilters, CreateClientRequest, UpdateClientRequest } from '../../services/admin-client.service';
import { Router } from '@angular/router';
declare var bootstrap: any;

@Component({
  selector: 'app-admin-clients',
  templateUrl: './admin-clients.component.html',
  styleUrls: ['./admin-clients.component.scss']
})
export class AdminClientsComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  cities: string[] = [];
  states: string[] = [];
  
  // Loading states
  isLoading = false;
  isCreating = false;
  isUpdating = false;
  isExporting = false;
  
  // Filters
  filters: ClientFilters = {};
  contactMethods = ['email', 'phone', 'sms'];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalItems = 0;
  
  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showDetailsModal = false;
  
  // Current client for editing/deleting/viewing
  currentClient: Client | null = null;
  
  // Form data
  clientForm: CreateClientRequest = {
    name: '',
    email: '',
    phone: '',
    contactNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
    preferredContactMethod: 'email',
    emailNotifications: true,
    smsNotifications: false
  };
  
  // Edit form data
  editForm: UpdateClientRequest = {};
  
  // Search and filter form
  searchTerm = '';
  selectedCity = '';
  selectedState = '';
  selectedStatus: boolean | null = null;
  selectedContactMethod = '';
  registrationDateFrom = '';
  registrationDateTo = '';
  lastVisitFrom = '';
  lastVisitTo = '';
  hasPets: boolean | null = null;
  minVisits: number | null = null;
  maxVisits: number | null = null;

  constructor(
    private adminClientService: AdminClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadCities();
    this.loadStates();
  }

  // ===== DATA LOADING =====

  loadClients(): void {
    this.isLoading = true;
    this.adminClientService.getClients(this.filters, this.currentPage, this.itemsPerPage)
      .subscribe({
        next: (response) => {
          this.clients = response.clients;
          this.filteredClients = [...this.clients];
          this.totalItems = response.total;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading clients:', error);
          this.isLoading = false;
        }
      });
  }

  loadCities(): void {
    this.adminClientService.getCities().subscribe({
      next: (cities) => {
        this.cities = cities;
      },
      error: (error) => {
        console.error('Error loading cities:', error);
      }
    });
  }

  loadStates(): void {
    this.adminClientService.getStates().subscribe({
      next: (states) => {
        this.states = states;
      },
      error: (error) => {
        console.error('Error loading states:', error);
      }
    });
  }

  // ===== FILTERING AND SEARCH =====

  applyFilters(): void {
    this.filters = {
      searchTerm: this.searchTerm || undefined,
      status: this.selectedStatus !== null ? this.selectedStatus : undefined,
      city: this.selectedCity || undefined,
      state: this.selectedState || undefined,
      registrationDateFrom: this.registrationDateFrom || undefined,
      registrationDateTo: this.registrationDateTo || undefined,
      lastVisitFrom: this.lastVisitFrom || undefined,
      lastVisitTo: this.lastVisitTo || undefined,
      hasPets: this.hasPets !== null ? this.hasPets : undefined,
      minVisits: this.minVisits || undefined,
      maxVisits: this.maxVisits || undefined,
      contactMethod: this.selectedContactMethod || undefined
    };
    
    this.currentPage = 1;
    this.loadClients();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCity = '';
    this.selectedState = '';
    this.selectedStatus = null;
    this.selectedContactMethod = '';
    this.registrationDateFrom = '';
    this.registrationDateTo = '';
    this.lastVisitFrom = '';
    this.lastVisitTo = '';
    this.hasPets = null;
    this.minVisits = null;
    this.maxVisits = null;
    this.filters = {};
    this.currentPage = 1;
    this.loadClients();
  }

  onSearchChange(): void {
    if (this.searchTerm.length >= 3 || this.searchTerm.length === 0) {
      this.applyFilters();
    }
  }

  // ===== PAGINATION =====

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadClients();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get paginationPages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const halfRange = Math.floor(maxPagesToShow / 2);
    
    let startPage = Math.max(1, this.currentPage - halfRange);
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // ===== CLIENT MANAGEMENT =====

  openCreateModal(): void {
    this.resetClientForm();
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetClientForm();
  }

  openEditModal(client: Client): void {
    this.currentClient = client;
    this.editForm = { ...client };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.currentClient = null;
    this.editForm = {};
  }

  openDeleteModal(client: Client): void {
    this.currentClient = client;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.currentClient = null;
  }

  openDetailsModal(client: Client): void {
    this.currentClient = client;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.currentClient = null;
  }

  // ===== FORM OPERATIONS =====

  createClient(): void {
    if (!this.isValidClientForm()) {
      return;
    }

    this.isCreating = true;
    this.adminClientService.createClient(this.clientForm).subscribe({
      next: (newClient) => {
        console.log('Client created successfully:', newClient);
        this.loadClients();
        this.closeCreateModal();
        this.isCreating = false;
      },
      error: (error) => {
        console.error('Error creating client:', error);
        this.isCreating = false;
      }
    });
  }

  updateClient(): void {
    if (!this.currentClient || !this.isValidEditForm()) {
      return;
    }

    this.isUpdating = true;
    this.adminClientService.updateClient(this.currentClient.id, this.editForm).subscribe({
      next: (updatedClient) => {
        console.log('Client updated successfully:', updatedClient);
        this.loadClients();
        this.closeEditModal();
        this.isUpdating = false;
      },
      error: (error) => {
        console.error('Error updating client:', error);
        this.isUpdating = false;
      }
    });
  }

  deleteClient(): void {
    if (!this.currentClient) {
      return;
    }

    this.adminClientService.deleteClient(this.currentClient.id).subscribe({
      next: (response) => {
        console.log('Client deleted successfully:', response);
        this.loadClients();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Error deleting client:', error);
      }
    });
  }

  // ===== FORM VALIDATION =====

  isValidClientForm(): boolean {
    return !!(
      this.clientForm.name &&
      this.clientForm.email &&
      this.clientForm.phone
    );
  }

  isValidEditForm(): boolean {
    return !!(
      this.editForm.name &&
      this.editForm.email &&
      this.editForm.phone
    );
  }

  resetClientForm(): void {
    this.clientForm = {
      name: '',
      email: '',
      phone: '',
      contactNumber: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      dateOfBirth: '',
      emergencyContact: '',
      emergencyPhone: '',
      notes: '',
      preferredContactMethod: 'email',
      emailNotifications: true,
      smsNotifications: false
    };
  }

  // ===== NAVIGATION =====

  viewClientDetails(client: Client): void {
    this.router.navigate(['/admin/clients/details', client.id]);
  }

  manageClientPets(client: Client): void {
    this.router.navigate(['/admin/clients/pets', client.id]);
  }

  viewClientVisitHistory(client: Client): void {
    this.router.navigate(['/admin/clients/visit-history', client.id]);
  }

  // ===== EXPORT =====

  exportClients(): void {
    this.isExporting = true;
    this.adminClientService.exportClientsToCSV(this.filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isExporting = false;
      },
      error: (error) => {
        console.error('Error exporting clients:', error);
        this.isExporting = false;
      }
    });
  }

  // ===== UTILITY METHODS =====

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  formatPhone(phone: string | undefined): string {
    if (!phone) return 'N/A';
    return phone;
  }

  getStatusBadgeClass(isActive: boolean | undefined): string {
    return isActive ? 'badge bg-success' : 'badge bg-secondary';
  }

  getStatusText(isActive: boolean | undefined): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getContactMethodIcon(method: string | undefined): string {
    switch (method) {
      case 'email': return 'bi-envelope';
      case 'phone': return 'bi-telephone';
      case 'sms': return 'bi-chat-text';
      default: return 'bi-question-circle';
    }
  }

  getTotalPetsText(totalPets: number | undefined): string {
    if (!totalPets || totalPets === 0) return 'No pets';
    return totalPets === 1 ? '1 pet' : `${totalPets} pets`;
  }

  getTotalVisitsText(totalVisits: number | undefined): string {
    if (!totalVisits || totalVisits === 0) return 'No visits';
    return totalVisits === 1 ? '1 visit' : `${totalVisits} visits`;
  }
} 