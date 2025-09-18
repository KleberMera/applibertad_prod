import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '@data/constants/routes';
import { Observable, catchError, map, of } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class InsertEstadosService {

  constructor(private http: HttpClient) { }

  insertEstado(data: any): Observable<{ 
      error: boolean, 
      msg: string, 
      data: any 
  }> {

    //console.log('Datos enviados al backend:', data); // Agregar este registro


    Swal.fire({
      icon: 'info',
      title: 'Enviando datos...',
      text: 'Por favor, espere un momento.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // Mostrar el loader
      }
    });

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      params: new HttpParams().set('rejectUnauthorized', 'false') // Ignorar la verificación del certificado SSL
    };

    // Codificar los datos en formato application/x-www-form-urlencoded
    const formData = new URLSearchParams();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.set(key, data[key]);
      }
    }

    const response = { error: true, msg: 'Error al insertar los datos.', data: null };

    return this.http.post<{ error: boolean, msg: string, data: any }>(
      API_ROUTES.INSERT.INSERT_ESTADOS,
      formData.toString(), // Convertir los datos a una cadena de texto
      httpOptions
    ).pipe(
      map(r => {
        response.error = r.error;
        response.msg = r.msg;
        response.data = r.data;

        Swal.close();

        if (response.error === true) {
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
      }),
      catchError(e => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error al enviar datos.',
          text: e.error?.msg || 'Ha ocurrido un error inesperado.',
          confirmButtonText: 'Entendido'
        });
        console.error('Error al enviar datos', e);

        return of(response);
      })
    );
  }



  /**
   * SERVICOO PARA ACTUALIZAR EL ESTADO
   */
  updateEstado(id:number, data: any): Observable<{ 
    error: boolean, 
    msg: string, 
    data: any 
  }> {
  
    //console.log('Datos enviados al backend:', data); // Agregar este registro
  
  
    Swal.fire({
      icon: 'info',
      title: 'Enviando datos...',
      text: 'Por favor, espere un momento.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // Mostrar el loader
      }
    });
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      params: new HttpParams().set('rejectUnauthorized', 'false') // Ignorar la verificación del certificado SSL
    };
  
    // Codificar los datos en formato application/x-www-form-urlencoded
    const formData = new URLSearchParams();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.set(key, data[key]);
      }
    }
    formData.set('estadoId', id.toString());
  
    const response = { error: true, msg: 'Error al insertar los datos.', data: null };
  
    return this.http.post<{ error: boolean, msg: string, data: any }>(
      API_ROUTES.UPDATE.UPDATE_ESTADO,
      formData.toString(), // Convertir los datos a una cadena de texto
      httpOptions
    ).pipe(
      map(r => {
        response.error = r.error;
        response.msg = r.msg;
        response.data = r.data;
  
        Swal.close();
  
        if (response.error === true) {
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
      }),
      catchError(e => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error al enviar datos.',
          text: e.error?.msg || 'Ha ocurrido un error inesperado.',
          confirmButtonText: 'Entendido'
        });
        console.error('Error al enviar datos', e);
  
        return of(response);
      })
    );
  }
  

}
