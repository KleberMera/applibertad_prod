import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.scss'
})
export class PrincipalComponent implements OnInit {
  
public style  = {
  background:'red'
};
public isShow = false;
public msg = '';

  constructor() { }
  
  ngOnInit(){
    
  }

  showError(){
    this.style.background = 'red';
    this.msg = 'Hubo un error!';
    this.isShow = true;
  }

  showSuccess(){
    this.style.background = 'green';
    this.msg = 'El envio fue exitoso!';
    this.isShow = true;
  }

}
