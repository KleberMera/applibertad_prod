import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AuthGuard } from "@core/guards/auth.guard";
import { ReppatenteComponent } from "./reppatente/reppatente.component";

const routes: Routes = [
    {
      path:'informes/reppatente',
      component: ReppatenteComponent,
      canActivate: [AuthGuard]
    },
  ];

  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class ComisariaRoutingModule { }