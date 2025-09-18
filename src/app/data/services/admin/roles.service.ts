import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '@data/constants/routes';
import { catchError, map, Observable, of } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../api/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

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
    // const formData = new URLSearchParams();
    // for (const key in data) {
    //   if (data.hasOwnProperty(key)) {
    //     formData.set(key, data[key]);
    //   }
    // }
    // return formData.toString();
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
   * SERVICIO QUE OBTIENE LA LISTA DE ROLES
   * @returns 
   */
  getRoles(): Observable<{ error: boolean, msg: string, data: any }> {
    this.showLoading('Cargando...');
    return this.handleResponse(
      this.http.get<{ error: boolean, msg: string, data: any }>(
        API_ROUTES.ADMIN.CONS_ROLES,
        this.getHttpOptions()
      ).pipe(
        map(response => {
          if (response.error) {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: response.msg,
              confirmButtonText: 'Ok'
            });
          }
          return response;
        })
      )
    );
  }


  /**
   * SERVICIO QUE OBTIENE LA LISTA DE ROLES PARA DROPDOWN
   * @returns 
   */
  getRolesShort(): Observable<{ error: boolean, msg: string, data: any }> {
    this.showLoading('Cargando...');
    return this.handleResponse(
      this.http.get<{ error: boolean, msg: string, data: any }>(
        API_ROUTES.ADMIN.CONS_ROLES_SHORT,
        this.getHttpOptions()
      ).pipe(
        map(response => {
          if (response.error) {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: response.msg,
              confirmButtonText: 'Ok'
            });
          }
          return response;
        })
      )
    );
  }

  /**
   * SERVICIO QUE INGRESA EL ROL
   * @param data 
   * @returns 
   */
  insertRol(data: any): Observable<{ error: boolean, msg: string, data: any }> {
    // Obtén el usuario desde el local storage
    const user = this.authService.getUserFromLocalStorage();

    if (user) {
      // Añade el parámetro createdBy al objeto data
      data.createdBy = user.username; // Asume que el campo `username` es el que quieres usar. Ajusta si es necesario.
    } else {
      console.error('No se encontró el usuario en el local storage.');
      // Maneja el caso en que el usuario no está en el local storage si es necesario.
    }
    //console.log("Datos a enviar : ", data);
    return this.http.post<{ error: boolean, msg: string, data: any }>(
      API_ROUTES.ADMIN.INSERT_ROL,
      this.toFormUrlEncoded(data),
      this.getHttpOptions('application/x-www-form-urlencoded')
    ).pipe(
      map(response => {
        if (response.error) {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: response.msg,
            confirmButtonText: 'Ok'
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: '¡Datos guardados!',
            confirmButtonText: 'Ok'
          });
        }
        return response;
      })
    );
  }


  // /**
  //  * SERVICIO QUE CONSULTA EL USUARIO POR CEDULA
  //  * @param data 
  //  * @returns 
  //  */
  // loadUsuarioCed(data: any): Observable<{ error: boolean, msg: string, data: any }> {
  //   this.showLoading('Cargando...');
  //   return this.handleResponse(
  //     this.http.post<{ error: boolean, msg: string, data: any }>(
  //       API_ROUTES.CONSULT.CONSULT_USER_BYCED,
  //       this.toFormUrlEncoded(data),
  //       this.getHttpOptions('application/x-www-form-urlencoded')
  //     ).pipe(
  //       map(response => {
  //         if (response.error) {
  //           Swal.fire({
  //             icon: 'error',
  //             title: 'Error!',
  //             text: response.msg,
  //             confirmButtonText: 'Ok'
  //           });
  //         }
  //         return response;
  //       })
  //     )
  //   );
  // }


  /**
   * Servicio para actulizar el ROL
   * @param roleId 
   * @param data 
   * @returns 
   */
  updateRol(roleId: number, data: any): Observable<{ error: boolean, msg: string, data: any }> {
    this.showLoading('Enviando datos...');
    data.roleId = roleId.toString();  // Adding user ID to data
    return this.handleResponse(
      this.http.put<{ error: boolean, msg: string, data: any }>(
        API_ROUTES.ADMIN.UPDATE_ROL,
        this.toFormUrlEncoded(data),
        this.getHttpOptions('application/x-www-form-urlencoded')
      ).pipe(
        map(response => {
          if (response.error) {
            //console.log("entro a error servicio");
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: response.msg,
              confirmButtonText: 'Ok'
            });
          } else {
            Swal.fire({
              icon: 'success',
              title: 'Rol actualizado!',
              confirmButtonText: 'Ok'
            });
          }
          return response;
        })
      )
    );
  }
}
