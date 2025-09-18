import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoordgeneralRoutingModule } from './coordgeneral-routing.module';
import { ReportcontratosComponent } from './reportcontratos/reportcontratos.component';
import { SharedModule } from '@shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CalendarModule } from 'primeng/calendar';
import { FinancieroRoutingModule } from '@modules/financiero/financiero-routing.module';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    ReportcontratosComponent,
  ],
  imports: [
    CommonModule,
    CoordgeneralRoutingModule,
    SharedModule,
    FinancieroRoutingModule,
    ButtonModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule,
    FloatLabelModule,
    CalendarModule,
    HttpClientModule
  ]
})
export class CoordgeneralModule { }
