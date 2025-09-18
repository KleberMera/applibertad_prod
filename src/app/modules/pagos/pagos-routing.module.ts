import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AuthGuard } from "@core/guards/auth.guard";
import { PagoComponent } from "./pago/pago.component";

const routes: Routes = [
    {
      path:'',
      component: PagoComponent,
      canActivate: [AuthGuard]
    }
  
    
  ];

  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class PagosRoutingModule { }