import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminClientService, Client, ContactInfo, Pet, VisitHistory, UpdateClientRequest } from '../../services/admin-client.service';
declare var bootstrap: any;

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent implements OnInit {
  client: Client | null = null;
  contactInfo: ContactInfo[] = [];
  clientPets: Pet[] = [];
  visitHistory: VisitHistory[] = [];
  
  // Loading states
  isLoading = false;
  isUpdating = false;
  isLoadingContacts = false;
  isLoadingPets = false;
  isLoadingVisits = false;
  
  // Tab management
  activeTab = 'overview';
  
  // Modal states
  showEditModal = false;
  showDeleteModal = false;
  showContactModal = false;
  showPetLinkModal = false;
  
  // Form data
  editForm: UpdateClientRequest = {};
  
  // Contact form
  contactForm: Partial<ContactInfo> = {
    type: 'primary',
    contactMethod: 'email',
    value: '',
    label: '',
    isPrimary: false,
    isActive: true
  };
  
  // Statistics
  clientStats = {
    totalVisits: 0,
    totalPets: 0,
    lastVisitDate: '',
    registrationDate: '',
    activeStatus: true,
    totalSpent: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminClientService: AdminClientService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const clientId = +params['id'];
      if (clientId) {
        this.loadClientDetails(clientId);
        this.loadClientContactInfo(clientId);
        this.loadClientPets(clientId);
        this.loadClientVisitHistory(clientId);
      }
    });
  }

  // ===== DATA LOADING =====

  loadClientDetails(clientId: number): void {
    this.isLoading = true;
    this.adminClientService.getClientById(clientId).subscribe({
      next: (client) => {
        this.client = client;
        this.updateClientStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading client details:', error);
        this.isLoading = false;
      }
    });
  }

  loadClientContactInfo(clientId: number): void {
    this.isLoadingContacts = true;
    this.adminClientService.getClientContactInfo(clientId).subscribe({
      next: (contacts) => {
        this.contactInfo = contacts;
        this.isLoadingContacts = false;
      },
      error: (error) => {
        console.error('Error loading contact info:', error);
        this.isLoadingContacts = false;
      }
    });
  }

  loadClientPets(clientId: number): void {
    this.isLoadingPets = true;
    this.adminClientService.getClientPets(clientId).subscribe({
      next: (pets) => {
        this.clientPets = pets;
        this.isLoadingPets = false;
      },
      error: (error) => {
        console.error('Error loading client pets:', error);
        this.isLoadingPets = false;
      }
    });
  }

  loadClientVisitHistory(clientId: number): void {
    this.isLoadingVisits = true;
    this.adminClientService.getClientVisitHistory(clientId).subscribe({
      next: (visits) => {
        this.visitHistory = visits;
        this.isLoadingVisits = false;
      },
      error: (error) => {
        console.error('Error loading visit history:', error);
        this.isLoadingVisits = false;
      }
    });
  }

  // ===== STATISTICS =====

  updateClientStats(): void {
    if (!this.client) return;
    
    this.clientStats = {
      totalVisits: this.client.totalVisits || 0,
      totalPets: this.client.totalPets || 0,
      lastVisitDate: this.client.lastVisit || '',
      registrationDate: this.client.registrationDate || '',
      activeStatus: this.client.isActive || false,
      totalSpent: this.visitHistory.reduce((sum, visit) => sum + (visit.cost || 0), 0)
    };
  }

  // ===== TAB MANAGEMENT =====

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  isTabActive(tab: string): boolean {
    return this.activeTab === tab;
  }

  // ===== CLIENT MANAGEMENT =====

  openEditModal(): void {
    if (!this.client) return;
    this.editForm = { ...this.client };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editForm = {};
  }

  updateClient(): void {
    if (!this.client || !this.isValidEditForm()) return;

    this.isUpdating = true;
    this.adminClientService.updateClient(this.client.id, this.editForm).subscribe({
      next: (updatedClient) => {
        console.log('Client updated successfully:', updatedClient);
        this.client = updatedClient;
        this.updateClientStats();
        this.closeEditModal();
        this.isUpdating = false;
      },
      error: (error) => {
        console.error('Error updating client:', error);
        this.isUpdating = false;
      }
    });
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  deleteClient(): void {
    if (!this.client) return;

    this.adminClientService.deleteClient(this.client.id).subscribe({
      next: (response) => {
        console.log('Client deleted successfully:', response);
        this.router.navigate(['/admin/clients']);
      },
      error: (error) => {
        console.error('Error deleting client:', error);
      }
    });
  }

  // ===== CONTACT MANAGEMENT =====

  openContactModal(): void {
    this.resetContactForm();
    this.showContactModal = true;
  }

  closeContactModal(): void {
    this.showContactModal = false;
    this.resetContactForm();
  }

  addContactInfo(): void {
    if (!this.client || !this.isValidContactForm()) return;

    this.adminClientService.addClientContactInfo(this.client.id, this.contactForm).subscribe({
      next: (newContact) => {
        console.log('Contact info added successfully:', newContact);
        this.contactInfo.push(newContact);
        this.closeContactModal();
      },
      error: (error) => {
        console.error('Error adding contact info:', error);
      }
    });
  }

  deleteContactInfo(contactId: number): void {
    if (!this.client) return;

    this.adminClientService.deleteClientContactInfo(this.client.id, contactId).subscribe({
      next: (response) => {
        console.log('Contact info deleted successfully:', response);
        this.contactInfo = this.contactInfo.filter(c => c.id !== contactId);
      },
      error: (error) => {
        console.error('Error deleting contact info:', error);
      }
    });
  }

  // ===== PET MANAGEMENT =====

  unlinkPet(petId: number): void {
    if (!this.client) return;

    this.adminClientService.unlinkPetFromClient(this.client.id, petId).subscribe({
      next: (response) => {
        console.log('Pet unlinked successfully:', response);
        this.clientPets = this.clientPets.filter(p => p.id !== petId);
        this.updateClientStats();
      },
      error: (error) => {
        console.error('Error unlinking pet:', error);
      }
    });
  }

  viewPetDetails(petId: number): void {
    this.router.navigate(['/admin/pets/details', petId]);
  }

  // ===== NAVIGATION =====

  goBack(): void {
    this.router.navigate(['/admin/clients']);
  }

  managePets(): void {
    if (!this.client) return;
    this.router.navigate(['/admin/clients/pets', this.client.id]);
  }

  scheduleAppointment(): void {
    if (!this.client) return;
    this.router.navigate(['/admin/appointments/add'], { 
      queryParams: { clientId: this.client.id } 
    });
  }

  // ===== FORM VALIDATION =====

  isValidEditForm(): boolean {
    return !!(
      this.editForm.name &&
      this.editForm.email &&
      this.editForm.phone
    );
  }

  isValidContactForm(): boolean {
    return !!(
      this.contactForm.type &&
      this.contactForm.contactMethod &&
      this.contactForm.value
    );
  }

  resetContactForm(): void {
    this.contactForm = {
      type: 'primary',
      contactMethod: 'email',
      value: '',
      label: '',
      isPrimary: false,
      isActive: true
    };
  }

  // ===== UTILITY METHODS =====

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  formatPhone(phone: string | undefined): string {
    if (!phone) return 'N/A';
    return phone;
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '$0.00';
    return `$${amount.toFixed(2)}`;
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
      case 'address': return 'bi-geo-alt';
      default: return 'bi-question-circle';
    }
  }

  getContactTypeColor(type: string | undefined): string {
    switch (type) {
      case 'primary': return 'text-primary';
      case 'secondary': return 'text-info';
      case 'emergency': return 'text-danger';
      default: return 'text-secondary';
    }
  }

  getPetTypeIcon(type: string | undefined): string {
    switch (type?.toLowerCase()) {
      case 'dog': return 'bi-heart';
      case 'cat': return 'bi-heart-fill';
      case 'bird': return 'bi-egg';
      case 'rabbit': return 'bi-heart-pulse';
      case 'fish': return 'bi-droplet';
      default: return 'bi-heart';
    }
  }

  getVisitStatusColor(status: string | undefined): string {
    switch (status) {
      case 'completed': return 'text-success';
      case 'scheduled': return 'text-info';
      case 'cancelled': return 'text-danger';
      default: return 'text-secondary';
    }
  }

  getVisitStatusIcon(status: string | undefined): string {
    switch (status) {
      case 'completed': return 'bi-check-circle';
      case 'scheduled': return 'bi-clock';
      case 'cancelled': return 'bi-x-circle';
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

  getRecentVisits(): VisitHistory[] {
    return this.visitHistory
      .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
      .slice(0, 5);
  }

  getUpcomingVisits(): VisitHistory[] {
    const today = new Date();
    return this.visitHistory
      .filter(visit => new Date(visit.visitDate) > today && visit.status === 'scheduled')
      .sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime())
      .slice(0, 3);
  }
} 