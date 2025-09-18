import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AuthGuard } from "@core/guards/auth.guard";
import { EventoComponent } from "./evento/evento.component";

const routes: Routes = [
    {
      path:'',
      component: EventoComponent,
      //canActivate: [AuthGuard]
    }
  
    
  ];

  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class EventosRoutingModule { }