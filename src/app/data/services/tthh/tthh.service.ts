import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '@data/constants/routes'; // Asegúrate de tener la constante de ruta adecuada
import { Observable, catchError, map, of } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class TthhService {

  // Constructor para inyectar HttpClient
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

  // Método para obtener la relación laboral del empleado
  getEmployeeRelation(cedula: string): Observable<{ error: boolean; msg: string; data: any }> {
    // Convertir datos a formato application/x-www-form-urlencoded
    const requestData = new URLSearchParams({ cedula }).toString();

    // Configurar cabeceras HTTP
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    };

    // Enviar solicitud POST
    return this.http.post<{ error: boolean; msg: string; data: any }>(
      API_ROUTES.TTHH.CONS_REL_LAB_BYCED, // Ajusta esta ruta a tu configuración
      requestData,
      httpOptions
    ).pipe(
      map(response => {
        // Manejar la respuesta del servidor
        if (response.error === true) {
          console.error('Error:', response.msg);
        } else {
          //console.log('Datos obtenidos:', response.data);
        }
        return response;
      }),
      catchError(e => {
        // Manejar el error
        console.error('Error en la solicitud:', e);
        return of({ error: true, msg: 'Error de conexión', data: null });
      })
    );
  }

  getMarcaciones(fechaDesde: string, fechaHasta: string, cedula: string){
    this.showLoading('Cargando marcaciones...');
  
    // Crear el objeto de datos a enviar
    const data = {
      fechaDesde: fechaDesde,
      fechaHasta: fechaHasta,
      cedula: cedula
    };
  
    // Convertir a formato URL-encoded
    const body = this.toFormUrlEncoded(data);
    //console.log(body);
  
    return this.handleResponse(
      this.http.post<{ error: boolean, msg: string, data: any[] }>(
        API_ROUTES.TTHH.MARCACIONES,
        body, // Aquí pasas el cuerpo como string
        this.getHttpOptions('application/x-www-form-urlencoded') // Asegúrate de que el Content-Type es correcto
      ),
      false
    );
  }
}
