import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { HeaderComponent } from './components/header/header.component';
import { AppointmentComponent } from './components/appointment/appointment.component';
import { DoctorsComponent } from './components/doctors/doctors.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { OurservComponent } from './components/ourserv/ourserv.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';
import { UpdateAppointmentComponent } from './components/update-appointment/update-appointment.component';
import { CreateDoctorComponent } from './components/create-doctor/create-doctor.component';
import { UpdateDoctorComponent } from './components/update-doctor/update-doctor.component';
import { ViewAppointmentComponent } from './components/view-appointment/view-appointment.component';
import { ViewUsersComponent } from './components/view-users/view-users.component';
import { AdminViewAppointmentComponent } from './admin/appointment-management/admin-view-appointment/admin-view-appointment.component';
import { AdminAppointmentsComponent } from './admin/admin-appointments/admin-appointments.component';
import { ContactComponent } from './components/contact/contact.component';
import { ProfileComponent } from './components/profile/profile.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { InvoicePaymentComponent } from './components/invoice-payment/invoice-payment.component';
import { ClientLayoutComponent } from './components/client-layout/client-layout.component';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { AdminPetsComponent } from './admin/admin-pets/admin-pets.component';
import { PetDetailsComponent } from './admin/pet-details/pet-details.component';
import { MedicalDocumentsComponent } from './admin/medical-documents/medical-documents.component';
import { AdminClientsComponent } from './admin/admin-clients/admin-clients.component';
import { ClientDetailsComponent } from './admin/client-details/client-details.component';

const routes: Routes = [
  // Public routes (no layout)
  { path: '', component: HomeComponent },
  { path: 'about', component: HomeComponent, data: { fragment: 'about' } },
  { path: 'services', component: HomeComponent, data: { fragment: 'services' } },
  { path: 'doctors', component: HomeComponent, data: { fragment: 'doctors' } },
  
  
  // Auth routes (login/signup)
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent }
    ]
  },

  // Authenticated routes with client layout
  {
    path: '',
    component: ClientLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'appointment', component: AppointmentComponent },
      { path: 'update-appointment', component: UpdateAppointmentComponent },
      { path: 'view-appointment', component: ViewAppointmentComponent },
      { path: 'create-doctor', component: CreateDoctorComponent },
      { path: 'update-doctor', component: UpdateDoctorComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'user-profile', component: UserProfileComponent },
      { path: 'payments', component: InvoicePaymentComponent },
      { path: 'view-users', component: ViewUsersComponent },
      { path: 'contact', component: ContactComponent, data: { fragment: 'contact' } },
      
      // Admin Appointment Management
      { path: 'admin/appointment-management/view', component: AdminViewAppointmentComponent },
      { path: 'admin/appointments', component: AdminAppointmentsComponent },
      { path: 'admin/appointments/manage', component: AdminAppointmentsComponent },
      { path: 'admin/appointments/view-all', component: AdminAppointmentsComponent },
      { path: 'admin/appointments/add', component: AdminAppointmentsComponent },
      { path: 'admin/appointments/edit/:id', component: AdminAppointmentsComponent },
      
      // Admin Pet Management
      { path: 'admin/pets', component: AdminPetsComponent },
      { path: 'admin/pets/all', component: AdminPetsComponent },
      { path: 'admin/pets/add', component: AdminPetsComponent },
      { path: 'admin/pets/details/:id', component: PetDetailsComponent },
      { path: 'admin/pets/edit/:id', component: AdminPetsComponent },
      { path: 'admin/pets/medical-history/:id', component: PetDetailsComponent },
      { path: 'admin/pets/vaccinations/:id', component: PetDetailsComponent },
      { path: 'admin/pets/documents/:id', component: MedicalDocumentsComponent },
      { path: 'admin/pets/add-medical-record/:id', component: PetDetailsComponent },
      { path: 'admin/pets/add-vaccination/:id', component: PetDetailsComponent },
      { path: 'admin/pets/upload-document/:id', component: MedicalDocumentsComponent },
      { path: 'admin/pets/link-owner/:id', component: AdminPetsComponent },
      { path: 'admin/pets/statistics', component: AdminPetsComponent },
      
      // Admin Client Management
      { path: 'admin/clients', component: AdminClientsComponent },
      { path: 'admin/clients/all', component: AdminClientsComponent },
      { path: 'admin/clients/add', component: AdminClientsComponent },
      { path: 'admin/clients/details/:id', component: ClientDetailsComponent },
      { path: 'admin/clients/edit/:id', component: AdminClientsComponent },
      { path: 'admin/clients/pets/:id', component: ClientDetailsComponent },
      { path: 'admin/clients/visit-history/:id', component: ClientDetailsComponent },
      { path: 'admin/clients/contact-info/:id', component: ClientDetailsComponent },
      { path: 'admin/clients/add-contact/:id', component: ClientDetailsComponent },
      { path: 'admin/clients/link-pet/:id', component: ClientDetailsComponent },
      { path: 'admin/clients/statistics', component: AdminClientsComponent },
      { path: 'admin/clients/export', component: AdminClientsComponent },
      
      // Additional Admin Routes
      { path: 'admin/dashboard', component: DashboardComponent },
      { path: 'admin/reports', component: DashboardComponent },
      { path: 'admin/settings', component: DashboardComponent }
    ]
  },

  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
