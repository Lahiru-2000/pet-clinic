import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContactMessage } from '../../models/contact-message.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:8000/api/contact'; // Replace with your backend URL

  constructor(private http: HttpClient) {}

  sendMessage(message: ContactMessage): Observable<any> {
    return this.http.post<any>(this.apiUrl, message);
  }
}

