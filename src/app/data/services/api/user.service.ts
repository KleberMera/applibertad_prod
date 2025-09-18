import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiClass } from '@data/schema/ApiClass..class';
import { ICardUser } from '@shared/components/cards/card-user/icard-user.metadata';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService extends ApiClass {

  public title = 'Nuevo titulo';

  get getTitle(): string { 
    return this.title; 
  }
  
  setTitle(t: string){
    this.title = t;
  }

  clearTitle(){
    this.title = 'Nuevo titulo';
  }
  /**
   * 
   * Get all user from api
   */
  // getAllUsers(): Observable<{
  //   error: boolean,
  //   msg: string,
  //   data: ICardUser[]
  // }>{
  //   const response = {error: false, msg: '', data: [] as ICardUser[]};
  //   return this.http.get<ICardUser[]>(this.url + 'users')
  //   .pipe(
  //     map( r => {
  //       response.data = r;
  //       return response;
  //     }),
  //     catchError(this.error)
  //   );
  // }

  /**
   * 
   * Get all user from api
   */
  getAllUsers_(): Observable<any> {
    return this.http.get(this.url + 'users').pipe(
      catchError(error => {
        return this.error(error); // Llama a la función error para manejar el error
      })
    );
  }

  /**
   * 
   * Get one user by id
   * @param id number
   */
  // getUserById(id: Number): Observable<{
  //   error: boolean,
  //   msg: string,
  //   data: ICardUser
  // }> {
  //   const emptyUser: ICardUser = { id: 0, avatar: '', name: '', age: 0, description: '' };
  //   const response = {error: false, msg: '', data:emptyUser};
  //   return this.http.get<ICardUser>(`${this.url}users/${id}`)
  //   .pipe(
  //     map( r => {
  //       response.data = r;
  //       return response;
  //     }),
  //     catchError(this.error_id)
  //   );
  // }


  /**
   * 
   * Get one user by id
   * @param id number
   */
  getUserById_(id: Number): Observable<any> {
    return this.http.get(`${this.url}users/${id}`).pipe(
      catchError(error => {
        ////console.log('El error es servicio:' + error.codeError);
        return this.error(error);
         // Llama a la función error para manejar el error
      })
    );
  }
  

}
