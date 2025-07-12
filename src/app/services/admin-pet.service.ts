import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Pet Management Interfaces
export interface Pet {
  id: number;
  name: string;
  type: string; // species
  breed: string;
  age: number;
  gender?: 'male' | 'female';
  weight?: number;
  color?: string;
  microchipId?: string;
  owner: string; // owner email
  ownerName?: string;
  ownerPhone?: string;
  ownerAddress?: string;
  dateOfBirth?: string;
  registrationDate?: string;
  isActive?: boolean;
  profileImage?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicalRecord {
  id: number;
  petId: number;
  petName?: string;
  visitDate: string;
  veterinarian: string;
  diagnosis: string;
  treatment: string;
  medications?: string;
  followUpDate?: string;
  visitType: 'routine' | 'emergency' | 'surgery' | 'consultation';
  symptoms?: string;
  temperature?: number;
  weight?: number;
  notes?: string;
  cost?: number;
  status: 'ongoing' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface VaccinationRecord {
  id: number;
  petId: number;
  petName?: string;
  vaccineName: string;
  vaccineType: string;
  administeredDate: string;
  nextDueDate?: string;
  veterinarian: string;
  batchNumber?: string;
  manufacturer?: string;
  site?: string; // injection site
  reactions?: string;
  notes?: string;
  isCore?: boolean; // core vs non-core vaccine
  status: 'completed' | 'overdue' | 'upcoming';
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicalDocument {
  id: number;
  petId: number;
  petName?: string;
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  documentType: 'medical_report' | 'xray' | 'blood_test' | 'vaccination_certificate' | 'surgery_report' | 'prescription' | 'other';
  description?: string;
  uploadDate: string;
  uploadedBy: string;
  isPublic?: boolean;
  tags?: string[];
  relatedVisitId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PetFilters {
  search?: string;
  type?: string;
  breed?: string;
  owner?: string;
  ageMin?: number;
  ageMax?: number;
  isActive?: boolean;
  registrationDateFrom?: string;
  registrationDateTo?: string;
}

export interface CreatePetRequest {
  name: string;
  type: string;
  breed: string;
  age: number;
  gender?: 'male' | 'female';
  weight?: number;
  color?: string;
  microchipId?: string;
  owner: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerAddress?: string;
  dateOfBirth?: string;
  notes?: string;
}

export interface UpdatePetRequest {
  name?: string;
  type?: string;
  breed?: string;
  age?: number;
  gender?: 'male' | 'female';
  weight?: number;
  color?: string;
  microchipId?: string;
  owner?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerAddress?: string;
  dateOfBirth?: string;
  notes?: string;
  isActive?: boolean;
}

export interface Owner {
  email: string;
  name: string;
  phone?: string;
  address?: string;
  petCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminPetService {
  private apiUrl = 'http://localhost:8000/api/admin';
  private fallbackApiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Pet Management Methods
  getAllPets(filters?: PetFilters): Observable<Pet[]> {
    const params = this.buildFilterParams(filters);
    return this.http.get<Pet[]>(`${this.apiUrl}/pets`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching pets from admin API:', error);
        return this.getFallbackPets(filters);
      })
    );
  }

  getPetById(id: number): Observable<Pet> {
    return this.http.get<Pet>(`${this.apiUrl}/pets/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching pet by ID:', error);
        return this.getFallbackPetById(id);
      })
    );
  }

  createPet(petData: CreatePetRequest): Observable<Pet> {
    return this.http.post<Pet>(`${this.apiUrl}/pets`, petData).pipe(
      catchError(error => {
        console.error('Error creating pet:', error);
        return this.createFallbackPet(petData);
      })
    );
  }

  updatePet(id: number, petData: UpdatePetRequest): Observable<Pet> {
    return this.http.put<Pet>(`${this.apiUrl}/pets/${id}`, petData).pipe(
      catchError(error => {
        console.error('Error updating pet:', error);
        return this.updateFallbackPet(id, petData);
      })
    );
  }

  deletePet(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/pets/${id}`).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error deleting pet:', error);
        return this.deleteFallbackPet(id);
      })
    );
  }

  // Owner Management Methods
  searchOwners(query: string): Observable<Owner[]> {
    return this.http.get<Owner[]>(`${this.apiUrl}/owners/search`, { params: { q: query } }).pipe(
      catchError(error => {
        console.error('Error searching owners:', error);
        return this.getFallbackOwners(query);
      })
    );
  }

  getOwnerByEmail(email: string): Observable<Owner> {
    return this.http.get<Owner>(`${this.apiUrl}/owners/${encodeURIComponent(email)}`).pipe(
      catchError(error => {
        console.error('Error fetching owner:', error);
        return this.getFallbackOwner(email);
      })
    );
  }

