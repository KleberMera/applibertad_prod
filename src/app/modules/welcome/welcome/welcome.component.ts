import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CONST_LOGIN_PAGE } from '@data/constants';
import { GENERAL_TEXT_CONST } from '@data/constants/general/general.text.const';

declare const FB: any;

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent implements OnInit, AfterViewInit  {
  // Define variables para el nombre del sistema y la fecha actual
  
  public systemClient: string = GENERAL_TEXT_CONST.APP.CLIENT; // Nombre del sistema
  public systemDescription: string = GENERAL_TEXT_CONST.APP.DESCRIPTION; // Nombre del sistema
  public systemName: string = GENERAL_TEXT_CONST.APP.NAME; // Nombre del sistema
  public currentDate: string = ''; // Fecha actual en formato 'dd/MM/yyyy'

  public data = CONST_LOGIN_PAGE;


  constructor(private datePipe: DatePipe) { }

  ngOnInit(): void {
    // Obtiene la fecha actual y la formatea
    // Obtiene la fecha actual y la formatea
    const today = new Date();
    this.currentDate = this.datePipe.transform(today, 'dd/MM/yyyy') ?? '';
    // this.currentDate = this.datePipe.transform(this.currentDate, 'dd/MM/yyyy') ?? '';

    // Mostrar en consola todo el contenido del localStorage
    //this.showLocalStorage();

    // Acceder al valor de roles
    this.getRolesFromLocalStorage();
  }

  ngAfterViewInit(): void {
    // 👇 Forzar el renderizado del plugin de Facebook
    if ((window as any)['FB']) {
      (window as any).FB.XFBML.parse();
    }
  }

  // Método para mostrar el contenido de localStorage en la consola
  showLocalStorage(): void {
    //console.log('Contenido de localStorage:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        const value = localStorage.getItem(key);
        //console.log(`Clave: ${key}, Valor: ${value}`);
      }
    }
  }

  // Método para obtener los roles desde localStorage
  getRolesFromLocalStorage(): void {
    const storedUser = localStorage.getItem('currentUserGADMLL');
    if (storedUser) {
      try {
        const userObject = JSON.parse(storedUser);
        if (userObject && Array.isArray(userObject.roles)) {
          //console.log('Roles:', userObject.roles);
        } else {
          //console.log('No se encontraron roles en el objeto.');
        }
      } catch (error) {
        //console.error('Error al parsear JSON:', error);
      }
    } else {
      //console.log('No se encontró el usuario en localStorage.');
    }
  }
}
