import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { ProductsComponent } from './admin/products/list/products.component';
import { CreateComponent } from './admin/products/create/create.component';
import { UpdateComponent } from './admin/products/update/update.component';
import { RegisterComponent } from './ui/components/register/register.component';
import { LoginComponent } from './ui/components/login/login.component';
import { authGuard } from './guards/common/auth.guard';
import { LayoutComponent } from './admin/layout/layout.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CustomerComponent } from './admin/customer/customer.component';
import { OrdersComponent } from './admin/orders/orders.component';
import { HomeComponent } from './ui/components/home/home.component';
import { BasketsComponent } from './ui/components/baskets/baskets.component';
import { AddressesComponent } from './ui/components/addresses/addresses.component';

export const routes: Routes = [
  {
    path: '',
    component: BlankComponent,
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'login/:role', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },

  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'baskets', component: BasketsComponent },
      { path: 'addresses', component: AddressesComponent },
      { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
      { path: 'products', component: ProductsComponent, canActivate: [authGuard] },
      { path: 'products/create', component: CreateComponent, canActivate: [authGuard] },
      { path: 'products/update/:id', component: UpdateComponent, canActivate: [authGuard] },
    ]
  },

  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'customers', component: CustomerComponent },
      { path: 'orders', component: OrdersComponent }
    ]
  },

  { path: '**', redirectTo: '' }
];
