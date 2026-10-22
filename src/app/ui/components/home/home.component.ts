import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { HttpClientService } from 'src/app/services/common/http-client.service';
import { AuthService } from 'src/app/services/common/auth.service';
import { BasketService } from 'src/app/services/common/basket.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, MaterialModule, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly serverOrigin = 'https://localhost:7275';
  private slideTimer: any;

  products: any[] = [];
  searchTerm = '';
  selectedCategory = 'Tümü';
  activeImageIndex: Record<number, number> = {};
  basketCount = 0;
  activeHeroTab = 0;

  categories: string[] = [
    'Tümü',
    'Elektronik',
    'Moda',
    'Ev, Yaşam, Kırtasiye, Ofis',
    'Anne, Bebek, Oyuncak',
    'Spor, Outdoor',
    'Kozmetik, Kişisel Bakım',
    'Süpermarket, Pet Shop',
    'Kitap, Müzik, Film, Hobi'
  ];

  heroBanners = [
    {
      id: 1,
      shortLabel: 'Süper Teklif',
      tag: '1 / 10 • SÜPER FİYAT, SÜPER TEKLİF',
      title: 'Teknoloji ve Elektronik Ürünlerde Efsane Fırsatlar!',
      subtitle: 'Seçili kulaklık, ses sistemi ve giyilebilir teknolojilerde sepette net %25 indirim ve 81 ile Yarın Kapında teslimat.',
      bg: 'linear-gradient(120deg, #ff6000 0%, #ff8533 60%, #ffa366 100%)',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900'
    },
    {
      id: 2,
      shortLabel: 'Bilgisayar',
      tag: '2 / 10 • BİLGİSAYAR & OYUN GÜNLERİ',
      title: 'Dizüstü Bilgisayar ve Oyuncu Ekipmanlarında Dev İndirim!',
      subtitle: 'Yüksek performanslı laptop, monitör ve mekanik klavyelerde peşin fiyatına 6 taksit fırsatı HerYerHerYerde’de.',
      bg: 'linear-gradient(120deg, #1e3a8a 0%, #2563eb 65%, #38bdf8 100%)',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900'
    },
    {
      id: 3,
      shortLabel: 'Akıllı Telefon',
      tag: '3 / 10 • YENİ NESİL AKILLI TELEFONLAR',
      title: 'Amiral Gemisi Telefonlarda Eski세yi Getir Yeniyi Götür!',
      subtitle: 'En yeni akıllı telefon modellerinde ek takas desteği ve kargo bedava avantajıyla hemen sipariş verin.',
      bg: 'linear-gradient(120deg, #5d196a 0%, #7723db 60%, #a855f7 100%)',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900'
    },
    {
      id: 4,
      shortLabel: 'Akıllı Saat',
      tag: '4 / 10 • GİYİLEBİLİR TEKNOLOJİ',
      title: 'Akıllı Saat ve Bilekliklerde Bahar Kampanyası',
      subtitle: 'Sağlık takibi, GPS ve uzun pil ömrü sunan akıllı saatlerde %30’a varan indirimleri kaçırmayın.',
      bg: 'linear-gradient(120deg, #065f46 0%, #059669 60%, #34d399 100%)',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900'
    },
    {
      id: 5,
      shortLabel: 'Moda & Spor',
      tag: '5 / 10 • SEZONUN TRENDLERİ',
      title: 'Spor Ayakkabı ve Günlük Giyimde 2 Al 1 Öde Fırsatı!',
      subtitle: 'Dünyaca ünlü spor markalarında yeni sezon koleksiyonları şimdi HerYerHerYerde vitrininde.',
      bg: 'linear-gradient(120deg, #be123c 0%, #e11d48 60%, #fb7185 100%)',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900'
    },
    {
      id: 6,
      shortLabel: 'Küçük Ev Aletleri',
      tag: '6 / 10 • EV & YAŞAM KONFORU',
      title: 'Kahve Makineleri ve Robot Süpürgelerde Süper Fiyatlar',
      subtitle: 'Evinizin havasını değiştirecek akıllı ev aletlerinde bugüne özel kupon fırsatları.',
      bg: 'linear-gradient(120deg, #78350f 0%, #b45309 60%, #f59e0b 100%)',
      image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=900'
    },
    {
      id: 7,
      shortLabel: 'Fotoğraf & Kamera',
      tag: '7 / 10 • PROFESYONEL ÇEKİM',
      title: 'Aynasız Kameralar, Drone ve Aksiyon Kameralarında Fırsat',
      subtitle: 'Anılarınızı 4K kalitesinde ölümsüzleştirin! Çoklu ürün görselleriyle tüm detayları inceleyin.',
      bg: 'linear-gradient(120deg, #0f172a 0%, #334155 60%, #64748b 100%)',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900'
    },
    {
      id: 8,
      shortLabel: 'Kozmetik',
      tag: '8 / 10 • KOZMETİK & KİŞİSEL BAKIM',
      title: 'Parfüm ve Cilt Bakım Setlerinde Sepette %40 İndirim!',
      subtitle: 'Orijinal ürün garantisi ve hızlı kargo avantajıyla favori bakım ürünleriniz kapınızda.',
      bg: 'linear-gradient(120deg, #831843 0%, #db2777 60%, #f472b6 100%)',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900'
    },
    {
      id: 9,
      shortLabel: 'Satıcı Portalı',
      tag: '9 / 10 • HERYERHERYERDE İŞ ORTAĞIM',
      title: 'Mağazanızı Açın, Ürünlerinizi Tüm Türkiye ile Buluşturun',
      subtitle: 'Satıcı panelinden çoklu ürün görselleri yükleyin, stoklarınızı ve siparişlerinizi tek ekrandan yönetin.',
      bg: 'linear-gradient(120deg, #15803d 0%, #22c55e 60%, #86efac 100%)',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900'
    },
    {
      id: 10,
      shortLabel: '81 İl Teslimat',
      tag: '10 / 10 • 81 İL • 976 İLÇE • 32.000+ MAHALLE',
      title: 'TurkiyeCitiesPackage ile Türkiye’nin Her Köşesine Teslimat!',
      subtitle: 'İl, ilçe ve mahalle seçiminizi yapın; HerYerHerYerde güvencesiyle siparişiniz en hızlı rotayla adresinize gelsin.',
      bg: 'linear-gradient(120deg, #312e81 0%, #4f46e5 60%, #818cf8 100%)',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900'
    }
  ];

  constructor(
    private http: HttpClientService,
    public authService: AuthService,
    public basketService: BasketService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.basketService.items$.subscribe(() => {
      this.basketCount = this.basketService.getTotalCount();
    });
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  startAutoSlide(): void {
    this.stopAutoSlide();
    this.slideTimer = setInterval(() => {
      this.nextSlide(false);
    }, 5000);
  }

  stopAutoSlide(): void {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
      this.slideTimer = null;
    }
  }

  prevSlide(): void {
    this.activeHeroTab =
      (this.activeHeroTab - 1 + this.heroBanners.length) % this.heroBanners.length;
    this.startAutoSlide();
  }

  nextSlide(resetTimer = true): void {
    this.activeHeroTab = (this.activeHeroTab + 1) % this.heroBanners.length;
    if (resetTimer) {
      this.startAutoSlide();
    }
  }

  goToSlide(idx: number): void {
    this.activeHeroTab = idx;
    this.startAutoSlide();
  }

  private resolveImageUrl(path?: string): string {
    if (!path) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${this.serverOrigin}/${path.replace(/^\/+/, '')}`;
  }

  get filteredProducts(): any[] {
    let list = this.products;
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }

  loadProducts(): void {
    this.http.get<any>({ controller: 'Product' }, undefined, 'Page=0&Size=50').subscribe({
      next: (res) => {
        const list = res?.Products || res?.products || [];
        this.products = list.map((p: any, idx: number) => {
          const rawImages = p.Images || p.images || [];
          const imageList: string[] = rawImages.map((img: any) =>
            this.resolveImageUrl(img.Path || img.path)
          );
          const fallback = this.resolveImageUrl(p.Image || p.image);
          if (imageList.length === 0 && fallback) imageList.push(fallback);

          const id = p.Id ?? p.id;
          this.activeImageIndex[id] = 0;
          const price = p.Price ?? p.price;

          return {
            id,
            name: p.Name ?? p.name,
            price,
            oldPrice: Math.round(price * 1.18),
            discountRate: 15,
            rating: 4.8,
            reviewCount: 42 + idx * 19,
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
    const ref = this.snackBar.open(`"${product.name}" sepete eklendi!`, 'Sepete Git', {
      duration: 3000
    });
    ref.onAction().subscribe(() => {
      window.location.href = '/baskets';
    });
  }
}
