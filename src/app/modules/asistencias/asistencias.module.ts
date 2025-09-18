import { NgModule } from '@angular/core';
import { AsistenciaComponent } from './asistencia/asistencia.component';
import { SharedModule } from '@shared/shared.module';
import { AsistenciasRoutingModule } from './asistencias-routing.module';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';



@NgModule({
  declarations: [
    AsistenciaComponent
  ],
  imports: [
    SharedModule,
    AsistenciasRoutingModule,
    ButtonModule,
    DropdownModule 
  ]
})
export class AsistenciasModule { }
