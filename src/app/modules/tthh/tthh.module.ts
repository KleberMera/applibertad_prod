import { NgModule } from '@angular/core';
import { HistoriaLaboralComponent } from './historia-laboral/historia-laboral.component';
import { SharedModule } from '@shared/shared.module';
import { TthhRoutingModule } from './tthh-routing.module';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PermisosAprobadosComponent } from './siso/permisos-aprobados/permisos-aprobados.component';

import { CalendarModule } from 'primeng/calendar';
import { MarcacionesComponent } from './marcaciones/marcaciones.component';
import { RolesdepagoComponent } from './rolesdepagoindividales/rolesdepago.component';
import { PerfilComponent } from './perfil/perfil.component';
import { MarcacionesindividualesComponent } from './marcacionesindividuales/marcacionesindividuales.component';
import { RolesdepagoTTHHComponent } from './rolesdepago/rolesdepago.component';
import { FichaEmpleadoComponent } from './ficha-empleado/ficha-empleado.component';
import { EmpleadoAcademicoComponent } from './empleado-academico/empleado-academico.component';
import { EmpleadoCorreosComponent } from './empleado-correos/empleado-correos.component';
import { NovedadesRolComponent } from './novedades-rol/novedades-rol.component';
import { VerNovedadesComponent } from './ver-novedades/ver-novedades.component';

@NgModule({
  declarations: [
    HistoriaLaboralComponent,
    PermisosAprobadosComponent,
    MarcacionesComponent,
    RolesdepagoComponent,
    PerfilComponent,
    MarcacionesindividualesComponent,
    RolesdepagoTTHHComponent,
    FichaEmpleadoComponent,
    EmpleadoAcademicoComponent,
    EmpleadoCorreosComponent,
    NovedadesRolComponent,
    VerNovedadesComponent
  ],
  imports: [
    SharedModule,
    TthhRoutingModule,
    ButtonModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule,
    FloatLabelModule,
    CalendarModule
  ]
})
export class TthhModule { }
