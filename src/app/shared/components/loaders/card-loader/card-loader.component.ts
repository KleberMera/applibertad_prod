import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card-loader',
  templateUrl: './card-loader.component.html',
  styleUrl: './card-loader.component.scss'
})
export class CardLoaderComponent implements OnInit{

//Imput Style
@Input() imageSize = 75;
@Input() barHeight = 15;
@Input() bars = 1;

//Final Properties
public totalBars: {width:string}[] = [];
public finalStyleImage = {};
public finaLHeightBar = '0';

  constructor() { }

  ngOnInit(): void {

    //Calculate total bars
    for (let i = 0; i < this.bars; i++) {
      const width = Math.floor(Math.random() * (100 - 60)) + 60;
      this.totalBars.push({width: `${width}%`});
      //console.log(this.totalBars[0]);
    }
    
    //img style
    this.finalStyleImage = {
      width: `${this.imageSize}px`,
      height: `${this.imageSize}px`
    }
  
    //bar style
    this.finaLHeightBar = `${this.barHeight}px`;
  
  }

}
