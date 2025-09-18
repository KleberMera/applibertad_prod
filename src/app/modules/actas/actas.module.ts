import { NgModule } from '@angular/core';
import { ActaComponent } from './acta/acta.component';
import { SharedModule } from '@shared/shared.module';
import { ActasRoutingModule } from './actas-routing.module';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TableModule } from 'primeng/table';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CalendarModule } from 'primeng/calendar';



@NgModule({
  declarations: [
    ActaComponent
  ],
  imports: [
    SharedModule,
    ActasRoutingModule,
    ButtonModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule,
    FloatLabelModule,
    CalendarModule
  ]
})
export class ActasModule { }
