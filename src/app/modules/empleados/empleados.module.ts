import { NgModule } from '@angular/core';
import { IngresoEmpleadosComponent } from './ingreso-empleados/ingreso-empleados.component';
import { SharedModule } from '@shared/shared.module';
import { EmpleadosRoutingModule } from './empleados-routing.module';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';





@NgModule({
  declarations: [
    IngresoEmpleadosComponent
  ],
  imports: [
    SharedModule,
    EmpleadosRoutingModule,
    FileUploadModule,
    TableModule
  ]
})
export class EmpleadosModule { }
