import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '@data/constants/routes';
import { Observable, catchError, map, of } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ComponenteService {

  constructor(private http: HttpClient) { }


  public showLoading(message: string): void {
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
    const formData = new URLSearchParams();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.set(key, data[key]);
      }
    }
    return formData.toString();
  }
/*************************************************************************** */
  /**
   * SERVICIO QUE OBTIENE LA LISTA DE TIPOS DE COMPONENTES
   * @returns 
   */
  getComponentes(): Observable<{ 
      error: boolean, 
      msg: string, 
      data: any 
  }> {

    
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
        'Content-Type': 'application/json' // Cambiado a application/json para enviar JSON
      })
    };

    // No es necesario formatear los datos, ya que se enviarán tal como están
    const response = { error: true, msg: 'Error al insertar los datos.', data: null };

    return this.http.get<{ error: boolean, msg: string, data: any }>(
      API_ROUTES.CONSULT.CONSULT_COMPONENTES,
      //data, // Se envían los datos tal como están
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
  

  /**
     * SERVICIO QUE INGRESA EL COMPONENTE
     * @param data 
     * @returns 
     */
  insertComponente(data: any): Observable<{ 
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
    API_ROUTES.INSERT.INSERT_COMPONENTE,
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
   * SERVICIO QUE CONSULTA EL USUARIO POR CEDULA
   * @param data 
   * @returns 
   */
loadCompCod(data: any): Observable<{ error: boolean, msg: string, data: any }> {
  this.showLoading('Cargando...');
  return this.handleResponse(
    this.http.post<{ error: boolean, msg: string, data: any }>(
      API_ROUTES.CONSULT.CONSULT_COMPO_COD,
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
        }
        return response;
      })
    )
  );
}

  /**
   * SERVICOO PARA ACTUALIZAR EL COMPONENTE
   */
  updateComponente(id:number, data: any): Observable<{ 
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
    formData.set('componenteid', id.toString());
    
  
    const response = { error: true, msg: 'Error al insertar los datos.', data: null };
  
    return this.http.post<{ error: boolean, msg: string, data: any }>(
      API_ROUTES.UPDATE.UPDATE_COMPONENTE,
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
