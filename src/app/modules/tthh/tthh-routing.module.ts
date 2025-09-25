import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AuthGuard } from "@core/guards/auth.guard";
import { HistoriaLaboralComponent } from "./historia-laboral/historia-laboral.component";
import { PermisosAprobadosComponent } from "./siso/permisos-aprobados/permisos-aprobados.component";
import { MarcacionesComponent } from "./marcaciones/marcaciones.component";
import { RolesdepagoComponent } from "./rolesdepagoindividales/rolesdepago.component";
import { PerfilComponent } from "./perfil/perfil.component";
import { MarcacionesindividualesComponent } from "./marcacionesindividuales/marcacionesindividuales.component";
import { RolesdepagoTTHHComponent } from "./rolesdepago/rolesdepago.component";
import { FichaEmpleadoComponent } from "./ficha-empleado/ficha-empleado.component";
import { EmpleadoAcademicoComponent } from "./empleado-academico/empleado-academico.component";
import { EmpleadoCorreosComponent } from "./empleado-correos/empleado-correos.component";
import { NovedadesRolComponent } from "./novedades-rol/novedades-rol.component";
import { VerNovedadesComponent } from "./ver-novedades/ver-novedades.component";
import { MarcacionesObrerosComponent } from "./marcaciones-obreros/marcaciones-obreros.component";

const routes: Routes = [
    {
      path:'historia-laboral',
      component: HistoriaLaboralComponent,
      canActivate: [AuthGuard]
    },
    {
      path:'marcaciones',
      component: MarcacionesComponent,
      canActivate: [AuthGuard]
    },
    {
      //Rol de pago individual
      path:'rolesdepago',
      component: RolesdepagoComponent,
      canActivate: [AuthGuard]
    },
    {
      path:'perfil',
      component: PerfilComponent,
      canActivate: [AuthGuard]
    },
    {
      path:'marcacionesindividuales',
      component: MarcacionesindividualesComponent,
      canActivate: [AuthGuard]
    },
    {
      //Roles para TTHH
      path:'rolestthh',
      component: RolesdepagoTTHHComponent,
      canActivate: [AuthGuard]
    },
    {
      //Roles para TTHH
      path:'ficha-empleado',
      component: FichaEmpleadoComponent,
      canActivate: [AuthGuard]
    },
    {
      //Roles para TTHH
      path:'empleado-academico',
      component: EmpleadoAcademicoComponent,
      canActivate: [AuthGuard]
    },
    {
      //Roles para TTHH
      path:'empleado-correos',
      component: EmpleadoCorreosComponent,
      canActivate: [AuthGuard]
    },
    {
      path:'siso/permisos-aprobados',
      component: PermisosAprobadosComponent,
      canActivate: [AuthGuard]
    },
    {
      path:'novedades-rol',
      component: NovedadesRolComponent,
      canActivate: [AuthGuard]
    },
    {
      path:'ver-novedades',
      component: VerNovedadesComponent,
      canActivate: [AuthGuard]
    },
    {
      path:'marcaciones-obreros',
      component: MarcacionesObrerosComponent,
      canActivate: [AuthGuard]
    },
  ];

  @NgModule({
    imports: [RouterModule.forChild(routes)],

  })
  export class TthhRoutingModule { }