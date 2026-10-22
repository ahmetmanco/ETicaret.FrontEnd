import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttperrorIntercepterService implements HttpInterceptor {
  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(error => {
        const backendMsg = error?.error?.message || error?.error?.Message;
        switch (error.status) {
          case HttpStatusCode.Unauthorized:
            console.warn(backendMsg || 'Yetkisiz işlem: Bu işlemi yapmaya yetkiniz yok!');
            break;
          case HttpStatusCode.InternalServerError:
            console.error(backendMsg || 'Sunucu hatası!');
            break;
          case HttpStatusCode.BadRequest:
            console.warn(backendMsg || 'Geçersiz istek!');
            break;
          case HttpStatusCode.NotFound:
            console.warn(backendMsg || 'Kayıt bulunamadı!');
            break;
        }
        return throwError(() => error);
      })
    );
  }
}
