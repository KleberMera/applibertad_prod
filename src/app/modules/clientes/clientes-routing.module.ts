import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AuthGuard } from "@core/guards/auth.guard";
import { ClientesListComponent } from "./clientes-list/clientes-list.component";

const routes: Routes = [
    {
      path:'',
      component: ClientesListComponent,
      canActivate: [AuthGuard]
    }
  
    
  ];

  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class ClientesRoutingModule { }