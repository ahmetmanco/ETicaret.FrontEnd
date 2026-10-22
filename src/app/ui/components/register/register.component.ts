import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors, ValidatorFn, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { User } from 'src/app/Entities/user';
import { UserService } from 'src/app/services/common/user.service';
import { Create_User } from 'src/app/contract/create_user';
import { SocialAuthService, SocialUser, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { filter, firstValueFrom, Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/common/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterModule,
    MaterialModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    GoogleSigninButtonModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit, OnDestroy {
  selectedRole: 'Customer' | 'Seller' = 'Customer';
  private authSubscription?: Subscription;
  submitted = false;
  isLoading = false;

  form = new FormGroup(
    {
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      uname: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      storeName: new FormControl(''),
      taxNumber: new FormControl(''),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator() }
  );

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private socialAuthService: SocialAuthService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['role'] === 'Seller') {
        this.selectRole('Seller');
      } else if (params['role'] === 'Customer') {
        this.selectRole('Customer');
      }
    });

    this.authSubscription = this.socialAuthService.authState
      .pipe(filter(user => !!user && !!user.idToken))
      .subscribe({
        next: (user: SocialUser) => this.handleGoogleSignUp(user),
        error: (err) => console.error('Google register error:', err)
      });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  selectRole(role: 'Customer' | 'Seller') {
    this.selectedRole = role;
  }

  get f() {
    return this.form.controls;
  }

  private async handleGoogleSignUp(user: SocialUser) {
    try {
      const response = await firstValueFrom(
        this.userService.googleLogin(user.idToken, this.selectedRole)
      );
      const tokenObj = response?.token || response?.Token;
      const accessToken = tokenObj?.accessToken || (tokenObj as any)?.AccessToken;
      const role = tokenObj?.Role || tokenObj?.role || this.selectedRole;

      if (accessToken) {
        this.authService.setToken(accessToken, role);
        this.snackBar.open(`Google ile ${this.selectedRole === 'Seller' ? 'Satıcı' : 'Müşteri'} kaydınız tamamlandı!`, 'Tamam', {
          duration: 3000
        });
        this.router.navigate([role === 'Seller' ? '/products' : '/dashboard']);
      }
    } catch (error: any) {
      this.snackBar.open('Google ile kayıt sırasında hata oluştu.', 'Kapat', { duration: 4000 });
    }
  }

  async submit() {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    try {
      const user: User = {
        firstName: this.form.value.firstName || '',
        lastName: this.form.value.lastName || '',
        uname: this.form.value.uname || '',
        email: this.form.value.email || '',
        password: this.form.value.password || '',
        confirmPassword: this.form.value.confirmPassword || '',
        role: this.selectedRole,
        storeName: this.selectedRole === 'Seller' ? (this.form.value.storeName || '') : undefined,
        taxNumber: this.selectedRole === 'Seller' ? (this.form.value.taxNumber || '') : undefined,
      };

      const result: any = await this.userService.create(user);
      const succeeded = result?.Succeeded ?? result?.succeeded;
      const message = result?.Message ?? result?.message;

      if (succeeded) {
        this.snackBar.open(message || 'Kullanıcı kaydı başarılı! Giriş yapabilirsiniz.', 'Tamam', { duration: 3500 });
        this.router.navigate(['/login', this.selectedRole.toLowerCase()]);
      } else {
        this.snackBar.open(message || 'Kayıt başarısız oldu.', 'Kapat', { duration: 5000 });
      }
    } catch (err: any) {
      this.snackBar.open(err?.error?.message || 'Kayıt sırasında bir hata oluştu.', 'Kapat', { duration: 5000 });
    } finally {
      this.isLoading = false;
    }
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;
      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }
}
