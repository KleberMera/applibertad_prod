import { Component, DoCheck, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-title-h1',
  templateUrl: './title-h1.component.html',
  styleUrl: './title-h1.component.css'
})
export class TitleH1Component implements DoCheck {

  @Input() text : string;
  @Input() type : 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'dark';
  @Input() pricePesos: number;

  @Input() data : Array<any> = [];

  public priceDollars: number;
  public priceEuros: number;

   

  constructor(){ 
    this.text = '';
    this.type = 'success';
    this.pricePesos = 0;
    this.priceDollars = 0;
    this.priceEuros = 0;
   }

   
  ngDoCheck() {
    this.priceDollars = this.pricePesos * this.getCurrentDollarFromApi();
    this.priceEuros = this.pricePesos * this.getCurrentEuroFromApi();
    // this.data.map(i => {
    //   i.isActive = true;
    // });
    // console.log(this.data);
  }

  //  ngOnChanges(c: SimpleChanges): void {
  //   // console.log(c['data']);
  //   // if (c['pricePesos'] && c['pricePesos'].currentValue){
  //   //     this.pricePesos = c['pricePesos'].currentValue;
  //   //     this.priceDollars = this.pricePesos * this.getCurrentDollarFromApi();
  //   //     this.priceEuros = this.pricePesos * this.getCurrentEuroFromApi();
  //   // }

  //   // if (c['data'] && c['data'].currentValue){
  //   //   console.log('data changes');
  //   // }
  // }

  // ngOnInit() {
  //   //console.log('ngOnInit');
  // }


   


  getCurrentDollarFromApi(){
    return 22;
  }

  getCurrentEuroFromApi(){
    return 22.5;
  }

}
