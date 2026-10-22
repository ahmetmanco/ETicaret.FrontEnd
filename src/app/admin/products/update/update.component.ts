import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductImageItem } from 'src/app/models/product.model';
import { HttpClientService } from 'src/app/services/common/http-client.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-update',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardHeader,
    MatCardTitle,
    MatCard,
    MatCardContent,
    MatIconModule
  ],
  standalone: true,
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss'
})
export class UpdateComponent implements OnInit {
  private readonly serverOrigin = 'https://localhost:7275';

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(5)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required, Validators.min(1)]],
  });

  productid!: number;
  existingImages: { id: number; fileName: string; url: string; isMain: boolean }[] = [];
  newSelectedFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private https: HttpClientService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.productid = +this.route.snapshot.params['id'];
    this.loadProduct();
  }

  private resolveImageUrl(path?: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${this.serverOrigin}/${path.replace(/^\/+/, '')}`;
  }

  loadProduct(): void {
    this.https.get<any>({ controller: 'Product' }, this.productid.toString()).subscribe(product => {
      this.form.patchValue({
        name: product.Name ?? product.name,
        stock: product.Stock ?? product.stock,
        price: product.Price ?? product.price,
      });

      const rawImages: ProductImageItem[] = product.Images || product.images || [];
      this.existingImages = rawImages.map(img => ({
        id: (img.Id ?? img.id)!,
        fileName: (img.FileName ?? img.fileName) || '',
        url: this.resolveImageUrl(img.Path ?? img.path),
        isMain: !!(img.IsMain ?? img.isMain)
      }));
    });
  }

  goBack() {
    this.router.navigate(['/products']);
  }

  onFilesSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.newSelectedFiles = Array.from(fileInput.files);
    }
  }

  uploadAdditionalImages(): void {
    if (this.newSelectedFiles.length === 0) return;

    const formData = new FormData();
    this.newSelectedFiles.forEach(f => formData.append('files', f, f.name));

    this.https.postFormData<any>({
      controller: 'Product',
      action: `${this.productid}/images`
    }, formData).subscribe(() => {
      this.newSelectedFiles = [];
      this.loadProduct();
      alert('Yeni ürün görselleri eklendi!');
    });
  }

  deleteImage(imageId: number): void {
    if (!confirm('Bu ürün resmini silmek istediğinize emin misiniz?')) return;
    this.https.delete<any>({
      controller: 'Product',
      action: `${this.productid}/images`
    }, imageId.toString()).subscribe(() => {
      this.loadProduct();
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Form geçersiz.');
      return;
    }

    const payload = {
      Id: this.productid,
      Name: this.form.value.name,
      Stock: Number(this.form.value.stock),
      Price: Number(this.form.value.price)
    };

    this.https.put<any>({ controller: 'Product' }, payload).subscribe(() => {
      if (this.newSelectedFiles.length > 0) {
        const formData = new FormData();
        this.newSelectedFiles.forEach(f => formData.append('files', f, f.name));
        this.https.postFormData<any>({
          controller: 'Product',
          action: `${this.productid}/images`
        }, formData).subscribe(() => {
          alert('Ürün ve yeni görseller güncellendi!');
          this.router.navigate(['/products']);
        });
      } else {
        alert('Ürün güncellendi!');
        this.router.navigate(['/products']);
      }
    });
  }
}
