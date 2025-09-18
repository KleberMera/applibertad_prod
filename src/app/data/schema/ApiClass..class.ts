import {HttpClient, HttpErrorResponse} from '@angular/common/http'
import { Injectable } from '@angular/core';
import { ICardUser } from '@shared/components/cards/card-user/icard-user.metadata';
import { environment } from 'environments/environment'
import { EMPTY, of, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
export class ApiClass {
    public url = environment.uri;
    public isProduction = environment.production;

    constructor(
        protected http:HttpClient
    ){ }
    
    //Manejo de un error en la respuesta si es que no viene correctamente
    // error(error:HttpErrorResponse){
    //     let errorMessage = '';
    //     if (error.error instanceof ErrorEvent) {
    //         errorMessage = error.error.message;
    //     }else{
    //         errorMessage =  `Error Code: ${error.status}\nMessage:_${error.message}`;
    //     }
    //     //return of({error: true, msg: errorMessage, data:[]});
    //     //return EMPTY;
    // }

    error(error: any) {
        let errorMessage = 'Ocurrió un error al obtener los usuarios. Por favor, inténtalo de nuevo más tarde.';
        let errorCode = -1; // Código de error predeterminado

        
        if (error instanceof HttpErrorResponse) {
            // Error HTTP
            errorMessage = `Error ${error.status}: ${error.statusText}`;
            errorCode = error.status;
        } else if (error instanceof Error) {
            // Error de JavaScript
            errorMessage = error.message;
        } else {
            // Otros tipos de errores
            errorMessage = 'Error desconocido';
        }
        
        // Devuelve un objeto que contiene el mensaje de error y el código de error
        
        //console.log('Codigo antesssss: '+ error.status);
          return throwError({ codeError: error.status, message: errorMessage });
    }


    //Manejo de un error en la respuesta si es que no viene correctamente
    // error_id(error:HttpErrorResponse){
    //     let errorMessage = '';
    //     if (error.error instanceof ErrorEvent) {
    //         errorMessage = error.error.message;
    //     }else{
    //         errorMessage =  `Error Code: ${error.status}\nMessage:_${error.message}`;
    //     }
    //     return of({error: true, msg: errorMessage, data:{id: 0, avatar: '', name: '', age: 0, description: ''}});
    //     //return EMPTY;
    // }
}
