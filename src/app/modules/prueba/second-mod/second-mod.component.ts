import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-second-mod',
  templateUrl: './second-mod.component.html',
  styleUrl: './second-mod.component.scss'
})
export class SecondModComponent implements OnInit {

  public cards: {
    title: string;
    body?: string;
    isPrimary: boolean;
    isDisabled: boolean;
  }[] = [
    {
      title: 'Tarjeta Secundaria',
      isPrimary: false,
      isDisabled: false  
    },
    {
      title: 'Tarjeta Secundaria',
      isPrimary: false,
      isDisabled: false  
    },
    {
      title: 'Tarjeta Principal',
      isPrimary: true,
      isDisabled: false
    },
    {
      title: 'Tarjeta Secundaria',
      isPrimary: false,
      isDisabled: false  
    },
    {
      title: 'Tarjeta Desactivada',
      isPrimary: true,
      isDisabled: true
    }
  ];
  
  constructor() { }

  ngOnInit() {
    
  }

  changeStatusCard(card: {
    title : string;
    body? : string;
    isPrimary : boolean;
    isDisabled : boolean;
  }) {
    card.isPrimary =!card.isPrimary;
  }


  disabledCard(card: {
    title : string;
    body? : string;
    isPrimary : boolean;
    isDisabled : boolean;
  }) {
    card.isDisabled =!card.isDisabled;
  }

}
