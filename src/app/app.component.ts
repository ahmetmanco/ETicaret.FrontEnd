import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/common/auth.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(public authService : AuthService) {  }

  ngOnInit() {
  this.authService.identityCheck();
}
}
//istek gönderiyorum
// $.get("")