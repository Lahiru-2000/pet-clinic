import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) {}

  title = 'RPCS';

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['']);
    }
  }
}
