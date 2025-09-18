// import { Component, Input, OnInit } from '@angular/core';
// import { ILeftNavMenu } from '@data/interfaces';

// @Component({
//   selector: 'app-left-nav-menu',
//   templateUrl: './left-nav-menu.component.html',
//   styleUrl: './left-nav-menu.component.scss'
// })
// export class LeftNavMenuComponent implements OnInit {

//   @Input() data: ILeftNavMenu | undefined;
//   constructor() { }

//   ngOnInit(): void {
    
//   }

// }


// left-nav-menu.component.ts
// import { Component, Input, OnInit } from '@angular/core';
// import { ILeftNavMenu } from '@data/interfaces';
// import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";


// @Component({
//   selector: 'app-left-nav-menu',
//   templateUrl: './left-nav-menu.component.html',
//   styleUrls: ['./left-nav-menu.component.scss'] // Asegúrate de que esta sea la extensión correcta
// })
// export class LeftNavMenuComponent implements OnInit {
//   @Input() data: ILeftNavMenu | undefined;
//   public faChevronDown = faChevronDown;
//   public faChevronUp = faChevronUp;

//   expandedLink: any = null;

//   constructor() {}

//   ngOnInit(): void {}

//   toggleSubmenu(link: any): void {
//     this.expandedLink = this.expandedLink === link ? null : link;
//   }
// }

import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ILeftNavMenu } from '@data/interfaces';
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { AuthService } from '@data/services/api/auth.service'; // Nueva línea


@Component({
  selector: 'app-left-nav-menu',
  templateUrl: './left-nav-menu.component.html',
  styleUrls: ['./left-nav-menu.component.scss']
})
export class LeftNavMenuComponent implements OnInit {
  @Input() data: ILeftNavMenu | undefined;
  public faChevronDown = faChevronDown;
  public faChevronUp = faChevronUp;
  
  public filteredMenu: ILeftNavMenu['links'] = []; // Nueva línea
  public isAuthorized: boolean = false;


  expandedLink: any = null;

  constructor(
    private router: Router, 
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.filterMenuByRole(); // Filtra el menú al inicializar el componente
    this.checkAuthorization();
  }

  checkAuthorization(): void {
    const userRole = this.authService.getUserRole();
    if (!userRole || !this.data) return;

    // Verificar si el título del menú está autorizado
    // this.isAuthorized = this.data.roles ? this.data.roles.includes(userRole) : true;
    //Cambio para aceptar más de un rol
    this.isAuthorized = this.data.roles
      ? userRole.some(role => this.data?.roles?.includes(role))
      : true
  }


  filterMenuByRole(): void {
    const userRole = this.authService.getUserRole();

    if (!userRole || !this.data?.links) return;

    this.filteredMenu = this.data.links
      .filter(link => 
        link.roles ? userRole.some(role => link.roles?.includes(role)) : false
      )
      .map(link => {
          if(link.subLinks){
            link.subLinks = link.subLinks.filter(subLink =>
              subLink.roles ? userRole.some(role => subLink.roles?.includes(role)) : false
            );
          }
          return link;
        } 
      );
    // this.filteredMenu = this.data.links.filter(link =>
    //   link.roles ? link.roles.includes(userRole) : false
    // ).map(link => {
    //   if (link.subLinks) {
    //     link.subLinks = link.subLinks.filter(subLink => subLink.roles ? subLink.roles.includes(userRole) : false);
    //   }
    //   return link;
    // });

    // Incluye logoutMenu si está definido
    // if (this.data?.title === 'Logout') {
    //   this.filteredMenu.push(...this.data.links);
    // }
  }

  handleLinkClick(link: any): void {
    if (link.subLinks) {
      this.toggleSubmenu(link); // Maneja la expansión del submenú
    } else if (link.method) {
      link.method(); // Llama al método si está definido (como cerrar sesión)
    } else if (link.link) {
      this.router.navigate([link.link]); // Navega a la ruta si está definida3
    }
  }

  toggleSubmenu(link: any): void {
    this.expandedLink = this.expandedLink === link ? null : link;
  }
}




