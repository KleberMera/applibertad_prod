import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

import { RentasRoutingModule } from './rentas-routing.module';
import { SolInspeccionComponent } from './informes/sol-inspeccion/sol-inspeccion.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CalendarModule } from 'primeng/calendar';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SolicitudInspecComponent } from './informes/solicitud-inspec/solicitud-inspec.component';
import { GeneradasComponent } from './exoneraciones/generadas/generadas.component';
import { GeneradasLiquidadoresComponent } from './exoneraciones/generadas-liquidadores/generadas-liquidadores.component';

@NgModule({
  declarations: [
    SolInspeccionComponent,
    SolicitudInspecComponent,
    GeneradasComponent,
    GeneradasLiquidadoresComponent
  ],
  imports: [
    CommonModule,
    RentasRoutingModule,
    ButtonModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule,
    FloatLabelModule,
    CalendarModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule
  ]
})
export class RentasModule { }
