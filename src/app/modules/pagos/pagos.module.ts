import { NgModule } from '@angular/core';
import { PagoComponent } from './pago/pago.component';
import { SharedModule } from '@shared/shared.module';
import { PagosRoutingModule } from './pagos-routing.module';



@NgModule({
  declarations: [
    PagoComponent
  ],
  imports: [
    SharedModule,
    PagosRoutingModule
  ]
})
export class PagosModule { }
