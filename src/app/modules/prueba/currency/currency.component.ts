import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UserService } from '@data/services/api/user.service';

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrl: './currency.component.scss'
})
export class CurrencyComponent implements OnInit, AfterViewInit {

  public title: string;
  //public userService!: UserService;
  public pricePesos : number;
  public obj : any;

  public stringVar : string;
  public dateVar : number;
  public currencyVar : number;
  public decimalVar : number;

  public user : {
    name: string;
    role: string;
    gender: 'M' | 'F';
  }

  constructor(
    private userService : UserService,
  ) {
    this.stringVar = 'Hola este es un curso de angular';
    this.dateVar = (new Date()).getTime();;
    this.currencyVar = 123456.20;
    this.decimalVar = 3.21545864;
    this.title = 'Currency';
    //this.title = this.userService.getTitle;
    this.pricePesos = 0;
    this.obj = [{id:1, name: 'Primero', joinDate: 1599935113003},
                {id:1, name: 'Primero', joinDate: 1599935113003}
               ];

    this.user = {
      name: 'Leo Tomalá',
      role: 'Admin',
      gender: 'M'
    }
  }



  ngOnInit() {
    //console.log('OnInit - Currency');
  }

  ngAfterViewInit(){
    //console.log('AfterViewInit - Currency');
  }

  addAmount(){
    this.pricePesos += 10;
  }

}
