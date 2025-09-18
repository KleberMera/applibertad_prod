import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CONST_LOGIN_PAGE } from '@data/constants';
import { LEFT_NAV_MENU } from '@data/constants/left-nav-menu.const';
import { ILeftNavMenu } from '@data/interfaces';
import { AuthService } from '@data/services/api/auth.service';
import { faBars, faXmark, faAnglesLeft, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-left-nav',
  templateUrl: './left-nav.component.html',
  styleUrl: './left-nav.component.css'
})
export class LeftNavComponent implements OnInit {

  
  @Output() showMenu = new EventEmitter<any>();

  // public 
  public faBars = faBars;
  public faXmark = faXmark;
  public name = 'GAD La Libertad';
  public position = 'Gerente';
  public avatar = 'assets/img/default/avatar.jpg';
  public logo = 'assets/img/users.png';
  public menus : ILeftNavMenu[] = LEFT_NAV_MENU;
  public logoutMenu : ILeftNavMenu;

  public data = CONST_LOGIN_PAGE;

  
  constructor(
    private authService: AuthService
  ){
    this.logoutMenu = {
      title: "",
      links: [
        {
          icon: faTimes,
          name: "Cerrar sesión",
          method : () => this.authService.logout()
        }
      ]
    }
  }

  ngOnInit(){
    // Combina LEFT_NAV_MENU con logoutMenu
    //this.menus = [...LEFT_NAV_MENU, this.logoutMenu];
  }

}
