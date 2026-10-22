import { Component,OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TablerIconsModule } from 'angular-tabler-icons';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/common/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-topstrip',
    standalone: true,
    imports: [CommonModule, TablerIconsModule, MatButtonModule, RouterModule, MatMenuModule],
    templateUrl: './topstrip.component.html',
})
export class AppTopstripComponent implements OnInit {
  isAuthenticated: boolean = false;

  constructor(public authService: AuthService) {}

  ngOnInit() {
    this.authService.identityCheck(); // başlangıç kontrolü
    this.authService.isAuthenticated$.subscribe(auth => {
      console.log("Topstrip auth status:", auth); // bunu F12'de görmelisin
      this.isAuthenticated = auth;
    });
  }
}
