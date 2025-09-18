import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AuthGuard } from "@core/guards/auth.guard";
import { ListaEstadosComponent } from "./lista-estados/lista-estados.component";

const routes: Routes = [
    {
      path:'',
      component: ListaEstadosComponent,
      //canActivate: [AuthGuard]
    }
  
    
  ];

  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class EstadosRoutingModule { }