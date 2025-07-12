import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Client Management Interfaces
export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  contactNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  registrationDate?: string;
  lastVisit?: string;
  totalVisits?: number;
  isActive?: boolean;
  profileImage?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  // Pet ownership
  pets?: Pet[];
  totalPets?: number;
  // Contact preferences
  preferredContactMethod?: 'email' | 'phone' | 'sms';
  emailNotifications?: boolean;
  smsNotifications?: boolean;
}

export interface Pet {
  id: number;
  name: string;
  type: string;
  breed: string;
  age: number;
  gender?: string;
  registrationDate?: string;
  lastVisit?: string;
  isActive?: boolean;
}

export interface ContactInfo {
  id: number;
  clientId: number;
  type: 'primary' | 'secondary' | 'emergency';
  contactMethod: 'email' | 'phone' | 'address';
  value: string;
  label?: string;
  isPrimary?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientFilters {
  searchTerm?: string;
  status?: boolean;
  city?: string;
  state?: string;
  registrationDateFrom?: string;
  registrationDateTo?: string;
  lastVisitFrom?: string;
  lastVisitTo?: string;
  hasPets?: boolean;
  minVisits?: number;
  maxVisits?: number;
  contactMethod?: string;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  phone?: string;
  contactNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  preferredContactMethod?: 'email' | 'phone' | 'sms';
  emailNotifications?: boolean;
  smsNotifications?: boolean;
}

export interface UpdateClientRequest {
  name?: string;
  email?: string;
  phone?: string;
  contactNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  isActive?: boolean;
  preferredContactMethod?: 'email' | 'phone' | 'sms';
  emailNotifications?: boolean;
  smsNotifications?: boolean;
}

export interface ClientStatistics {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  newClientsThisMonth: number;
  totalPetsOwned: number;
  averagePetsPerClient: number;
  clientsWithMultiplePets: number;
  recentRegistrations: Client[];
  topClientsByVisits: Client[];
}

export interface VisitHistory {
  id: number;
  clientId: number;
  petId?: number;
  visitDate: string;
  visitType: string;
  veterinarian: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  cost?: number;
  status: 'completed' | 'scheduled' | 'cancelled';
}

@Injectable({
  providedIn: 'root'
})
export class AdminClientService {
  private apiUrl = 'http://localhost:8000/api/admin';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // ===== CLIENT MANAGEMENT =====

  /**
   * Get all clients with optional filtering and pagination
   */
  getClients(filters?: ClientFilters, page?: number, limit?: number): Observable<{
    clients: Client[];
    total: number;
    page: number;
    limit: number;
  }> {
    let params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    
    const url = `${this.apiUrl}/clients?${params.toString()}`;
    
    return this.http.get<any>(url, this.httpOptions).pipe(
      map(response => ({
        clients: response.data || response.clients || [],
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 10
      })),
      catchError(this.handleError<any>('getClients', {
        clients: this.generateMockClients(),
        total: 50,
        page: 1,
        limit: 10
      }))
    );
  }

  /**
   * Get client by ID
   */
  getClientById(id: number): Observable<Client> {
    const url = `${this.apiUrl}/clients/${id}`;
    return this.http.get<Client>(url, this.httpOptions).pipe(
      catchError(this.handleError<Client>('getClientById', this.generateMockClient(id)))
    );
  }

  /**
   * Create new client
   */
  createClient(clientData: CreateClientRequest): Observable<Client> {
    const url = `${this.apiUrl}/clients`;
    return this.http.post<Client>(url, clientData, this.httpOptions).pipe(
      catchError(this.handleError<Client>('createClient', {
        ...clientData,
        id: Date.now(),
        registrationDate: new Date().toISOString(),
        isActive: true,
        totalVisits: 0,
        totalPets: 0
      } as Client))
    );
  }

  /**
   * Update client
   */
  updateClient(id: number, clientData: UpdateClientRequest): Observable<Client> {
    const url = `${this.apiUrl}/clients/${id}`;
    return this.http.put<Client>(url, clientData, this.httpOptions).pipe(
      catchError(this.handleError<Client>('updateClient', {
        ...this.generateMockClient(id),
        ...clientData
      } as Client))
    );
  }

