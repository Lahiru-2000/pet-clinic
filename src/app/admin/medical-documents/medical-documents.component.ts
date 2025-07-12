import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminPetService, Pet, MedicalDocument } from '../../services/admin-pet.service';
declare var bootstrap: any;

@Component({
  selector: 'app-medical-documents',
  templateUrl: './medical-documents.component.html',
  styleUrls: ['./medical-documents.component.scss']
})
export class MedicalDocumentsComponent implements OnInit {
  pet: Pet | null = null;
  documents: MedicalDocument[] = [];
  filteredDocuments: MedicalDocument[] = [];
  
  // Loading states
  isLoading = false;
  isUploading = false;
  
  // Upload form
  uploadForm = {
    file: null as File | null,
    documentType: 'medical_report' as string,
    description: '',
    tags: [] as string[],
    relatedVisitId: null as number | null
  };
  
  // Document types
  documentTypes = [
    { value: 'medical_report', label: 'Medical Report', icon: 'bi-file-medical' },
    { value: 'xray', label: 'X-Ray', icon: 'bi-image' },
    { value: 'blood_test', label: 'Blood Test', icon: 'bi-droplet' },
    { value: 'vaccination_certificate', label: 'Vaccination Certificate', icon: 'bi-shield-check' },
    { value: 'surgery_report', label: 'Surgery Report', icon: 'bi-scissors' },
    { value: 'prescription', label: 'Prescription', icon: 'bi-prescription2' },
    { value: 'other', label: 'Other', icon: 'bi-file-earmark' }
  ];
  
  // Filters
  selectedDocumentType = '';
  searchTerm = '';
  
  // Modal states
  showUploadModal = false;
  showDeleteModal = false;
  showPreviewModal = false;
  
  // Current document for actions
  currentDocument: MedicalDocument | null = null;
  
  // Drag and drop
  isDragOver = false;
  
  // File validation
  allowedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  maxFileSize = 10 * 1024 * 1024; // 10MB
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminPetService: AdminPetService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const petId = +params['id'];
      if (petId) {
        this.loadPetAndDocuments(petId);
      }
    });
  }

  // Data Loading Methods
  loadPetAndDocuments(petId: number) {
    this.isLoading = true;
    
    // Load pet details
    this.adminPetService.getPetById(petId).subscribe(
      (pet) => {
        this.pet = pet;
        this.loadDocuments(petId);
      },
      (error) => {
        console.error('Error loading pet:', error);
        this.router.navigate(['/admin/pets']);
      }
    );
  }

  loadDocuments(petId: number) {
    this.adminPetService.getMedicalDocuments(petId).subscribe(
      (documents) => {
        this.documents = documents;
        this.applyFilters();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading documents:', error);
        this.isLoading = false;
      }
    );
  }

  // Filtering Methods
  applyFilters() {
    this.filteredDocuments = this.documents.filter(doc => {
      const matchesType = !this.selectedDocumentType || doc.documentType === this.selectedDocumentType;
      const matchesSearch = !this.searchTerm || 
        doc.originalFileName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doc.documentType.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesType && matchesSearch;
    });
  }

  clearFilters() {
    this.selectedDocumentType = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  // Upload Methods
  openUploadModal() {
    this.resetUploadForm();
    this.showUploadModal = true;
    
    setTimeout(() => {
      const modalElement = document.getElementById('uploadModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    }, 100);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.validateAndSetFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validateAndSetFile(files[0]);
    }
  }

  validateAndSetFile(file: File) {
    // Validate file type
    if (!this.allowedFileTypes.includes(file.type)) {
      alert('Invalid file type. Please upload PDF, image, or document files only.');
      return;
    }
    
    // Validate file size
    if (file.size > this.maxFileSize) {
      alert('File size exceeds 10MB limit. Please choose a smaller file.');
      return;
    }
    
    this.uploadForm.file = file;
  }

  removeFile() {
    this.uploadForm.file = null;
  }

  uploadDocument() {
    if (!this.pet || !this.uploadForm.file) return;
    
    this.isUploading = true;
    
    const documentData = {
      documentType: this.uploadForm.documentType as any,
      description: this.uploadForm.description,
      tags: this.uploadForm.tags,
      relatedVisitId: this.uploadForm.relatedVisitId || undefined
    };
    
    this.adminPetService.uploadMedicalDocument(this.pet.id, this.uploadForm.file, documentData).subscribe(
      (doc) => {
        console.log('Document uploaded successfully:', doc);
        this.loadDocuments(this.pet!.id);
        this.closeUploadModal();
        this.isUploading = false;
      },
      (error) => {
        console.error('Error uploading document:', error);
        this.isUploading = false;
      }
    );
  }

  closeUploadModal() {
    this.showUploadModal = false;
    const modalElement = document.getElementById('uploadModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
    this.resetUploadForm();
  }

  resetUploadForm() {
    this.uploadForm = {
      file: null,
      documentType: 'medical_report',
      description: '',
      tags: [],
      relatedVisitId: null
    };
  }

  // Document Actions
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

  previewDocument(doc: MedicalDocument) {
    this.currentDocument = doc;
    this.showPreviewModal = true;
    
    setTimeout(() => {
      const modalElement = window.document.getElementById('previewModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    }, 100);
  }

  closePreviewModal() {
    this.showPreviewModal = false;
    const modalElement = document.getElementById('previewModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
    this.currentDocument = null;
  }

  openDeleteModal(doc: MedicalDocument) {
    this.currentDocument = doc;
    this.showDeleteModal = true;
    
    setTimeout(() => {
      const modalElement = window.document.getElementById('deleteModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    }, 100);
  }

  deleteDocument() {
    if (!this.pet || !this.currentDocument) return;
    
    this.adminPetService.deleteMedicalDocument(this.pet.id, this.currentDocument.id).subscribe(
      () => {
        console.log('Document deleted successfully');
        this.loadDocuments(this.pet!.id);
        this.closeDeleteModal();
      },
      (error) => {
        console.error('Error deleting document:', error);
      }
    );
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    const modalElement = document.getElementById('deleteModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
    this.currentDocument = null;
  }

  // Navigation Methods
  goBack() {
    this.router.navigate(['/admin/pets/details', this.pet!.id]);
  }

  goToPetList() {
    this.router.navigate(['/admin/pets']);
  }

  // Utility Methods
  getDocumentTypeInfo(type: string) {
    return this.documentTypes.find(dt => dt.value === type) || this.documentTypes[this.documentTypes.length - 1];
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  isImageFile(fileType: string): boolean {
    return fileType.startsWith('image/');
  }

  isPdfFile(fileType: string): boolean {
    return fileType === 'application/pdf';
  }

  getFileIcon(fileType: string): string {
    if (this.isImageFile(fileType)) return 'bi-image';
    if (this.isPdfFile(fileType)) return 'bi-file-pdf';
    if (fileType.includes('word')) return 'bi-file-word';
    return 'bi-file-earmark';
  }

  // Tags Management
  addTag(tag: string) {
    if (tag.trim() && !this.uploadForm.tags.includes(tag.trim())) {
      this.uploadForm.tags.push(tag.trim());
    }
  }

  removeTag(tag: string) {
    const index = this.uploadForm.tags.indexOf(tag);
    if (index > -1) {
      this.uploadForm.tags.splice(index, 1);
    }
  }

  onTagKeyDown(event: KeyboardEvent, input: HTMLInputElement) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addTag(input.value);
      input.value = '';
    }
  }
} 