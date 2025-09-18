import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepdiarioCmComponent } from './informes/repdiario-cm/repdiario-cm.component';
import { FinancieroRoutingModule } from './financiero-routing.module';

import { SharedModule } from '@shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CalendarModule } from 'primeng/calendar';
import { RepdiariofechaCmComponent } from './informes/repdiariofecha-cm/repdiariofecha-cm.component';




@NgModule({
  declarations: [
    RepdiarioCmComponent,
    RepdiariofechaCmComponent
  ],
  imports: [
    SharedModule,
    FinancieroRoutingModule,
    ButtonModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule,
    FloatLabelModule,
    CalendarModule
  ]
})
export class FinancieroModule { }
