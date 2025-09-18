import { NgModule } from '@angular/core';
import { ClientesListComponent } from './clientes-list/clientes-list.component';
import { SharedModule } from '@shared/shared.module';
import { ClientesRoutingModule } from './clientes-routing.module';



@NgModule({
  declarations: [
    ClientesListComponent
  ],
  imports: [
    SharedModule,
    ClientesRoutingModule
  ]
})
export class ClientesModule { }
