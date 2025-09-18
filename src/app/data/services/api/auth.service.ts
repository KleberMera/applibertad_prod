import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ERROR_CONST } from '@data/constants';
import { API_ROUTES, INTERNAL_ROUTES } from '@data/constants/routes';
import { IApiUserAtenticated } from '@data/interfaces';
import { md5 } from 'js-md5';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //public currentUser : BehaviorSubject<IApiUserAtenticated>;
  public currentUser: BehaviorSubject<IApiUserAtenticated | null>

  public nameUserLS = 'currentUserGADMLL';

   // Nuevo: Propiedades para el temporizador
   private timeoutId: any;
   private readonly timeout: number = 20 * 60 * 1000; // 30 minutos de inactividad

  constructor(
    private http : HttpClient,
    private router : Router
  ) { 
    //const storedUser = localStorage.getItem(this.nameUserLS);
    this.currentUser = new BehaviorSubject(
      JSON.parse(sessionStorage.getItem(this.nameUserLS)  || 'null')
      // storedUser ? JSON.parse(storedUser) : null
    );

    // Iniciar el temporizador al construir el servicio
     this.startTimer();
     this.initListener();
  }

   // Nuevo: Métodos para manejar el temporizador
   private startTimer() {
    this.timeoutId = setTimeout(() => this.logout(), this.timeout);
  }

  private resetTimer() {
    clearTimeout(this.timeoutId);
    this.startTimer();
  }

  public initListener() {
    document.addEventListener('mousemove', () => this.resetTimer());
    document.addEventListener('keydown', () => this.resetTimer());
    document.addEventListener('click', () => this.resetTimer());
  }

  get getUser(): IApiUserAtenticated | null {
    return this.currentUser.value;
  }

  login(data: { user: string; password: string }): Observable<{ error: boolean; msg: string; data: any }> {
    // Mostrar mensaje de "Iniciando sesión"
    Swal.fire({
      icon: 'info',
      title: 'Iniciando sesión...',
      text: 'Por favor, espere un momento.',
      showConfirmButton: false,
      allowOutsideClick: false
    });

    // Convertir datos a formato application/x-www-form-urlencoded
    const requestData = new URLSearchParams({
      username: data.user,
      password: data.password
    }).toString();

    // Configurar cabeceras HTTP
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      params: {
        rejectUnauthorized: 'false' // Ignorar la verificación del certificado SSL
      }
    };

    // Enviar solicitud POST
    return this.http.post<{ error: boolean; msg: string; data: any }>(
      API_ROUTES.AUTH.LOGIN,
      requestData,
      httpOptions
    ).pipe(
      map(response => {
        // Cerrar mensaje de "Iniciando sesión"
        //console.log('Respuesta completa del login:', response);
        //console.log('Datos del usuario (response.data):', response.data);
        Swal.close();

        // Manejar la respuesta del servidor
        if (response.error === true) {
          Swal.fire({
            icon: 'error',
            title: 'Error de inicio de sesión',
            text: response.msg,
            confirmButtonText: 'Ok'
          });
        } else {

          // Guardar datos del usuario en localStorage
          this.setUserToLocalStorage(response.data);

          // Actualizar BehaviorSubject
          this.currentUser.next(response.data);

          const user = response.data;
          
          Swal.fire({
            icon: 'success',
            title: '¡Inicio de sesión exitoso!',
            text: 'Redirigiendo al panel de usuario.',
            timer: 2500,
            timerProgressBar: true,
            allowOutsideClick: false,
            didClose: () => {
              //console.log('RESET_PASSWORD:', user.RESET_PASSWORD, typeof user.RESET_PASSWORD);
              if (Number(user.RESET_PASSWORD) === 1) {
                this.router.navigateByUrl('/panel/admin/changePassword');
              } else {
                this.router.navigateByUrl(INTERNAL_ROUTES.PANEL_WELCOME);
              }
            }
          });
        }
        return response;
      }),
      catchError(e => {
        // Cerrar mensaje de "Iniciando sesión"
        Swal.close();

        // Mostrar mensaje de error personalizado
        Swal.fire({
          icon: 'error',
          title: 'Error de inicio de sesión',
          text: e.error.msg,
          confirmButtonText: 'Entendido'
        });
        return of({ error: true, msg: 'Error de conexión', data: null });
      })
    );
  }

  // Función para serializar los datos a formato x-www-form-urlencoded
  serializeData(data: any): string {
    const encodedString = Object.keys(data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).join('&');
    return encodedString;
  }
  
  logout(): void {
    sessionStorage.removeItem(this.nameUserLS);
    //localStorage.removeItem(this.nameUserLS);
    this.currentUser.next(null);
    this.router.navigateByUrl(INTERNAL_ROUTES.AUTH_LOGIN);
  }

  private setUserToLocalStorage(user : IApiUserAtenticated){
    sessionStorage.setItem(this.nameUserLS, JSON.stringify(user));
    // localStorage.setItem(this.nameUserLS, JSON.stringify(user));
  }

   // Función para cifrar la contraseña utilizando MD5
  encryptPassword(password: string): string {
    return md5(password);
  }

  // En el AuthService
  getUserFromLocalStorage(): IApiUserAtenticated | null {
    const storedUser = sessionStorage.getItem(this.nameUserLS);
    return storedUser ? JSON.parse(storedUser) as IApiUserAtenticated : null;
  }

  // getUserRole(): string | null {
  //   const user = this.currentUser.value;
  //   return user?.roles ? user.roles[0] : null; // Asume que solo hay un rol por usuario
  // }

  getUserRole(): string[] | null {
    const user = this.currentUser.value;
    return user?.roles ?? null;
  }



}
