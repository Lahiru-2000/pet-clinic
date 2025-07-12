
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client-sidebar',
  templateUrl: './client-sidebar.component.html',
  styleUrl: './client-sidebar.component.scss'
})
export class ClientSidebarComponent implements OnInit {

  // User information
  username: string | null = '';
  useremail: string | null = '';
  userIsAdmin: string | null = '';
  isAdmin: boolean = false;

  // Collapsible sections for client sidebar
  isAppointmentCollapsed = true;

  // Collapsible sections for admin sidebar
  isAppointmentMgmtCollapsed = true;
  isPetRecordsCollapsed = true;
  isClientMgmtCollapsed = true;
  isStaffMgmtCollapsed = true;
  isServiceMgmtCollapsed = true;
  isBillingCollapsed = true;
  isReportsCollapsed = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.useremail = this.authService.getUserEmail();
    this.userIsAdmin = this.authService.getUserIsAdmin();
    
    // Check if user is admin (assuming '1' or 'true' indicates admin)
    this.isAdmin = this.userIsAdmin === '1' || this.userIsAdmin === 'true';

    console.log("Username: ", this.username);
    console.log("Is Admin: ", this.isAdmin);
  }

  signOut() {
    localStorage.clear();
    this.router.navigate(['/']);
  }

  // Toggle methods for collapsible sections
  toggleAppointmentMgmt() {
    this.isAppointmentMgmtCollapsed = !this.isAppointmentMgmtCollapsed;
  }

  togglePetRecords() {
    this.isPetRecordsCollapsed = !this.isPetRecordsCollapsed;
  }

  toggleClientMgmt() {
    this.isClientMgmtCollapsed = !this.isClientMgmtCollapsed;
  }

  toggleStaffMgmt() {
    this.isStaffMgmtCollapsed = !this.isStaffMgmtCollapsed;
  }

  toggleServiceMgmt() {
    this.isServiceMgmtCollapsed = !this.isServiceMgmtCollapsed;
  }

  toggleBilling() {
    this.isBillingCollapsed = !this.isBillingCollapsed;
  }

  toggleReports() {
    this.isReportsCollapsed = !this.isReportsCollapsed;
  }
}

