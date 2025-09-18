// header.component.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { INTERNAL_ROUTES } from '@data/constants/routes';
import { AuthService } from '@data/services/api/auth.service';
import { faBars, faBell, faComment, faAnglesLeft, faAnglesRight } from '@fortawesome/free-solid-svg-icons';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  @Output() showMenu = new EventEmitter<any>();
  showLeftIcon: boolean = true;

  public faBell = faBell;
  public faBars = faBars;
  public faComment = faComment;
  public faAnglesLeft = faAnglesLeft;
  public faAnglesRight = faAnglesRight;
  public avatar: string | undefined;
  public avatarInitials: string | undefined;
  public logo = 'assets/img/default/logo.png';
  isLoggedIn = false;

  // Menú de opciones corregido
  items: MenuItem[] = [
    {
      label: 'Cambiar Contraseña',
      icon: 'pi pi-key',
      styleClass: 'opciones',
      command: (event) => {
        event?.originalEvent?.preventDefault();
        this.changePassword();
      }
    },
    {
      separator: true
    },
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      styleClass: 'opciones',
      command: (event) => {
        event?.originalEvent?.preventDefault();
        this.logout();
      }
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    const userDataString = sessionStorage.getItem('currentUserGADMLL');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const username = userData.EMPLEADO;
      if (username) {
        this.avatarInitials = username.toLowerCase();
        this.isLoggedIn = true;
      }
    }
  }

  toggleIcons() {
    if (window.innerWidth <= 900) {
      this.showLeftIcon = false;
    } else {
      this.showLeftIcon = !this.showLeftIcon;
    }
  }

  generateAvatarFromInitials(initials: string): string {
    return `https://ui-avatars.com/api/?name=${initials}&background=random`;
  }

  changePassword() {
    console.log('Navegando a cambiar contraseña...');
    console.log('Ruta:', INTERNAL_ROUTES.PANEL_CHANGE_PASSWORD);
    
    // Usar setTimeout para asegurar que el menú se cierre primero
    setTimeout(() => {
      this.router.navigate([INTERNAL_ROUTES.PANEL_CHANGE_PASSWORD])
        .then(success => {
          console.log('Navegación exitosa:', success);
        })
        .catch(error => {
          console.error('Error en navegación:', error);
        });
    }, 100);
  }

  logout() {
    console.log('Cerrando sesión...');
    setTimeout(() => {
      this.authService.logout();
    }, 100);
  }

  ngOnInit() {
    // Inicialización adicional si es necesaria
    this.toggleIcons;
  }
}