import { NgModule } from '@angular/core';
import { ListaEstadosComponent } from './lista-estados/lista-estados.component';
import { SharedModule } from '@shared/shared.module';
import { EstadosRoutingModule } from './estados-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';



@NgModule({
  declarations: [
    ListaEstadosComponent
  ],
  imports: [
    SharedModule,
    EstadosRoutingModule,
    ButtonModule,
    TableModule,
    IconFieldModule,
    InputIconModule
  ]
})
export class EstadosModule { }
