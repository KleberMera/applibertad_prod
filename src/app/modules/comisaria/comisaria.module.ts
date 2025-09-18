import { NgModule } from '@angular/core';
import { ReppatenteComponent } from './reppatente/reppatente.component';
import { SharedModule } from '@shared/shared.module';
import { ComisariaRoutingModule } from './comisaria-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CalendarModule } from 'primeng/calendar';



@NgModule({
  declarations: [
    ReppatenteComponent
  ],
  imports: [
    SharedModule,
    ComisariaRoutingModule,
    ButtonModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule,
    FloatLabelModule,
    CalendarModule
  ]
})
export class ComisariaModule { }
