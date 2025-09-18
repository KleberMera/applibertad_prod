import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '@data/constants/routes';
import { AuthService } from '@data/services/api/auth.service';
import { catchError, map, Observable, of } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SisoService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

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

  private handleResponse<T>(response: Observable<T>, showSuccessMessage: boolean = true): Observable<T> {
    return response.pipe(
      map((r: any) => {
        this.closeLoading();
        if (r.error) {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: r.msg || 'Ocurrió un problema.'
          });
        } else if (showSuccessMessage) {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: r.msg || 'Operación exitosa'
          });
        }
        return r;
      }),
      catchError(e => {
        this.closeLoading();
        const errorMsg = e.error?.msg || 'Ha ocurrido un error inesperado.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg
        });
        return of({ error: true, msg: errorMsg, data: null } as any);
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
 * OBTIENE PERMISOS APROBADOS DENTRO DE UN RANGO DE FECHAS
 * @param fechaDesde 
 * @param fechaHasta 
 * @returns Observable<{ error: boolean, msg: string, data: any[] }>
 */
  getPermisosAprobados(fechaDesde: string, fechaHasta: string): Observable<{ error: boolean, msg: string, data: any[] }> {
    this.showLoading('Cargando permisos aprobados...');
  
    // Crear el objeto de datos a enviar
    const data = {
      fechaDesde: fechaDesde,
      fechaHasta: fechaHasta
    };
  
    // Convertir a formato URL-encoded
    const body = this.toFormUrlEncoded(data);
    //console.log(body);
  
    return this.handleResponse(
      this.http.post<{ error: boolean, msg: string, data: any[] }>(
        API_ROUTES.TTHH.SISO.CONS_PERMISOS,
        body, // Aquí pasas el cuerpo como string
        this.getHttpOptions('application/x-www-form-urlencoded') // Asegúrate de que el Content-Type es correcto
      ),
      false
    );
  }

}
