import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';
import { BasketItem, BasketService, CompletedOrder } from 'src/app/services/common/basket.service';
import { HttpClientService } from 'src/app/services/common/http-client.service';

@Component({
  selector: 'app-baskets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  templateUrl: './baskets.component.html',
  styleUrl: './baskets.component.scss'
})
export class BasketsComponent implements OnInit {
  items: BasketItem[] = [];
  orders: CompletedOrder[] = [];
  savedAddresses: any[] = [];
  selectedAddressText = 'Ev Adresim - İstanbul / Kadıköy / Caferağa Mah.';

  constructor(
    public basketService: BasketService,
    private http: HttpClientService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.basketService.items$.subscribe((list) => {
      this.items = list;
    });
    this.basketService.orders$.subscribe((list) => {
      this.orders = list;
    });
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.http.get<any[]>({ controller: 'Address' }).subscribe({
      next: (res) => {
        this.savedAddresses = (res || []).map((a) => ({
          id: a.Id ?? a.id,
          title: a.Title ?? a.title,
          cityName: a.CityName ?? a.cityName,
          districtName: a.DistrictName ?? a.districtName,
          neighborhoodName: a.NeighborhoodName ?? a.neighborhoodName,
          description: a.Description ?? a.description
        }));
        if (this.savedAddresses.length > 0) {
          const first = this.savedAddresses[0];
          this.selectedAddressText = `${first.title} - ${first.cityName} / ${first.districtName} / ${first.neighborhoodName}`;
        }
      },
      error: () => {}
    });
  }

  changeQty(item: BasketItem, delta: number): void {
    this.basketService.updateQuantity(item.productId, delta);
  }

  removeItem(productId: number): void {
    this.basketService.removeItem(productId);
    this.snackBar.open('Ürün sepetten çıkarıldı.', 'Tamam', { duration: 2000 });
  }

  clearAll(): void {
    this.basketService.clearBasket();
    this.snackBar.open('Sepetiniz temizlendi.', 'Tamam', { duration: 2000 });
  }

  completeOrder(): void {
    const order = this.basketService.completeOrder(this.selectedAddressText);
    if (order) {
      this.snackBar.open(`Siparişiniz (#${order.orderNo}) başarıyla oluşturuldu!`, 'Harika', {
        duration: 4000
      });
    }
  }
}
