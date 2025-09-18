import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '@data/constants/routes';
import { Observable, catchError, map, of } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ActaService {

  constructor(private http: HttpClient) { }

  private showLoading(message: string): void {
    Swal.fire({
      icon: 'info',
      title: message,
      text: 'Por favor, espere un momento.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  private closeLoading(): void {
    Swal.close();
  }

  private handleResponse<T>(response: Observable<T>): Observable<T> {
    return response.pipe(
      map(r => {
        this.closeLoading();
        return r;
      }),
      catchError(e => {
        this.closeLoading();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: e.error?.msg || 'Ha ocurrido un error inesperado.',
          confirmButtonText: 'Entendido'
        });
        console.error('Error al enviar datos', e);
        return of({ error: true, msg: e.error?.msg || 'Error inesperado', data: null } as any);
      })
    );
  }

  private getHttpOptions(contentType: string = 'application/x-www-form-urlencoded'): { headers: HttpHeaders, params?: HttpParams } {
    return {
      headers: new HttpHeaders({ 'Content-Type': contentType }),
      params: new HttpParams().set('rejectUnauthorized', 'false')
    };
  }

  private toFormUrlEncoded(data: any): string {
    const formData = new URLSearchParams();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.set(key, data[key]);
      }
    }
    return formData.toString();
  }


  /**
   * SERVICIO QUE INGRESA EL ACTA
   * @param data 
   * @returns 
   */
  insertActa(data: any): Observable<{ error: boolean, msg: string, data: any }> {
    this.showLoading('Enviando datos...');
    return this.handleResponse(
      this.http.post<{ error: boolean, msg: string, data: any }>(
        API_ROUTES.INSERT.INSERT_ACTAS,
        this.toFormUrlEncoded(data),
        this.getHttpOptions()
      )
    );
  }
  
}
