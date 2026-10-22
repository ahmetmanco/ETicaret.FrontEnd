import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
// import { ProductsComponent } from './products/list/products.component';
// import { CreateComponent } from './products/create/create.component';
// import { UpdateComponent } from './products/update/update.component';
export const PagesRoutes: Routes = [
  {
    path: '', component: StarterComponent, data: { title: 'Starter Page', urls: [ { title: 'Dashboard', url: '/dashboards/dashboard1' }, { title: 'Starter Page' },],},
  },
  // {
  //   path: 'products',
  //   component: ProductsComponent,
  //   data: {
  //     title: 'Products',
  //     urls: [{ title: 'Products' }],
  //   },
  // },
  // {
  //   path:'products/create',
  //   component: CreateComponent,
  // },
  // {
  //   path:'products/update/:id',
  //   component: UpdateComponent,
  // }
  
];
