import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SolInspeccionComponent } from './informes/sol-inspeccion/sol-inspeccion.component';
import { AuthGuard } from '@core/guards/auth.guard';
import { SolicitudInspecComponent } from './informes/solicitud-inspec/solicitud-inspec.component';
import { GeneradasComponent } from './exoneraciones/generadas/generadas.component';
import { GeneradasLiquidadoresComponent } from './exoneraciones/generadas-liquidadores/generadas-liquidadores.component';

const routes: Routes = [
  {
    path:'informes/sol_recorrido',
    component: SolInspeccionComponent,
    canActivate: [AuthGuard]
  },
  {
    path:'informes/solicitud_inspeccion',
    component: SolicitudInspecComponent,
    canActivate: [AuthGuard]
  },
  {
    path:'reportes/exoneraciones_generadas',
    component: GeneradasComponent,
    canActivate: [AuthGuard]
  },
  {
    path:'reportes/exoneraciones_generadas_liquidadores',
    component: GeneradasLiquidadoresComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RentasRoutingModule { }
