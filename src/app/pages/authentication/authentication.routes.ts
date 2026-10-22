import { Routes } from '@angular/router';

// import { AppSideLoginComponent } from './side-login/side-login.component';
// import { AppSideRegisterComponent } from './side-register/side-register.component';
import { RegisterComponent } from 'src/app/ui/components/register/register.component';
import { LoginComponent } from 'src/app/ui/components/login/login.component';

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        component: LoginComponent ,//AppSideLoginComponent
      },
      {
        path: 'register',
        component: RegisterComponent ,// AppSideRegisterComponent
      },
    ],
  },
];
