import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { AuthService } from 'src/app/services/common/auth.service';
import { HttpClientService } from 'src/app/services/common/http-client.service';
import { BasketService } from 'src/app/services/common/basket.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly serverOrigin = 'https://localhost:7275';
  products: any[] = [];
  searchTerm = '';
  activeImageIndex: Record<number, number> = {};
  basketCount = 0;

  constructor(
    public authService: AuthService,
    public basketService: BasketService,
    private http: HttpClientService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.basketService.items$.subscribe(() => {
      this.basketCount = this.basketService.getTotalCount();
    });
  }

  private resolveImageUrl(path?: string): string {
    if (!path) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${this.serverOrigin}/${path.replace(/^\/+/, '')}`;
  }

  get filteredProducts(): any[] {
    if (!this.searchTerm.trim()) return this.products;
    const q = this.searchTerm.toLowerCase();
    return this.products.filter(p => p.name.toLowerCase().includes(q));
  }

  loadProducts(): void {
    this.http.get<any>({ controller: 'Product' }, undefined, 'Page=0&Size=50').subscribe({
      next: (res) => {
        const list = res?.Products || res?.products || [];
        this.products = list.map((p: any) => {
          const rawImages = p.Images || p.images || [];
          const imageList: string[] = rawImages.map((img: any) => this.resolveImageUrl(img.Path || img.path));
          const fallback = this.resolveImageUrl(p.Image || p.image);
          if (imageList.length === 0 && fallback) imageList.push(fallback);

          const id = p.Id ?? p.id;
          this.activeImageIndex[id] = 0;

          return {
            id,
            name: p.Name ?? p.name,
            price: p.Price ?? p.price,
            stock: p.Stock ?? p.stock,
            images: imageList
          };
        });
      },
      error: () => {}
    });
  }

  selectImage(productId: number, idx: number): void {
    this.activeImageIndex[productId] = idx;
  }

  addToCart(product: any): void {
    this.basketService.addToBasket({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '',
      stock: product.stock
    });
    this.snackBar.open(`"${product.name}" sepetinize eklendi!`, 'Tamam', {
      duration: 2500
    });
  }
}
