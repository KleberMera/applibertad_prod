import { Component, Input, OnInit } from '@angular/core';
import { ICarouselItem } from './ICarousel-item.metadata';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent implements OnInit {

  /**
   * Custom properties
   */
  @Input() height = 500;
  @Input() isFullScreeem = false;
  @Input() items: ICarouselItem[] = [];

  /**
   * Final Properties
   */
  public finalHeight: string | number = 0;
  public currentPosition = 0;

  constructor() {
    this.finalHeight = this.isFullScreeem ? '100vh' : `${this.height}px`;
    //console.log(this.finalHeight);
    
  }

  ngOnInit() {
    this.items.map( ( i, index ) => {
      i.id = index;
      i.marginLeft = 0;
    });
  }

  setCurrentPosition(position: number){
    this.currentPosition = position;
    this.items.find(i => i.id === 0)!.marginLeft= -100 * position;
    //this.items.find(i => i.id === 0).marginLeft = - 100 * position;
    // const item = this.items.find(i => i.id === 0);
    // if (item) {
    //     item.marginLeft = -100 * position;
    // } else {
    //     // console.error('No se encontró ningún elemento con el ID 0 en el array items.');
    // }
  }



  setNext(){
    let finalPercentage = 0;
    let nextPosition = this.currentPosition + 1;
    if(nextPosition <= this.items.length -1){
      finalPercentage = -100 * nextPosition;
    } else {
      nextPosition = 0;
    }
    // this.items.find( i => i.id === 0)?.marginLeft = finalPercentage;
    this.items.find( i => i.id === 0)!.marginLeft = finalPercentage;
    // const item = this.items.find(i => i.id === 0);
    // if (item) {
    //     item.marginLeft = finalPercentage;
    // } else {
    //     // console.error('No se encontró ningún elemento con el ID 0 en el array items.');
    // }
    this.currentPosition = nextPosition;
  }

  setBack() {
    let finalPercentage = 0;
    let backPosition = this.currentPosition -1;
    if (backPosition >= 0){
      finalPercentage = -100 * backPosition;
    } else {
      backPosition = this.items.length -1;
      finalPercentage = -100 * backPosition;
    }
    // this.items.find( i => i.id === 0)?.marginLeft = finalPercentage;
    this.items.find( i => i.id === 0)!.marginLeft = finalPercentage;
    // const item = this.items.find(i => i.id === 0);
    // if (item) {
    //     item.marginLeft = finalPercentage;
    // } else {
    //     // console.error('No se encontró ningún elemento con el ID 0 en el array items.');
    // }
    this.currentPosition = backPosition;  
  }
      
}
