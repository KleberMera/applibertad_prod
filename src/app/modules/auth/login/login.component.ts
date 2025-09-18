import { Component, OnInit } from '@angular/core';
import { CONST_LOGIN_PAGE, ERROR_VALIDATIONS } from '@data/constants';
import { IMAGE_ROUTES } from '@data/constants/routes/images.routes';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  
  public data = CONST_LOGIN_PAGE;

  currentYear: number = new Date().getFullYear();
}
