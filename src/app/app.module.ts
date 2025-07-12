import { Component, NgModule } from '@angular/core';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { BsModalService, BsModalRef, ModalModule } from 'ngx-bootstrap/modal';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { AboutComponent } from './components/about/about.component';
import { AppointmentComponent } from './components/appointment/appointment.component';

import { DoctorsComponent } from './components/doctors/doctors.component';
import { OurservComponent } from './components/ourserv/ourserv.component';
import { ContactComponent } from './components/contact/contact.component';

//import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { BrowserModule } from '@angular/platform-browser';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UpdateAppointmentComponent } from './components/update-appointment/update-appointment.component';
import { CreateDoctorComponent } from './components/create-doctor/create-doctor.component';
import { UpdateDoctorComponent } from './components/update-doctor/update-doctor.component';
import { ViewAppointmentComponent } from './components/view-appointment/view-appointment.component';
import { ViewUsersComponent } from './components/view-users/view-users.component';
import { AppointmentManagementComponent } from './admin/appointment-management/appointment-management.component';
import { AdminViewAppointmentComponent } from './admin/appointment-management/admin-view-appointment/admin-view-appointment.component';
import { AdminAppointmentsComponent } from './admin/admin-appointments/admin-appointments.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { ClientSidebarComponent } from './components/client-sidebar/client-sidebar.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { InvoicePaymentComponent } from './components/invoice-payment/invoice-payment.component';
import { ClientLayoutComponent } from './components/client-layout/client-layout.component';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { AdminPetsComponent } from './admin/admin-pets/admin-pets.component';
import { PetDetailsComponent } from './admin/pet-details/pet-details.component';
import { MedicalDocumentsComponent } from './admin/medical-documents/medical-documents.component';
import { AdminClientsComponent } from './admin/admin-clients/admin-clients.component';
import { ClientDetailsComponent } from './admin/client-details/client-details.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    FooterComponent,
    HeroSectionComponent,
    AboutComponent,
    AppointmentComponent,

    DoctorsComponent,
    OurservComponent,
    ContactComponent,
    AppointmentComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    UpdateAppointmentComponent,
    CreateDoctorComponent,
    UpdateDoctorComponent,
    ViewAppointmentComponent,
    ViewUsersComponent,
    AppointmentManagementComponent,
    AdminViewAppointmentComponent,
    AdminAppointmentsComponent,
    ProfileComponent,
    AdminSidebarComponent,
    ClientSidebarComponent,
    UserProfileComponent,
    InvoicePaymentComponent,
    ClientLayoutComponent,
    AuthLayoutComponent,
    AdminPetsComponent,
    PetDetailsComponent,
    MedicalDocumentsComponent,
    AdminClientsComponent,
    ClientDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    ModalModule.forRoot(),
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    FormsModule,
    BrowserModule,
      

  ],

  
  providers: [
    provideHttpClient(withFetch()),
    BsModalService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

