import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from "@angular/router";

import { FlujoTramitesRoutingModule } from './flujo-tramites-routing.module';
import { IngresoRecepcionComponent } from './ingreso-recepcion/ingreso-recepcion.component';
import { TramiteInternoComponent } from './tramite-interno/tramite-interno.component';

import { SharedModule } from '@shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';

@NgModule({
  declarations: [
    IngresoRecepcionComponent,
    TramiteInternoComponent
  ],
  imports: [
    CommonModule,
    FlujoTramitesRoutingModule,
    SharedModule,
    ButtonModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule,
    FloatLabelModule,
    CalendarModule,
    FileUploadModule,
    CheckboxModule
  ]
})
export class FlujoTramitesModule { }
