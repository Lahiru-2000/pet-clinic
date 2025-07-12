import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PetService {
   private baseUrl = 'http://localhost:8000/api/pets'; // Adjust this as per your PHP route

  constructor(private http: HttpClient) {}

  // 🔹 Get all pets
  getPets(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  // 🔹 Get pets by user email
  getPetsByUserEmail(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user/${encodeURIComponent(email)}`);
  }

  // 🔹 Get single pet by ID
  // getPetById(id: number): Observable<any> {
  //   return this.http.get<any>(`${this.baseUrl}/${id}`);
  // }

  // 🔹 Add new pet
  addPet(petData: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, petData);
  }

  // 🔹 Edit existing pet
  editPet(id: number, petData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, petData);
  }

  // 🔹 Delete pet by ID
  deletePet(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);

    
  }

  findByPetnameAndOwner(name: string, owner: string) {
  return this.http.get<any>(`${this.baseUrl}/pets/search?petname=${name}&owner=${owner}`);
}


  getPetByPetnameAndOwner(petname: string, owner: string): Observable<any> {
  const url = `${this.baseUrl}/search?petname=${encodeURIComponent(petname)}&owner=${encodeURIComponent(owner)}`;
  return this.http.get<any>(url);
}

}