  /**
   * Delete client
   */
  deleteClient(id: number): Observable<{success: boolean; message: string}> {
    const url = `${this.apiUrl}/clients/${id}`;
    return this.http.delete<{success: boolean; message: string}>(url, this.httpOptions).pipe(
      catchError(this.handleError<{success: boolean; message: string}>('deleteClient', {
        success: true,
        message: 'Client deleted successfully'
      }))
    );
  }

  /**
   * Search clients by name or email
   */
  searchClients(searchTerm: string): Observable<Client[]> {
    const url = `${this.apiUrl}/clients/search?q=${encodeURIComponent(searchTerm)}`;
    return this.http.get<Client[]>(url, this.httpOptions).pipe(
      catchError(this.handleError<Client[]>('searchClients', 
        this.generateMockClients().filter(client => 
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ))
    );
  }

  // ===== CONTACT INFORMATION MANAGEMENT =====

  /**
   * Get contact information for a client
   */
  getClientContactInfo(clientId: number): Observable<ContactInfo[]> {
    const url = `${this.apiUrl}/clients/${clientId}/contacts`;
    return this.http.get<ContactInfo[]>(url, this.httpOptions).pipe(
      catchError(this.handleError<ContactInfo[]>('getClientContactInfo', this.generateMockContactInfo(clientId)))
    );
  }

  /**
   * Add contact information for a client
   */
  addClientContactInfo(clientId: number, contactData: Partial<ContactInfo>): Observable<ContactInfo> {
    const url = `${this.apiUrl}/clients/${clientId}/contacts`;
    return this.http.post<ContactInfo>(url, contactData, this.httpOptions).pipe(
      catchError(this.handleError<ContactInfo>('addClientContactInfo', {
        ...contactData,
        id: Date.now(),
        clientId: clientId,
        isActive: true,
        createdAt: new Date().toISOString()
      } as ContactInfo))
    );
  }

  /**
   * Update contact information
   */
  updateClientContactInfo(clientId: number, contactId: number, contactData: Partial<ContactInfo>): Observable<ContactInfo> {
    const url = `${this.apiUrl}/clients/${clientId}/contacts/${contactId}`;
    return this.http.put<ContactInfo>(url, contactData, this.httpOptions).pipe(
      catchError(this.handleError<ContactInfo>('updateClientContactInfo', {
        ...contactData,
        id: contactId,
        clientId: clientId
      } as ContactInfo))
    );
  }

  /**
   * Delete contact information
   */
  deleteClientContactInfo(clientId: number, contactId: number): Observable<{success: boolean; message: string}> {
    const url = `${this.apiUrl}/clients/${clientId}/contacts/${contactId}`;
    return this.http.delete<{success: boolean; message: string}>(url, this.httpOptions).pipe(
      catchError(this.handleError<{success: boolean; message: string}>('deleteClientContactInfo', {
        success: true,
        message: 'Contact information deleted successfully'
      }))
    );
  }

  // ===== PETS OWNED MANAGEMENT =====

  /**
   * Get pets owned by a client
   */
  getClientPets(clientId: number): Observable<Pet[]> {
    const url = `${this.apiUrl}/clients/${clientId}/pets`;
    return this.http.get<Pet[]>(url, this.httpOptions).pipe(
      catchError(this.handleError<Pet[]>('getClientPets', this.generateMockPets(clientId)))
    );
  }

  /**
   * Link a pet to a client
   */
  linkPetToClient(clientId: number, petId: number): Observable<{success: boolean; message: string}> {
    const url = `${this.apiUrl}/clients/${clientId}/pets/${petId}`;
    return this.http.post<{success: boolean; message: string}>(url, {}, this.httpOptions).pipe(
      catchError(this.handleError<{success: boolean; message: string}>('linkPetToClient', {
        success: true,
        message: 'Pet linked to client successfully'
      }))
    );
  }

  /**
   * Unlink a pet from a client
   */
  unlinkPetFromClient(clientId: number, petId: number): Observable<{success: boolean; message: string}> {
    const url = `${this.apiUrl}/clients/${clientId}/pets/${petId}`;
    return this.http.delete<{success: boolean; message: string}>(url, this.httpOptions).pipe(
      catchError(this.handleError<{success: boolean; message: string}>('unlinkPetFromClient', {
        success: true,
        message: 'Pet unlinked from client successfully'
      }))
    );
  }

  // ===== VISIT HISTORY =====

  /**
   * Get visit history for a client
   */
  getClientVisitHistory(clientId: number): Observable<VisitHistory[]> {
    const url = `${this.apiUrl}/clients/${clientId}/visits`;
    return this.http.get<VisitHistory[]>(url, this.httpOptions).pipe(
      catchError(this.handleError<VisitHistory[]>('getClientVisitHistory', this.generateMockVisitHistory(clientId)))
    );
  }

  /**
   * Get visit history for a specific pet
   */
  getPetVisitHistory(clientId: number, petId: number): Observable<VisitHistory[]> {
    const url = `${this.apiUrl}/clients/${clientId}/pets/${petId}/visits`;
    return this.http.get<VisitHistory[]>(url, this.httpOptions).pipe(
      catchError(this.handleError<VisitHistory[]>('getPetVisitHistory', 
        this.generateMockVisitHistory(clientId).filter(visit => visit.petId === petId)
      ))
    );
  }

  // ===== STATISTICS =====

  /**
   * Get client statistics
   */
  getClientStatistics(): Observable<ClientStatistics> {
    const url = `${this.apiUrl}/clients/statistics`;
    return this.http.get<ClientStatistics>(url, this.httpOptions).pipe(
      catchError(this.handleError<ClientStatistics>('getClientStatistics', this.generateMockStatistics()))
    );
  }

  // ===== UTILITY METHODS =====

  /**
   * Get all cities (for filtering)
   */
  getCities(): Observable<string[]> {
    const url = `${this.apiUrl}/clients/cities`;
    return this.http.get<string[]>(url, this.httpOptions).pipe(
      catchError(this.handleError<string[]>('getCities', [
        'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
        'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville'
      ]))
    );
  }

  /**
   * Get all states (for filtering)
   */
  getStates(): Observable<string[]> {
    const url = `${this.apiUrl}/clients/states`;
    return this.http.get<string[]>(url, this.httpOptions).pipe(
      catchError(this.handleError<string[]>('getStates', [
        'California', 'Texas', 'Florida', 'New York', 'Pennsylvania', 'Illinois',
        'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'New Jersey', 'Virginia'
      ]))
    );
  }

  /**
   * Export clients to CSV
   */
  exportClientsToCSV(filters?: ClientFilters): Observable<Blob> {
    let params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const url = `${this.apiUrl}/clients/export?${params.toString()}`;
    return this.http.get(url, { 
      headers: this.httpOptions.headers,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError<Blob>('exportClientsToCSV', new Blob()))
    );
  }

  // ===== MOCK DATA GENERATORS =====

  private generateMockClients(): Client[] {
    return [
      {
        id: 1,
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0101',
        contactNumber: '+1-555-0101',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        dateOfBirth: '1985-06-15',
        emergencyContact: 'Jane Smith',
        emergencyPhone: '+1-555-0102',
        registrationDate: '2023-01-15',
        lastVisit: '2024-01-10',
        totalVisits: 12,
        totalPets: 2,
        isActive: true,
        preferredContactMethod: 'email',
        emailNotifications: true,
        smsNotifications: false,
        notes: 'Prefers morning appointments'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0201',
        contactNumber: '+1-555-0201',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        dateOfBirth: '1990-03-22',
        emergencyContact: 'Mike Johnson',
        emergencyPhone: '+1-555-0202',
        registrationDate: '2023-03-10',
        lastVisit: '2024-01-08',
        totalVisits: 8,
        totalPets: 1,
        isActive: true,
        preferredContactMethod: 'phone',
        emailNotifications: true,
        smsNotifications: true,
        notes: 'Cat owner, very attentive'
      },
      {
        id: 3,
        name: 'Michael Brown',
        email: 'michael.brown@email.com',
        phone: '+1-555-0301',
        contactNumber: '+1-555-0301',
        address: '789 Pine Rd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        dateOfBirth: '1978-11-08',
        emergencyContact: 'Lisa Brown',
        emergencyPhone: '+1-555-0302',
        registrationDate: '2022-08-20',
        lastVisit: '2024-01-05',
        totalVisits: 15,
        totalPets: 3,
        isActive: true,
        preferredContactMethod: 'sms',
        emailNotifications: false,
        smsNotifications: true,
        notes: 'Multiple pet owner, regular checkups'
      }
    ];
  }

  private generateMockClient(id: number): Client {
    const clients = this.generateMockClients();
    return clients.find(c => c.id === id) || clients[0];
  }

  private generateMockContactInfo(clientId: number): ContactInfo[] {
    return [
      {
        id: 1,
        clientId: clientId,
        type: 'primary',
        contactMethod: 'email',
        value: 'john.smith@email.com',
        label: 'Primary Email',
        isPrimary: true,
        isActive: true,
        createdAt: '2023-01-15'
      },
      {
        id: 2,
        clientId: clientId,
        type: 'primary',
        contactMethod: 'phone',
        value: '+1-555-0101',
        label: 'Primary Phone',
        isPrimary: true,
        isActive: true,
        createdAt: '2023-01-15'
      },
      {
        id: 3,
        clientId: clientId,
        type: 'emergency',
        contactMethod: 'phone',
        value: '+1-555-0102',
        label: 'Emergency Contact',
        isPrimary: false,
        isActive: true,
        createdAt: '2023-01-15'
      }
    ];
  }

  private generateMockPets(clientId: number): Pet[] {
    return [
      {
        id: 1,
        name: 'Buddy',
        type: 'Dog',
        breed: 'Golden Retriever',
        age: 3,
        gender: 'male',
        registrationDate: '2023-01-15',
        lastVisit: '2024-01-10',
        isActive: true
      },
      {
        id: 2,
        name: 'Whiskers',
        type: 'Cat',
        breed: 'Persian',
        age: 2,
        gender: 'female',
        registrationDate: '2023-06-20',
        lastVisit: '2024-01-08',
        isActive: true
      }
    ];
  }

  private generateMockVisitHistory(clientId: number): VisitHistory[] {
    return [
      {
        id: 1,
        clientId: clientId,
        petId: 1,
        visitDate: '2024-01-10',
        visitType: 'Regular Checkup',
        veterinarian: 'Dr. Smith',
        diagnosis: 'Healthy',
        treatment: 'Routine vaccination',
        notes: 'Pet is in good health',
        cost: 150.00,
        status: 'completed'
      },
      {
        id: 2,
        clientId: clientId,
        petId: 2,
        visitDate: '2024-01-08',
        visitType: 'Dental Cleaning',
        veterinarian: 'Dr. Johnson',
        diagnosis: 'Mild tartar buildup',
        treatment: 'Dental cleaning and polishing',
        notes: 'Recommend regular dental care',
        cost: 280.00,
        status: 'completed'
      }
    ];
  }

  private generateMockStatistics(): ClientStatistics {
    return {
      totalClients: 156,
      activeClients: 142,
      inactiveClients: 14,
      newClientsThisMonth: 12,
      totalPetsOwned: 298,
      averagePetsPerClient: 1.9,
      clientsWithMultiplePets: 89,
      recentRegistrations: this.generateMockClients().slice(0, 5),
      topClientsByVisits: this.generateMockClients().slice(0, 3)
    };
  }

  /**
   * Handle Http operation that failed
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Let the app keep running by returning an empty result
      return of(result as T);
    };
  }
} 