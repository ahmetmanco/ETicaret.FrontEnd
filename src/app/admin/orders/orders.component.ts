import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { BasketService, CompletedOrder } from 'src/app/services/common/basket.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  orders: CompletedOrder[] = [];

  constructor(private basketService: BasketService) {}

  ngOnInit(): void {
    this.basketService.orders$.subscribe((list) => {
      this.orders = list;
    });
  }
}
