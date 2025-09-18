import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AuthGuard } from "@core/guards/auth.guard";
import { AsistenciaComponent } from "./asistencia/asistencia.component";

const routes: Routes = [
    {
      path:'',
      component: AsistenciaComponent,
      canActivate: [AuthGuard]
    }
  
    
  ];

  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class AsistenciasRoutingModule { }