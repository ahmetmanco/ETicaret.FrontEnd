import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpClientService } from 'src/app/services/common/http-client.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface CityItem {
  id: number;
  name: string;
  plateCode: string;
}

export interface DistrictItem {
  id: number;
  name: string;
  cityId: number;
}

export interface NeighborhoodItem {
  id: number;
  name: string;
  districtId: number;
}

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './addresses.component.html'
})
export class AddressesComponent implements OnInit {
  cities: CityItem[] = [];
  districts: DistrictItem[] = [];
  neighborhoods: NeighborhoodItem[] = [];
  savedAddresses: any[] = [];

  loadingCities = false;
  loadingDistricts = false;
  loadingNeighborhoods = false;
  saving = false;

  form = this.fb.group({
    title: ['Ev Adresi', [Validators.required]],
    cityId: [null as number | null, [Validators.required]],
    districtId: [null as number | null, [Validators.required]],
    neighborhoodId: [null as number | null, [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(5)]]
  });

  constructor(
    private fb: FormBuilder,
    private http: HttpClientService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCities();
    this.loadUserAddresses();
  }

  loadCities(): void {
    this.loadingCities = true;
    this.http.get<any[]>({ controller: 'Address', action: 'cities' }).subscribe({
      next: (res) => {
        this.cities = (res || []).map(c => ({
          id: c.Id ?? c.id,
          name: c.Name ?? c.name,
          plateCode: c.PlateCode ?? c.plateCode
        }));
        this.loadingCities = false;
      },
      error: () => {
        this.loadingCities = false;
      }
    });
  }

  onCityChange(cityId: number): void {
    this.form.patchValue({ districtId: null, neighborhoodId: null });
    this.districts = [];
    this.neighborhoods = [];
    if (!cityId) return;

    this.loadingDistricts = true;
    this.http.get<any[]>({
      controller: 'Address',
      action: `cities/${cityId}/districts`
    }).subscribe({
      next: (res) => {
        this.districts = (res || []).map(d => ({
          id: d.Id ?? d.id,
          name: d.Name ?? d.name,
          cityId: d.CityId ?? d.cityId
        }));
        this.loadingDistricts = false;
      },
      error: () => {
        this.loadingDistricts = false;
      }
    });
  }

  onDistrictChange(districtId: number): void {
    this.form.patchValue({ neighborhoodId: null });
    this.neighborhoods = [];
    const cityId = this.form.value.cityId;
    if (!cityId || !districtId) return;

    this.loadingNeighborhoods = true;
    this.http.get<any[]>({
      controller: 'Address',
      action: `cities/${cityId}/districts/${districtId}/neighborhoods`
    }).subscribe({
      next: (res) => {
        this.neighborhoods = (res || []).map(n => ({
          id: n.Id ?? n.id,
          name: n.Name ?? n.name,
          districtId: n.DistrictId ?? n.districtId
        }));
        this.loadingNeighborhoods = false;
      },
      error: () => {
        this.loadingNeighborhoods = false;
      }
    });
  }

  loadUserAddresses(): void {
    this.http.get<any[]>({ controller: 'Address' }).subscribe({
      next: (res) => {
        this.savedAddresses = (res || []).map(a => ({
          id: a.Id ?? a.id,
          title: a.Title ?? a.title,
          cityName: a.CityName ?? a.cityName,
          districtName: a.DistrictName ?? a.districtName,
          neighborhoodName: a.NeighborhoodName ?? a.neighborhoodName,
          description: a.Description ?? a.description,
          createdDate: a.CreatedDate ?? a.createdDate
        }));
      },
      error: () => {}
    });
  }

  submitAddress(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload = {
      Title: this.form.value.title,
      CityId: this.form.value.cityId,
      DistrictId: this.form.value.districtId,
      NeighborhoodId: this.form.value.neighborhoodId,
      Description: this.form.value.description
    };

    this.http.post<any>({ controller: 'Address' }, payload).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Adres başarıyla kaydedildi!', 'Tamam', { duration: 3000 });
        this.form.reset({ title: 'Ev Adresi' });
        this.districts = [];
        this.neighborhoods = [];
        this.loadUserAddresses();
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err?.error?.message || 'Adres kaydedilirken hata oluştu.', 'Kapat', { duration: 4000 });
      }
    });
  }

  deleteAddress(id: number): void {
    if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) return;
    this.http.delete<any>({ controller: 'Address' }, id.toString()).subscribe(() => {
      this.snackBar.open('Adres silindi.', 'Tamam', { duration: 2500 });
      this.loadUserAddresses();
    });
  }
}
