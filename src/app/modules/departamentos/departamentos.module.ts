import { NgModule } from '@angular/core';
import { DepartamentoComponent } from './departamento/departamento.component';
import { DepartamentosRoutingModule } from './departamentos-routing.module';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TableModule } from 'primeng/table';
import { SharedModule } from '@shared/shared.module';



@NgModule({
  declarations: [
    DepartamentoComponent
  ],
  imports: [
    SharedModule,
    DepartamentosRoutingModule,
    ButtonModule,
    TableModule,
    IconFieldModule,
    InputIconModule
  ]
})
export class DepartamentosModule { }
