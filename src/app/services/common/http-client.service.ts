import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {
  constructor(
    private httpClient: HttpClient,
    @Inject('baseUrl') public baseUrl: string
  ) {}

 get<T>(
  requestParameter: Partial<RequestParameters>,
  id?: string,
  queryParams?: { [key: string]: any } | string 
): Observable<T> {
  let url = this.generateUrl(requestParameter, id);
  let params = new HttpParams();

  // String tipinde queryParams gelirse
  if (typeof queryParams === 'string') {
    // String'i HttpParams'a çevir
    const searchParams = new URLSearchParams(queryParams);
    searchParams.forEach((value, key) => {
      params = params.append(key, value);
    });
  } 
  // Obje tipinde queryParams gelirse
  else if (queryParams) {
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== undefined && queryParams[key] !== null) {
        params = params.append(key, queryParams[key]);
      }
    });
  }

  return this.httpClient.get<T>(url, { params });
}
  post<T>(requestParameter: Partial<RequestParameters>, body: any): Observable<T> {
    const url = this.generateUrl(requestParameter);
    return this.httpClient
      .post<T>(url, body, { headers: requestParameter.headers })
      .pipe(catchError(this.handleError));
  }
  put<T>(requestParameter: Partial<RequestParameters>, body: any, id?: string): Observable<T> {
    const url = this.generateUrl(requestParameter, id);
    return this.httpClient
      .put<T>(url, body, { headers: requestParameter.headers })
      .pipe(catchError(this.handleError));
  }
  delete<T>(requestParameter: Partial<RequestParameters>, id: string): Observable<T> {
    const url = this.generateUrl(requestParameter, id);
    return this.httpClient
      .delete<T>(url, { headers: requestParameter.headers })
      .pipe(catchError(this.handleError));
  }
  postFormData<T>(requestParameter: Partial<RequestParameters>, formData: FormData): Observable<T> {
    const url = this.generateUrl(requestParameter);
    const headers = requestParameter.headers || new HttpHeaders();
    return this.httpClient
      .post<T>(url, formData, { headers })
      .pipe(catchError(this.handleError));
  }

  putFormData<T>(requestParameter: Partial<RequestParameters>, formData: FormData, id?: string): Observable<T> {
    const url = this.generateUrl(requestParameter, id);
    const headers = requestParameter.headers || new HttpHeaders();
    return this.httpClient
      .put<T>(url, formData, { headers })
      .pipe(catchError(this.handleError));
  }

  private generateUrl(requestParameter: Partial<RequestParameters>, id?: string): string {
    let url = '';
    
    if (requestParameter.fullEndPoint) {
      url = requestParameter.fullEndPoint;
    } else {
      const baseUrl = requestParameter.baseUrl || this.baseUrl;
      url = `${baseUrl}/${requestParameter.controller}`;
      
      if (requestParameter.action) {
        url += `/${requestParameter.action}`;
      }
      
      if (id) {
        url += `/${id}`;
      }
    }
    
    return url;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Bir hata oluştu';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Hata: ${error.error.message}`;
    } else {
      errorMessage = `Hata Kodu: ${error.status}\nMesaj: ${error.message}`;
      
      if (error.error?.errors) {
        errorMessage += `\nDetaylar: ${JSON.stringify(error.error.errors)}`;
      } else if (error.error) {
        errorMessage += `\nDetaylar: ${JSON.stringify(error.error)}`;
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

export interface RequestParameters {
  controller?: string;
  action?: string;
  headers?: HttpHeaders;
  baseUrl?: string;
  fullEndPoint?: string;
}