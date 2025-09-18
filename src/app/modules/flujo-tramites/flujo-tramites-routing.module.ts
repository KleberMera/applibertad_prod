import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IngresoRecepcionComponent } from './ingreso-recepcion/ingreso-recepcion.component';
import { AuthGuard } from '@core/guards/auth.guard';
import { TramiteInternoComponent } from './tramite-interno/tramite-interno.component';

const routes: Routes = [
    {
      path:'tramite-externo',
      component: IngresoRecepcionComponent,
      canActivate: [AuthGuard]
    },
    {
      path:'tramite-interno',
      component: TramiteInternoComponent,
      canActivate: [AuthGuard]
    },
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlujoTramitesRoutingModule { }
