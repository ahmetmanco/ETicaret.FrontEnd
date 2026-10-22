import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BasketItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

export interface CompletedOrder {
  orderNo: string;
  createdAt: Date;
  items: BasketItem[];
  totalAmount: number;
  addressSummary: string;
  status: 'Hazırlanıyor' | 'Kargoda' | 'Teslim Edildi';
}

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private readonly storageKey = 'eticaret_basket';
  private readonly ordersKey = 'eticaret_orders';

  private _itemsSubject = new BehaviorSubject<BasketItem[]>(this.loadFromStorage());
  items$ = this._itemsSubject.asObservable();

  private _ordersSubject = new BehaviorSubject<CompletedOrder[]>(this.loadOrdersFromStorage());
  orders$ = this._ordersSubject.asObservable();

  private loadFromStorage(): BasketItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private loadOrdersFromStorage(): CompletedOrder[] {
    try {
      const raw = localStorage.getItem(this.ordersKey);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        orderNo: 'SIP-2026-1042',
        createdAt: new Date(),
        items: [
          {
            productId: 1,
            name: 'Kablosuz Gürültü Engelleyici Kulaklık',
            price: 4250,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
            quantity: 1,
            stock: 35
          }
        ],
        totalAmount: 4250,
        addressSummary: 'İstanbul / Kadıköy / Caferağa Mah.',
        status: 'Kargoda'
      }
    ];
  }

  private saveToStorage(items: BasketItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    this._itemsSubject.next(items);
  }

  getItems(): BasketItem[] {
    return this._itemsSubject.value;
  }

  getTotalCount(): number {
    return this._itemsSubject.value.reduce((acc, item) => acc + item.quantity, 0);
  }

  getTotalAmount(): number {
    return this._itemsSubject.value.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  addToBasket(product: { id: number; name: string; price: number; image: string; stock: number }, quantity = 1): void {
    const items = [...this._itemsSubject.value];
    const existing = items.find(x => x.productId === product.id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock || 99);
    } else {
      items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
        stock: product.stock || 99
      });
    }
    this.saveToStorage(items);
  }

  updateQuantity(productId: number, delta: number): void {
    const items = [...this._itemsSubject.value];
    const idx = items.findIndex(x => x.productId === productId);
    if (idx === -1) return;

    items[idx].quantity += delta;
    if (items[idx].quantity <= 0) {
      items.splice(idx, 1);
    }
    this.saveToStorage(items);
  }

  removeItem(productId: number): void {
    const items = this._itemsSubject.value.filter(x => x.productId !== productId);
    this.saveToStorage(items);
  }

  clearBasket(): void {
    this.saveToStorage([]);
  }

  completeOrder(addressSummary: string): CompletedOrder {
    const items = this.getItems();
    const totalAmount = this.getTotalAmount();
    const newOrder: CompletedOrder = {
      orderNo: 'SIP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date(),
      items,
      totalAmount,
      addressSummary: addressSummary || 'Standart Teslimat Adresi',
      status: 'Hazırlanıyor'
    };
    const orders = [newOrder, ...this._ordersSubject.value];
    localStorage.setItem(this.ordersKey, JSON.stringify(orders));
    this._ordersSubject.next(orders);
    this.clearBasket();
    return newOrder;
  }
}
