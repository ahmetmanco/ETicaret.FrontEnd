import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';
import { User } from 'src/app/Entities/user';
import { Create_User } from 'src/app/contract/create_user';
import { firstValueFrom, Observable } from 'rxjs';
import { tokenResponse } from 'src/app/Token/tokenResponse';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private httpClientService: HttpClientService,
    private authService: AuthService
  ) {}

  async create(user: User): Promise<Create_User> {
    const action = user.role === 'Seller' ? 'register/seller' : 'register/customer';
    const observable = this.httpClientService.post<Create_User>(
      {
        controller: 'Users',
        action
      },
      user as any
    );
    return await firstValueFrom(observable);
  }

  async login(
    uname: string,
    password: string,
    expectedRole: 'Customer' | 'Seller' | 'Admin' = 'Customer',
    callBackFunction?: () => void
  ): Promise<tokenResponse> {
    const actionMap: Record<'Customer' | 'Seller' | 'Admin', string> = {
      Customer: 'login/customer',
      Seller: 'login/seller',
      Admin: 'login/admin'
    };

    const observable: Observable<tokenResponse> = this.httpClientService.post<tokenResponse>(
      {
        controller: 'Users',
        action: actionMap[expectedRole]
      },
      { uname, password, expectedRole }
    );

    const res: tokenResponse = await firstValueFrom(observable);
    const tokenObj = res?.token || res?.Token;
    const accessToken = tokenObj?.accessToken || (tokenObj as any)?.AccessToken;
    const role = tokenObj?.Role || tokenObj?.role || expectedRole;

    if (accessToken) {
      this.authService.setToken(accessToken, role);
      if (callBackFunction) callBackFunction();
      return res;
    }

    throw new Error(res?.Message || res?.message || 'Giriş başarısız');
  }

  googleLogin(idToken: string, role: 'Customer' | 'Seller' | 'Admin' = 'Customer'): Observable<tokenResponse> {
    const payload = {
      Provider: 'GOOGLE',
      IdToken: idToken,
      Role: role
    };
    return this.httpClientService.post<tokenResponse>(
      {
        controller: 'Users',
        action: 'GoogleLogin'
      },
      payload
    );
  }
}
