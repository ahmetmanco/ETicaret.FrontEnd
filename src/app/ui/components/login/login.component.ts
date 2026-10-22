import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { UserService } from 'src/app/services/common/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, firstValueFrom, Subscription, take } from 'rxjs';
import { AuthService } from 'src/app/services/common/auth.service';
import { SocialAuthService, SocialUser, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

export type LoginRoleType = 'Customer' | 'Seller' | 'Admin';

@Component({
  selector: 'login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
    GoogleSigninButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  selectedRole: LoginRoleType = 'Customer';
  hidePassword = true;

  roleConfig: Record<LoginRoleType, {
    title: string;
    subtitle: string;
    badgeColor: string;
    gradient: string;
    icon: string;
    features: string[];
  }> = {
    Customer: {
      title: 'Müşteri Girişi',
      subtitle: 'Binlerce ürünü keşfedin, sepetinizi oluşturun ve 81 il/ilçe/mahalle desteğiyle adresinize sipariş verin.',
      badgeColor: '#2563eb',
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #3b82f6 100%)',
      icon: 'shopping_bag',
      features: [
        'Çoklu ürün görselleri ile detaylı inceleme',
        'TurkiyeCitiesPackage ile 81 İl / İlçe / Mahalle adres seçimi',
        'Google hesabınızla tek tıkla hızlı kayıt ve giriş'
      ]
    },
    Seller: {
      title: 'Satıcı (Mağaza) Girişi',
      subtitle: 'Mağazanızı yönetin, ürünlerinize birden fazla görsel yükleyin ve stok/fiyat takibini anlık yapın.',
      badgeColor: '#059669',
      gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 55%, #10b981 100%)',
      icon: 'storefront',
      features: [
        'Sınırsız çoklu ürün görseli yükleme ve vitrin yönetimi',
        'Anlık stok, fiyat ve sipariş takip ekranı',
        'Google ile hızlı mağaza yetkilendirmesi'
      ]
    },
    Admin: {
      title: 'Yönetici (Admin) Girişi',
      subtitle: 'Platformdaki tüm ürünleri, satıcıları, müşteri hesaplarını ve sipariş akışlarını tek merkezden yönetin.',
      badgeColor: '#dc2626',
      gradient: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 55%, #ef4444 100%)',
      icon: 'admin_panel_settings',
      features: [
        'Tam yetkili ürün, stok ve görsel denetimi',
        'Müşteri ve Satıcı hesaplarının merkezi yönetimi',
        'Rol tabanlı JWT güvenlik politikası (AdminPolicy)'
      ]
    }
  };

  form = new FormGroup({
    uname: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required]),
  });

  private authSubscription?: Subscription;
  isLoading = false;
  googleLoading = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private socialAuthService: SocialAuthService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      const roleParam = params.get('role');
      if (roleParam) {
        if (roleParam.toLowerCase() === 'seller') this.selectedRole = 'Seller';
        else if (roleParam.toLowerCase() === 'admin') this.selectedRole = 'Admin';
        else this.selectedRole = 'Customer';
      }
    });

    this.setupGoogleAuth();
    this.checkExistingSession();
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
  }

  selectRole(role: LoginRoleType) {
    this.selectedRole = role;
  }

  fillDemoCredentials(role: LoginRoleType) {
    this.selectedRole = role;
    if (role === 'Admin') {
      this.form.patchValue({ uname: 'admin@gmail.com', password: 'Admin123.' });
    } else if (role === 'Seller') {
      this.form.patchValue({ uname: 'seller@gmail.com', password: 'Seller123.' });
    } else {
      this.form.patchValue({ uname: 'customer@gmail.com', password: 'Customer123.' });
    }
  }

  get f() {
    return this.form.controls;
  }

  private checkExistingSession() {
    if (this.authService.isAuthenticated()) {
      this.navigateAfterLogin();
    }
  }

  private setupGoogleAuth() {
    this.authSubscription = this.socialAuthService.authState
      .pipe(filter(user => !!user && !!user.idToken))
      .subscribe({
        next: (user: SocialUser) => this.handleGoogleLogin(user),
        error: (error) => this.handleGoogleError(error)
      });
  }

  private async handleGoogleLogin(user: SocialUser) {
    this.googleLoading = true;
    try {
      const response = await firstValueFrom(
        this.userService.googleLogin(user.idToken, this.selectedRole)
      );
      const tokenObj = response?.token || response?.Token;
      const accessToken = tokenObj?.accessToken || (tokenObj as any)?.AccessToken;
      const role = tokenObj?.Role || tokenObj?.role || this.selectedRole;

      if (accessToken) {
        this.authService.setToken(accessToken, role);
        this.snackBar.open(`Google ile ${this.roleConfig[this.selectedRole].title} başarılı!`, 'Tamam', {
          duration: 3000
        });
        this.navigateAfterLogin();
      } else {
        throw new Error('Geçersiz token yanıtı');
      }
    } catch (error: any) {
      this.handleGoogleError(error);
    } finally {
      this.googleLoading = false;
    }
  }

  private handleGoogleError(error: any) {
    console.error('Google auth error:', error);
    const msg = error?.error?.message || error?.error?.Message || 'Google ile giriş/kayıt başarısız oldu.';
    this.snackBar.open(msg, 'Kapat', {
      duration: 5000,
      panelClass: 'error-snackbar'
    });
    this.googleLoading = false;
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    try {
      await this.userService.login(
        this.form.value.uname!,
        this.form.value.password!,
        this.selectedRole
      );
      this.snackBar.open(`${this.roleConfig[this.selectedRole].title} başarılı!`, 'Tamam', {
        duration: 3000
      });
      this.navigateAfterLogin();
    } catch (error: any) {
      this.handleLoginError(error);
    } finally {
      this.isLoading = false;
    }
  }

  private handleLoginError(error: any) {
    console.error('Login error:', error);
    let msg = 'Giriş başarısız! Kullanıcı adı, şifre veya giriş bölümü hatalı.';
    if (error?.error?.message || error?.error?.Message) {
      msg = error.error.message || error.error.Message;
    } else if (error?.message && !error.message.startsWith('Hata Kodu:')) {
      msg = error.message;
    }
    this.snackBar.open(msg, 'Kapat', {
      duration: 5000,
      panelClass: 'error-snackbar'
    });
  }

  private navigateAfterLogin() {
    this.activatedRoute.queryParams
      .pipe(take(1))
      .subscribe(params => {
        const returnUrl = params['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl, { replaceUrl: true });
          return;
        }
        const role = this.authService.getUserRole();
        if (role === 'Admin' || role === 'Seller') {
          this.router.navigateByUrl('/products', { replaceUrl: true });
        } else {
          this.router.navigateByUrl('/dashboard', { replaceUrl: true });
        }
      });
  }
}
