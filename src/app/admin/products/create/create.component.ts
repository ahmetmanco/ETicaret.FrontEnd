import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { HttpClientService } from 'src/app/services/common/http-client.service';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Product } from 'src/app/models/product.model';

@Component({
  selector: 'app-create',
  standalone: true,
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
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent {
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(5)]],
    stock: ['', [Validators.required, Validators.min(0)]],
    price: ['', [Validators.required, Validators.min(1)]],
  });

  selectedFiles: File[] = [];
  imagePreviews: { file: File; url: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private https: HttpClientService,
    private router: Router
  ) {}

  goBack() {
    this.router.navigate(['/products']);
  }

  onFilesSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (!fileInput.files || fileInput.files.length === 0) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    Array.from(fileInput.files).forEach(file => {
      if (!validTypes.includes(file.type)) {
        alert(`"${file.name}" geçersiz dosya tipi. Sadece JPG, JPEG, PNG veya WEBP yükleyebilirsiniz.`);
        return;
      }

      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.push({
          file,
          url: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    });

    fileInput.value = '';
  }

  removeSelectedImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  submit() {
    if (this.form.invalid || this.selectedFiles.length === 0) {
      this.form.markAllAsTouched();
      alert('Lütfen ürün bilgilerini eksiksiz doldurun (Ürün adı en az 5 karakter) ve en az 1 ürün resmi seçin.');
      return;
    }

    const formData = new FormData();
    formData.append('Name', this.form.value.name!);
    formData.append('Stock', this.form.value.stock!.toString());
    formData.append('Price', this.form.value.price!.toString());

    this.selectedFiles.forEach(file => {
      formData.append('Images', file, file.name);
    });

    this.https.postFormData<Product>({ controller: 'Product' }, formData).subscribe({
      next: () => {
        alert(`Ürün ve ${this.selectedFiles.length} adet ürün görseli başarıyla eklendi!`);
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error('Ürün ekleme hatası:', err);
        alert('Ürün eklenirken hata oluştu.');
      }
    });
  }
}
