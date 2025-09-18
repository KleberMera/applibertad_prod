import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AuthGuard } from "@core/guards/auth.guard";
import { IngresoEmpleadosComponent } from "./ingreso-empleados/ingreso-empleados.component";

const routes: Routes = [
    {
      path:'',
      component: IngresoEmpleadosComponent,
      canActivate: [AuthGuard]
    }
  
    
  ];

  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class EmpleadosRoutingModule { }