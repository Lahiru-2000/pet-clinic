import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private httpClient:HttpClient) { }
/*
    //api for Appointment
    getAppointData() {
      return this.httpClient.get('http://127.0.0.1:8000/api/appointments');
    }

    getAppointById(id:any){
      return this.httpClient.get('http://127.0.0.1:8000/api/appointment');
    }

    updateAppoint(id:any, data:Club){
      return this.httpClient.put('http://127.0.0.1:8000/api/updateappointments');
    }*/
}
