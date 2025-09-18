import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../api/auth.service';
import Swal from 'sweetalert2';
import { catchError, map, Observable, of } from 'rxjs';
import { API_ROUTES } from '@data/constants/routes';

@Injectable({
  providedIn: 'root'
})
export class ComisariaService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {  }

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

  private getHttpOptions(contentType: string = 'application/json'): { headers: HttpHeaders, params?: HttpParams } {
    return {
      headers: new HttpHeaders({ 'Content-Type': contentType }),
      params: new HttpParams().set('rejectUnauthorized', 'false')
    };
  }

  private toFormUrlEncoded(data: any): string {
    let formBody: string[] = [];
    for (let property in data) {
        if (data.hasOwnProperty(property)) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(data[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
    }
    return formBody.join("&");
  }

  /**
   * SERVICIO QUE OBTIENE EL REPORTE DE PANTENTE Y PERMISO DE FUNCIONAMIENTO
   * @returns Observable<{ error: boolean, msg: string, data: any }>
   */
  getRepPatente(): Observable<{ error: boolean, msg: string, data: any }> {
    this.showLoading('Cargando...');
    // const body = this.toFormUrlEncoded({ fecha });

    return this.handleResponse(
      this.http.get<{ error: boolean, msg: string, data: any }>(
        API_ROUTES.COMISARIA.REP_PATENTE, // Asegúrate de que esta ruta sea correcta
        // body,
        this.getHttpOptions('application/x-www-form-urlencoded') // Especifica el Content-Type como 'application/x-www-form-urlencoded'
      )
    );
  }
}
