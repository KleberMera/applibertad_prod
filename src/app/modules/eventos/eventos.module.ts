import { NgModule } from '@angular/core';
import { EventoComponent } from './evento/evento.component';
import { EventosRoutingModule } from './eventos-routing.module';
import { SharedModule } from '@shared/shared.module';
import { CalendarModule } from 'primeng/calendar';



@NgModule({
  declarations: [
    EventoComponent
  ],
  imports: [
    SharedModule,
    EventosRoutingModule,
    CalendarModule 
  ]
})
export class EventosModule { }