  getPetsByOwner(ownerEmail: string): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${this.apiUrl}/owners/${encodeURIComponent(ownerEmail)}/pets`).pipe(
      catchError(error => {
        console.error('Error fetching pets by owner:', error);
        return this.getFallbackPetsByOwner(ownerEmail);
      })
    );
  }

  // Medical Records Methods
  getMedicalRecords(petId: number): Observable<MedicalRecord[]> {
    return this.http.get<MedicalRecord[]>(`${this.apiUrl}/pets/${petId}/medical-records`).pipe(
      catchError(error => {
        console.error('Error fetching medical records:', error);
        return this.getFallbackMedicalRecords(petId);
      })
    );
  }

  createMedicalRecord(petId: number, recordData: Omit<MedicalRecord, 'id' | 'petId' | 'createdAt' | 'updatedAt'>): Observable<MedicalRecord> {
    return this.http.post<MedicalRecord>(`${this.apiUrl}/pets/${petId}/medical-records`, recordData).pipe(
      catchError(error => {
        console.error('Error creating medical record:', error);
        return this.createFallbackMedicalRecord(petId, recordData);
      })
    );
  }

  updateMedicalRecord(petId: number, recordId: number, recordData: Partial<MedicalRecord>): Observable<MedicalRecord> {
    return this.http.put<MedicalRecord>(`${this.apiUrl}/pets/${petId}/medical-records/${recordId}`, recordData).pipe(
      catchError(error => {
        console.error('Error updating medical record:', error);
        return this.updateFallbackMedicalRecord(petId, recordId, recordData);
      })
    );
  }

  deleteMedicalRecord(petId: number, recordId: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/pets/${petId}/medical-records/${recordId}`).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error deleting medical record:', error);
        return of(true);
      })
    );
  }

  // Vaccination Records Methods
  getVaccinationRecords(petId: number): Observable<VaccinationRecord[]> {
    return this.http.get<VaccinationRecord[]>(`${this.apiUrl}/pets/${petId}/vaccinations`).pipe(
      catchError(error => {
        console.error('Error fetching vaccination records:', error);
        return this.getFallbackVaccinationRecords(petId);
      })
    );
  }

  createVaccinationRecord(petId: number, recordData: Omit<VaccinationRecord, 'id' | 'petId' | 'createdAt' | 'updatedAt'>): Observable<VaccinationRecord> {
    return this.http.post<VaccinationRecord>(`${this.apiUrl}/pets/${petId}/vaccinations`, recordData).pipe(
      catchError(error => {
        console.error('Error creating vaccination record:', error);
        return this.createFallbackVaccinationRecord(petId, recordData);
      })
    );
  }

  updateVaccinationRecord(petId: number, recordId: number, recordData: Partial<VaccinationRecord>): Observable<VaccinationRecord> {
    return this.http.put<VaccinationRecord>(`${this.apiUrl}/pets/${petId}/vaccinations/${recordId}`, recordData).pipe(
      catchError(error => {
        console.error('Error updating vaccination record:', error);
        return this.updateFallbackVaccinationRecord(petId, recordId, recordData);
      })
    );
  }

  deleteVaccinationRecord(petId: number, recordId: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/pets/${petId}/vaccinations/${recordId}`).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error deleting vaccination record:', error);
        return of(true);
      })
    );
  }

  // Medical Documents Methods
  getMedicalDocuments(petId: number): Observable<MedicalDocument[]> {
    return this.http.get<MedicalDocument[]>(`${this.apiUrl}/pets/${petId}/documents`).pipe(
      catchError(error => {
        console.error('Error fetching medical documents:', error);
        return this.getFallbackMedicalDocuments(petId);
      })
    );
  }

  uploadMedicalDocument(petId: number, file: File, documentData: Partial<MedicalDocument>): Observable<MedicalDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentData.documentType || 'other');
    formData.append('description', documentData.description || '');
    
    if (documentData.tags) {
      formData.append('tags', JSON.stringify(documentData.tags));
    }
    
    if (documentData.relatedVisitId) {
      formData.append('relatedVisitId', documentData.relatedVisitId.toString());
    }

    return this.http.post<MedicalDocument>(`${this.apiUrl}/pets/${petId}/documents`, formData).pipe(
      catchError(error => {
        console.error('Error uploading medical document:', error);
        return this.uploadFallbackMedicalDocument(petId, file, documentData);
      })
    );
  }

  deleteMedicalDocument(petId: number, documentId: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/pets/${petId}/documents/${documentId}`).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error deleting medical document:', error);
        return of(true);
      })
    );
  }

  downloadMedicalDocument(petId: number, documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pets/${petId}/documents/${documentId}/download`, { responseType: 'blob' }).pipe(
      catchError(error => {
        console.error('Error downloading medical document:', error);
        return of(new Blob());
      })
    );
  }

  // Statistics Methods
  getPetStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pets/stats`).pipe(
      catchError(error => {
        console.error('Error fetching pet stats:', error);
        return this.getFallbackPetStats();
      })
    );
  }

  getVaccinationStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vaccinations/stats`).pipe(
      catchError(error => {
        console.error('Error fetching vaccination stats:', error);
        return this.getFallbackVaccinationStats();
      })
    );
  }

  // Private Helper Methods
  private buildFilterParams(filters?: PetFilters): any {
    if (!filters) return {};
    
    const params: any = {};
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value.toString();
      }
    });
    
    return params;
  }

  // Fallback Methods (for when admin API is not available)
  private getFallbackPets(filters?: PetFilters): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${this.fallbackApiUrl}/pets`).pipe(
      map(pets => this.applyClientSideFilters(pets, filters)),
      catchError(error => {
        console.error('Error fetching fallback pets:', error);
        return of([]);
      })
    );
  }

  private getFallbackPetById(id: number): Observable<Pet> {
    return this.http.get<Pet>(`${this.fallbackApiUrl}/pets/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching fallback pet by ID:', error);
        return of({
          id: id,
          name: 'Unknown Pet',
          type: 'Unknown',
          breed: 'Unknown',
          age: 0,
          owner: 'unknown@example.com'
        });
      })
    );
  }

  private createFallbackPet(petData: CreatePetRequest): Observable<Pet> {
    return this.http.post<Pet>(`${this.fallbackApiUrl}/pets`, petData).pipe(
      catchError(error => {
        console.error('Error creating fallback pet:', error);
        return of({
          id: Date.now(),
          ...petData,
          createdAt: new Date().toISOString()
        });
      })
    );
  }

  private updateFallbackPet(id: number, petData: UpdatePetRequest): Observable<Pet> {
    return this.http.put<Pet>(`${this.fallbackApiUrl}/pets/${id}`, petData).pipe(
      catchError(error => {
        console.error('Error updating fallback pet:', error);
        return of({
          id: id,
          name: petData.name || 'Unknown Pet',
          type: petData.type || 'Unknown',
          breed: petData.breed || 'Unknown',
          age: petData.age || 0,
          owner: petData.owner || 'unknown@example.com',
          updatedAt: new Date().toISOString()
        });
      })
    );
  }

  private deleteFallbackPet(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.fallbackApiUrl}/pets/${id}`).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error deleting fallback pet:', error);
        return of(true);
      })
    );
  }

  private getFallbackOwners(query: string): Observable<Owner[]> {
    // Mock data for fallback
    const mockOwners: Owner[] = [
      { email: 'john.doe@example.com', name: 'John Doe', phone: '123-456-7890', petCount: 2 },
      { email: 'jane.smith@example.com', name: 'Jane Smith', phone: '098-765-4321', petCount: 1 },
      { email: 'bob.johnson@example.com', name: 'Bob Johnson', phone: '555-123-4567', petCount: 3 }
    ];
    
    const filteredOwners = mockOwners.filter(owner => 
      owner.name.toLowerCase().includes(query.toLowerCase()) ||
      owner.email.toLowerCase().includes(query.toLowerCase())
    );
    
    return of(filteredOwners);
  }

  private getFallbackOwner(email: string): Observable<Owner> {
    return of({
      email: email,
      name: 'Unknown Owner',
      phone: 'N/A',
      petCount: 0
    });
  }

  private getFallbackPetsByOwner(ownerEmail: string): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${this.fallbackApiUrl}/pets`).pipe(
      map(pets => pets.filter(pet => pet.owner === ownerEmail)),
      catchError(error => {
        console.error('Error fetching fallback pets by owner:', error);
        return of([]);
      })
    );
  }

  private getFallbackMedicalRecords(petId: number): Observable<MedicalRecord[]> {
    // Mock data for fallback
    const mockRecords: MedicalRecord[] = [
      {
        id: 1,
        petId: petId,
        visitDate: '2024-01-15',
        veterinarian: 'Dr. Smith',
        diagnosis: 'Routine checkup',
        treatment: 'Vaccination and general examination',
        visitType: 'routine',
        status: 'completed'
      }
    ];
    
    return of(mockRecords);
  }

  private createFallbackMedicalRecord(petId: number, recordData: Omit<MedicalRecord, 'id' | 'petId' | 'createdAt' | 'updatedAt'>): Observable<MedicalRecord> {
    return of({
      id: Date.now(),
      petId: petId,
      ...recordData,
      createdAt: new Date().toISOString()
    });
  }

  private updateFallbackMedicalRecord(petId: number, recordId: number, recordData: Partial<MedicalRecord>): Observable<MedicalRecord> {
    return of({
      id: recordId,
      petId: petId,
      visitDate: recordData.visitDate || new Date().toISOString().split('T')[0],
      veterinarian: recordData.veterinarian || 'Dr. Unknown',
      diagnosis: recordData.diagnosis || 'Unknown',
      treatment: recordData.treatment || 'Unknown',
      visitType: recordData.visitType || 'routine',
      status: recordData.status || 'completed',
      updatedAt: new Date().toISOString()
    });
  }

  private getFallbackVaccinationRecords(petId: number): Observable<VaccinationRecord[]> {
    // Mock data for fallback
    const mockRecords: VaccinationRecord[] = [
      {
        id: 1,
        petId: petId,
        vaccineName: 'Rabies',
        vaccineType: 'Core',
        administeredDate: '2024-01-15',
        nextDueDate: '2025-01-15',
        veterinarian: 'Dr. Smith',
        status: 'completed',
        isCore: true
      }
    ];
    
    return of(mockRecords);
  }

  private createFallbackVaccinationRecord(petId: number, recordData: Omit<VaccinationRecord, 'id' | 'petId' | 'createdAt' | 'updatedAt'>): Observable<VaccinationRecord> {
    return of({
      id: Date.now(),
      petId: petId,
      ...recordData,
      createdAt: new Date().toISOString()
    });
  }

  private updateFallbackVaccinationRecord(petId: number, recordId: number, recordData: Partial<VaccinationRecord>): Observable<VaccinationRecord> {
    return of({
      id: recordId,
      petId: petId,
      vaccineName: recordData.vaccineName || 'Unknown Vaccine',
      vaccineType: recordData.vaccineType || 'Unknown',
      administeredDate: recordData.administeredDate || new Date().toISOString().split('T')[0],
      veterinarian: recordData.veterinarian || 'Dr. Unknown',
      status: recordData.status || 'completed',
      updatedAt: new Date().toISOString()
    });
  }

  private getFallbackMedicalDocuments(petId: number): Observable<MedicalDocument[]> {
    // Mock data for fallback
    const mockDocuments: MedicalDocument[] = [
      {
        id: 1,
        petId: petId,
        fileName: 'medical_report_001.pdf',
        originalFileName: 'Medical Report - January 2024.pdf',
        fileType: 'application/pdf',
        fileSize: 1024000,
        filePath: '/uploads/medical/medical_report_001.pdf',
        documentType: 'medical_report',
        description: 'Routine checkup report',
        uploadDate: '2024-01-15',
        uploadedBy: 'admin@example.com'
      }
    ];
    
    return of(mockDocuments);
  }

  private uploadFallbackMedicalDocument(petId: number, file: File, documentData: Partial<MedicalDocument>): Observable<MedicalDocument> {
    return of({
      id: Date.now(),
      petId: petId,
      fileName: `doc_${Date.now()}_${file.name}`,
      originalFileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      filePath: `/uploads/medical/doc_${Date.now()}_${file.name}`,
      documentType: documentData.documentType || 'other',
      description: documentData.description || '',
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'admin@example.com',
      createdAt: new Date().toISOString()
    });
  }

  private getFallbackPetStats(): Observable<any> {
    return of({
      totalPets: 50,
      activePets: 45,
      inactivePets: 5,
      petsByType: {
        'Dog': 30,
        'Cat': 15,
        'Bird': 3,
        'Other': 2
      },
      recentRegistrations: 8
    });
  }

  private getFallbackVaccinationStats(): Observable<any> {
    return of({
      totalVaccinations: 120,
      upcomingVaccinations: 15,
      overdueVaccinations: 5,
      vaccinationsByType: {
        'Rabies': 45,
        'DHPP': 30,
        'Bordetella': 25,
        'Other': 20
      }
    });
  }

  private applyClientSideFilters(pets: Pet[], filters?: PetFilters): Pet[] {
    if (!filters) return pets;
    
    return pets.filter(pet => {
      if (filters.search && !pet.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !pet.type.toLowerCase().includes(filters.search.toLowerCase()) &&
          !pet.breed.toLowerCase().includes(filters.search.toLowerCase()) &&
          !pet.owner.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      if (filters.type && pet.type !== filters.type) return false;
      if (filters.breed && pet.breed !== filters.breed) return false;
      if (filters.owner && pet.owner !== filters.owner) return false;
      if (filters.ageMin && pet.age < filters.ageMin) return false;
      if (filters.ageMax && pet.age > filters.ageMax) return false;
      if (filters.isActive !== undefined && pet.isActive !== filters.isActive) return false;
      
      return true;
    });
  }
} 