import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '@data/constants/routes';
import { Observable, catchError, map, of } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SearchEmployeeService {

  constructor(private http: HttpClient) { }

  searchEmployee(
    data : {
      cedula : string
    }
  ): Observable<{ 
      error: boolean, 
      msg: string, 
      data: any 
  }> {

    //console.log(data);
    
    Swal.fire({
      icon: 'info',
      title: 'Cargando...',
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

    // No es necesario formatear los datos, ya que se enviarán tal como están

    const response = { error: true, msg: 'Error al consultar los datos.', data: null };

    return this.http.post<{ error: boolean, msg: string, data: any }>(
      API_ROUTES.CONSULT.CONSULT_EMPOYEESBYCED,
      data, // Se envían los datos tal como están
      httpOptions
    ).pipe(
      map(r => {
        response.error = r.error;
        response.msg = r.msg;
        response.data = r.data;

        // Cerrar el mensaje de "Enviando datos..."
        Swal.close();

        // Mostrar mensajes de éxito o error según la respuesta del servidor
        if (response.error === true) {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: response.msg,
            confirmButtonText: 'Ok'
          });
        } else {
          // Swal.fire({
          //   icon: 'success',
          //   title: '¡Datos guardados!',
          //   confirmButtonText: 'Ok'
          // });
        }

        return response;
      }),
      catchError(e => {
        // Cerrar el mensaje de "Enviando datos..."
        Swal.close();

        // Mostrar un mensaje de error en caso de error en la solicitud
        Swal.fire({
          icon: 'error',
          title: 'Error al recibir datos.',
          text: e.error.msg || 'Ha ocurrido un error inesperado.',
          confirmButtonText: 'Entendido'
        });
        console.error('Error al enviar datos', e);

        return of(response);
      })
    );
  }
}
