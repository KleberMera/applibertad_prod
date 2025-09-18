import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '@data/constants/routes';
import { catchError, map, Observable, of } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../api/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Nuevo método para mostrar alerta de carga
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

  // Nuevo método para manejar la respuesta del backend
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
        //console.error('Error al enviar datos', e);
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


  // Servicio para obtener datos de usuario por cédula
  getUserDataByCedula(cedula: string): Observable<{ error: boolean, msg: string, data: any }> {
    this.showLoading('Cargando datos del usuario...');
    const data = { cedula };

    return this.handleResponse(
      this.http.post<{ error: boolean, msg: string, data: any }>(
        API_ROUTES.ADMIN.CONS_DATA_USER, //http://ip/
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
              title: 'Datos obtenidos!',
              confirmButtonText: 'Ok'
            });
          }
          return response;
        })
      )
    );
  }

  getContribuDataByCedula(cedula: string): Observable<{ error: boolean, msg: string, data: any }> {
    this.showLoading('Cargando datos del usuario...');
    const data = { cedula };

    return this.handleResponse(
      this.http.post<{ error: boolean, msg: string, data: any }>(
        API_ROUTES.ALCALDIA.GET_CONTRIBUYENTE,
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
              title: 'Datos obtenidos!',
              confirmButtonText: 'Ok'
            });
          }
          return response;
        })
      )
    );
  }


   /**
     * SERVICIO QUE INGRESA EL USUARIO
     * @param data 
     * @returns 
     */
   insertUser(data: any): Observable<{ error: boolean, msg: string, data: any }> {
    // Obtén el usuario desde el local storage
      const user = this.authService.getUserFromLocalStorage();
    
      if (user) {
        // Añade el parámetro createdBy al objeto data
        data.createdBy = user.username; // Asume que el campo `username` es el que quieres usar. Ajusta si es necesario.
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'No se encontró el usuario en el local storage.',
          confirmButtonText: 'Ok'
        });
        //console.error('No se encontró el usuario en el local storage.');
        // Maneja el caso en que el usuario no está en el local storage si es necesario.
      }
      //console.log("Datos a enviar : ", data);
      return this.http.post<{ error: boolean, msg: string, data: any }>(
        API_ROUTES.ADMIN.INSERT_USER,
        this.toFormUrlEncoded(data),
        this.getHttpOptions('application/x-www-form-urlencoded')
      ).pipe(
        map(response => {
          //console.log("error: ", response.error);
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


    getAllUsers(): Observable<{ error: boolean, msg: string, data: any }> {
      this.showLoading('Cargando usuarios...');
    
      return this.handleResponse(
        this.http.get<{ error: boolean, msg: string, data: any }>(
          API_ROUTES.ADMIN.CONS_USERS,
          this.getHttpOptions('application/json')
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
                title: 'Usuarios obtenidos!',
                confirmButtonText: 'Ok'
              });
            }
            return response;
          }),
          catchError(err => {
            Swal.fire({
              icon: 'error',
              title: 'Error de red',
              text: 'No se pudo conectar con el servidor.',
              confirmButtonText: 'Ok'
            });
            console.error('Error en la solicitud HTTP:', err);
            return of({ error: true, msg: 'Error de red', data: null });
          })
        )
      );
    }

    getUsersRoles(): Observable<{ error: boolean, msg: string, data: any }> {
      this.showLoading('Cargando usuarios...');
    
      return this.handleResponse(
        this.http.get<{ error: boolean, msg: string, data: any }>(
          API_ROUTES.ADMIN.CONS_USERS_ROLES,
          this.getHttpOptions('application/json')
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
                title: 'Usuarios obtenidos!',
                confirmButtonText: 'Ok'
              });
            }
            return response;
          }),
          catchError(err => {
            Swal.fire({
              icon: 'error',
              title: 'Error de red',
              text: 'No se pudo conectar con el servidor.',
              confirmButtonText: 'Ok'
            });
            console.error('Error en la solicitud HTTP:', err);
            return of({ error: true, msg: 'Error de red', data: null });
          })
        )
      );
    }

    getListaTramites(): Observable<{ error: boolean, msg: string, data: any[] }> {
      return this.http.get<{ error: boolean, msg: string, data: any[] }>(
        API_ROUTES.ALCALDIA.LISTAR_TRAMITES,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
          })
        }
      ).pipe(
        catchError(err => {
          console.error('Error en la solicitud HTTP:', err);
          return of({ error: true, msg: 'Error de red', data: [] });
        })
      );
    }

    getDetalleTramite(numeroTramite: string): Observable<{ error: boolean, msg: string, data: any[] }> {
      const url = API_ROUTES.ALCALDIA.DETALLE_TRAMITES;
      
      const body = new HttpParams()
        .set('numeroTramite', numeroTramite);
    
      const headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      });
    
      return this.http.post<{ error: boolean, msg: string, data: any[] }>(url, body.toString(), { headers }).pipe(
        catchError(err => {
          console.error('Error al obtener detalle de trámite:', err);
          return of({ error: true, msg: 'Error al obtener detalle', data: [] });
        })
      );
    }    

    getDepartamentos(): Observable<{ error: boolean, msg: string, data: any }> {
      this.showLoading('Cargando Departamentos...');
    
      return this.handleResponse(
        this.http.get<{ error: boolean, msg: string, data: any }>(
          API_ROUTES.ALCALDIA.GET_DEPARTAMENTOS
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
                title: 'Usuarios obtenidos!',
                confirmButtonText: 'Ok'
              });
            }
            return response;
          }),
          catchError(err => {
            Swal.fire({
              icon: 'error',
              title: 'Error de red',
              text: 'No se pudo conectar con el servidor.',
              confirmButtonText: 'Ok'
            });
            console.error('Error en la solicitud HTTP:', err);
            return of({ error: true, msg: 'Error de red', data: null });
          })
        )
      );
    }

    getNumTramite(): Observable<{ error: boolean, msg: string, data: any }> {
      this.showLoading('Cargando Número de trámite...');
    
      const body = new HttpParams()
        .set('idDepartamento', '1')
        .set('tipoTramite', 'LLTRE'); // puedes cambiar por valor dinámico si lo necesitas
    
      return this.handleResponse(
        this.http.post<{ error: boolean, msg: string, data: any }>(
          API_ROUTES.ALCALDIA.GET_NUMTRAMITE,
          body.toString(),
          {
            headers: new HttpHeaders({
              'Content-Type': 'application/x-www-form-urlencoded'
            })
          }
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
                title: 'Trámite obtenido!',
                confirmButtonText: 'Ok'
              });
            }
            return response;
          }),
          catchError(err => {
            Swal.fire({
              icon: 'error',
              title: 'Error de red',
              text: 'No se pudo conectar con el servidor.',
              confirmButtonText: 'Ok'
            });
            console.error('Error en la solicitud HTTP:', err);
            return of({ error: true, msg: 'Error de red', data: null });
          })
        )
      );
    }       

    // Servicio para cambiar la contraseña
    changePassword(oldPassword: string, newPassword: string): Observable<{ error: boolean, msg: string, data: any }> {
      const user = this.authService.getUserFromLocalStorage();
  
      if (!user || !user.username) {
        return of({ error: true, msg: 'Usuario no encontrado', data: null });
      }
  
      this.showLoading('Cambiando la contraseña...');
  
      const data = { username: user.username, oldPassword, newPassword };
  
      return this.http.put<{ error: boolean, msg: string, data: any }>(
        API_ROUTES.ADMIN.CHANGE_PASSWORD,
        this.toFormUrlEncoded(data),
        this.getHttpOptions('application/x-www-form-urlencoded')
      ).pipe(
        map(response => {
          this.closeLoading();  // Solo se esconde el loading, sin mostrar mensajes.
          return response;  // Devuelve la respuesta para que el componente la maneje.
        }),
        catchError(err => {
          this.closeLoading();
          // Devuelve un error genérico que será gestionado por el componente.
          return of({ error: true, msg: 'Error de red o del servidor.', data: null });
        })
      );
    }
  

}
