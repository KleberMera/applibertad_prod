import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AuthGuard } from "@core/guards/auth.guard";
import { RepdiarioCmComponent } from "./informes/repdiario-cm/repdiario-cm.component";
import { RepdiariofechaCmComponent } from "./informes/repdiariofecha-cm/repdiariofecha-cm.component";

const routes: Routes = [
    {
      path:'informes/repdiario-cm',
      component: RepdiarioCmComponent,
      canActivate: [AuthGuard]
    },
    {
      path:'informes/repdiariofecha-cm',
      component: RepdiariofechaCmComponent,
      canActivate: [AuthGuard]
    },
  ];

  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class FinancieroRoutingModule { }