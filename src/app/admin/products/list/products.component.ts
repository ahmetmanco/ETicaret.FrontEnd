import { Component, inject, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { HttpClientService } from 'src/app/services/common/http-client.service';
import { Product } from 'src/app/models/product.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { AuthService } from 'src/app/services/common/auth.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, AfterViewInit {
  private httpClientService = inject(HttpClientService);
  private router = inject(Router);
  public authService = inject(AuthService);

  private readonly serverOrigin = 'https://localhost:7275';

  displayedColumns: string[] = ['image', 'name', 'stock', 'price', 'createdDate', 'updateDate', 'actions'];

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    setTimeout(() => {
      this.getProduct(0, this.paginator?.pageSize || 10);
    });
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.getProduct(this.paginator.pageIndex, this.paginator.pageSize);
    });
  }

  resolveImageUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${this.serverOrigin}/${path.replace(/^\/+/, '')}`;
  }

  getProduct(pageIndex: number = 0, pageSize: number = 10): void {
    this.httpClientService.get<any>(
      { controller: 'Product' },
      undefined,
      `Page=${pageIndex}&Size=${pageSize}`
    ).subscribe({
      next: (response) => {
        const rawList = response?.Products || response?.products || [];
        const totalCount = response?.TotalCount ?? response?.totalCount ?? rawList.length;

        const transformed = rawList.map((item: any) => {
          const rawImages = item.Images || item.images || [];
          const imageUrls = rawImages.map((img: any) => this.resolveImageUrl(img.Path || img.path));
          const mainImage = this.resolveImageUrl(item.Image || item.image) || imageUrls[0] || '';

          return {
            id: item.Id ?? item.id,
            name: item.Name ?? item.name,
            stock: item.Stock ?? item.stock,
            price: item.Price ?? item.price,
            image: mainImage,
            imageUrls,
            createdDate: (item.CreatedDate || item.createdDate) ? new Date(item.CreatedDate || item.createdDate) : null,
            updateDate: (item.UpdatedDate || item.updateDate) ? new Date(item.UpdatedDate || item.updateDate) : null
          };
        });

        this.dataSource.data = transformed;
        if (this.paginator) {
          this.paginator.length = totalCount;
        }
      },
      error: (err) => {
        console.error('Ürünler alınırken hata oluştu:', err);
      }
    });
  }

  canManageProducts(): boolean {
    return this.authService.isAdmin() || this.authService.isSeller();
  }

  onAdd(): void {
    this.router.navigate(['/products/create']);
  }

  onEdit(product: Product): void {
    this.router.navigate([`/products/update/${product.id}`]);
  }

  onDelete(product: Product): void {
    if (confirm(`"${product.name}" ürünü silmek istediğinize emin misiniz?`)) {
      this.httpClientService.delete<Product>(
        { controller: 'Product' },
        product.id.toString()
      ).subscribe(() => {
        alert('Ürün Silindi.');
        this.getProduct(this.paginator?.pageIndex || 0, this.paginator?.pageSize || 10);
      });
    }
  }
}
