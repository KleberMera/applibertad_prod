import { NgModule } from '@angular/core';
import { PrincipalComponent } from './principal/principal.component';
import { SharedModule } from '@shared/shared.module';
import { PruebaRoutingModule } from './prueba-routing.module';
import { ButtonModule } from 'primeng/button';
import { SecondModComponent } from './second-mod/second-mod.component';
import { CurrencyComponent } from './currency/currency.component';

// import { PruebaRouterModule } from './prueba-routing.module';




@NgModule({
  declarations: [
    PrincipalComponent,
    SecondModComponent,
    CurrencyComponent
  ],
  imports: [
    SharedModule,
    PruebaRoutingModule,
    ButtonModule
  ]
})
export class PruebaModule { }
