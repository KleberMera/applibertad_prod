import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehiculoComponent } from './vehiculo/vehiculo.component';
import { SharedModule } from '@shared/shared.module';
import { VehiculosRoutingModule } from './vehiculos-routing.modules';



@NgModule({
  declarations: [
    VehiculoComponent
  ],
  imports: [
    SharedModule,
    VehiculosRoutingModule
  ]
})
export class VehiculosModule { }
