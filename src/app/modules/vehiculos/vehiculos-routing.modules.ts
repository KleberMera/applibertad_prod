import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AuthGuard } from "@core/guards/auth.guard";
import { VehiculoComponent } from "./vehiculo/vehiculo.component";

const routes: Routes = [
    {
      path:'',
      component: VehiculoComponent,
      canActivate: [AuthGuard]
    }
  
    
  ];

  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class VehiculosRoutingModule { }