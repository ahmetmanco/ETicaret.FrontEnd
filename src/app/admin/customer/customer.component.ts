import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent {
  users = [
    { name: 'Ahmet Manco', role: 'Admin', email: 'admin@heryerburada.com', status: 'Aktif' },
    { name: 'TeknoMağaza A.Ş.', role: 'Seller', email: 'magaza@heryerburada.com', status: 'Onaylı Satıcı' },
    { name: 'Zeynep Yılmaz', role: 'Customer', email: 'zeynep@gmail.com', status: 'Premium Üye' }
  ];
}
