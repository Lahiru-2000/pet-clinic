import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminPetService, Pet, MedicalRecord, VaccinationRecord, MedicalDocument } from '../../services/admin-pet.service';
declare var bootstrap: any;

@Component({
  selector: 'app-pet-details',
  templateUrl: './pet-details.component.html',
  styleUrls: ['./pet-details.component.scss']
})
export class PetDetailsComponent implements OnInit {
  pet: Pet | null = null;
  medicalRecords: MedicalRecord[] = [];
  vaccinationRecords: VaccinationRecord[] = [];
  medicalDocuments: MedicalDocument[] = [];
  
  // Loading states
  isLoading = false;
  isLoadingMedical = false;
  isLoadingVaccinations = false;
  isLoadingDocuments = false;
  
  // Active tab
  activeTab = 'overview';
  
  // Modal states
  showEditModal = false;
  showDeleteModal = false;
  
  // Edit form
  editForm: Partial<Pet> = {};
  isUpdating = false;
  
  // Stats
  stats = {
    totalVisits: 0,
    lastVisit: null as string | null,
    nextVaccination: null as string | null,
    upcomingVaccinations: 0,
    overdueVaccinations: 0,
    totalDocuments: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminPetService: AdminPetService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const petId = +params['id'];
      if (petId) {
        this.loadPetDetails(petId);
      }
    });
  }

  // Data Loading Methods
  loadPetDetails(petId: number) {
    this.isLoading = true;
    this.adminPetService.getPetById(petId).subscribe(
      (pet) => {
        this.pet = pet;
        this.loadAllPetData(petId);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading pet details:', error);
        this.isLoading = false;
        this.router.navigate(['/admin/pets']);
      }
    );
  }

  loadAllPetData(petId: number) {
    // Load medical records
    this.loadMedicalRecords(petId);
    // Load vaccination records
    this.loadVaccinationRecords(petId);
    // Load medical documents
    this.loadMedicalDocuments(petId);
  }

  loadMedicalRecords(petId: number) {
    this.isLoadingMedical = true;
    this.adminPetService.getMedicalRecords(petId).subscribe(
      (records) => {
        this.medicalRecords = records;
        this.updateStats();
        this.isLoadingMedical = false;
      },
      (error) => {
        console.error('Error loading medical records:', error);
        this.isLoadingMedical = false;
      }
    );
  }

  loadVaccinationRecords(petId: number) {
    this.isLoadingVaccinations = true;
    this.adminPetService.getVaccinationRecords(petId).subscribe(
      (records) => {
        this.vaccinationRecords = records;
        this.updateStats();
        this.isLoadingVaccinations = false;
      },
      (error) => {
        console.error('Error loading vaccination records:', error);
        this.isLoadingVaccinations = false;
      }
    );
  }

  loadMedicalDocuments(petId: number) {
    this.isLoadingDocuments = true;
    this.adminPetService.getMedicalDocuments(petId).subscribe(
      (documents) => {
        this.medicalDocuments = documents;
        this.updateStats();
        this.isLoadingDocuments = false;
      },
      (error) => {
        console.error('Error loading medical documents:', error);
        this.isLoadingDocuments = false;
      }
    );
  }

  // Stats Calculation
  updateStats() {
    this.stats.totalVisits = this.medicalRecords.length;
    this.stats.totalDocuments = this.medicalDocuments.length;
    
    // Find last visit
    const sortedRecords = [...this.medicalRecords].sort((a, b) => 
      new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
    );
    this.stats.lastVisit = sortedRecords.length > 0 ? sortedRecords[0].visitDate : null;
    
    // Calculate vaccination stats
    const today = new Date();
    const upcomingVaccinations = this.vaccinationRecords.filter(v => {
      if (!v.nextDueDate) return false;
      const dueDate = new Date(v.nextDueDate);
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return daysDiff > 0 && daysDiff <= 30; // Due within 30 days
    });
    
    const overdueVaccinations = this.vaccinationRecords.filter(v => {
      if (!v.nextDueDate) return false;
      const dueDate = new Date(v.nextDueDate);
      return dueDate < today;
    });
    
    this.stats.upcomingVaccinations = upcomingVaccinations.length;
    this.stats.overdueVaccinations = overdueVaccinations.length;
    
    // Find next vaccination
    const nextVaccination = upcomingVaccinations.sort((a, b) => 
      new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime()
    )[0];
    this.stats.nextVaccination = nextVaccination ? nextVaccination.nextDueDate! : null;
  }

  // Tab Management
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  // Navigation Methods
  goBack() {
    this.router.navigate(['/admin/pets']);
  }

  viewMedicalHistory() {
    this.router.navigate(['/admin/pets/medical-history', this.pet!.id]);
  }

  viewVaccinationRecords() {
    this.router.navigate(['/admin/pets/vaccinations', this.pet!.id]);
  }

  viewMedicalDocuments() {
    this.router.navigate(['/admin/pets/documents', this.pet!.id]);
  }

  // Edit Pet Methods
  openEditModal() {
    if (!this.pet) return;
    
    this.editForm = { ...this.pet };
    this.showEditModal = true;
    
    setTimeout(() => {
      const modalElement = document.getElementById('editPetModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    }, 100);
  }

  updatePet() {
    if (!this.pet || !this.isValidEditForm()) return;
    
    this.isUpdating = true;
    this.adminPetService.updatePet(this.pet.id, this.editForm).subscribe(
      (updatedPet) => {
        this.pet = updatedPet;
        this.closeEditModal();
        this.isUpdating = false;
        console.log('Pet updated successfully');
      },
      (error) => {
        console.error('Error updating pet:', error);
        this.isUpdating = false;
      }
    );
  }

  closeEditModal() {
    this.showEditModal = false;
    const modalElement = document.getElementById('editPetModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
    this.editForm = {};
  }

  // Delete Pet Methods
  openDeleteModal() {
    this.showDeleteModal = true;
    
    setTimeout(() => {
      const modalElement = document.getElementById('deletePetModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    }, 100);
  }

  deletePet() {
    if (!this.pet) return;
    
    this.adminPetService.deletePet(this.pet.id).subscribe(
      () => {
        console.log('Pet deleted successfully');
        this.router.navigate(['/admin/pets']);
      },
      (error) => {
        console.error('Error deleting pet:', error);
      }
    );
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    const modalElement = document.getElementById('deletePetModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }

  // Utility Methods
  isValidEditForm(): boolean {
    return !!(this.editForm.name && this.editForm.type && this.editForm.breed && 
              this.editForm.age && this.editForm.age > 0 && this.editForm.owner);
  }

  getStatusBadgeClass(pet: Pet): string {
    return pet.isActive ? 'badge bg-success' : 'badge bg-secondary';
  }

  getStatusText(pet: Pet): string {
    return pet.isActive ? 'Active' : 'Inactive';
  }

  getAgeText(age: number): string {
    if (age === 1) return '1 year';
    if (age < 1) return `${Math.round(age * 12)} months`;
    return `${age} years`;
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }

  getVaccinationStatusClass(record: VaccinationRecord): string {
    switch (record.status) {
      case 'completed': return 'badge bg-success';
      case 'overdue': return 'badge bg-danger';
      case 'upcoming': return 'badge bg-warning';
      default: return 'badge bg-secondary';
    }
  }

  getMedicalRecordStatusClass(record: MedicalRecord): string {
    switch (record.status) {
      case 'completed': return 'badge bg-success';
      case 'ongoing': return 'badge bg-primary';
      case 'cancelled': return 'badge bg-secondary';
      default: return 'badge bg-secondary';
    }
  }

  getVisitTypeClass(visitType: string): string {
    switch (visitType) {
      case 'routine': return 'badge bg-info';
      case 'emergency': return 'badge bg-danger';
      case 'surgery': return 'badge bg-warning';
      case 'consultation': return 'badge bg-primary';
      default: return 'badge bg-secondary';
    }
  }

  getDocumentTypeIcon(documentType: string): string {
    switch (documentType) {
      case 'medical_report': return 'bi-file-medical';
      case 'xray': return 'bi-image';
      case 'blood_test': return 'bi-droplet';
      case 'vaccination_certificate': return 'bi-shield-check';
      case 'surgery_report': return 'bi-scissors';
      case 'prescription': return 'bi-prescription2';
      default: return 'bi-file-earmark';
    }
  }

  downloadDocument(doc: MedicalDocument) {
    if (!this.pet) return;
    
    this.adminPetService.downloadMedicalDocument(this.pet.id, doc.id).subscribe(
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = doc.originalFileName;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
      },
      (error) => {
        console.error('Error downloading document:', error);
      }
    );
  }

  // Quick Actions
  addMedicalRecord() {
    this.router.navigate(['/admin/pets/medical-history', this.pet!.id, 'add']);
  }

  addVaccinationRecord() {
    this.router.navigate(['/admin/pets/vaccinations', this.pet!.id, 'add']);
  }

  uploadDocument() {
    this.router.navigate(['/admin/pets/documents', this.pet!.id, 'upload']);
  }
} 