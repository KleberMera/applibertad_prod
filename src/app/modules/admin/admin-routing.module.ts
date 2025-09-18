import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AuthGuard } from "@core/guards/auth.guard";
import { RolesComponent } from "./roles/roles.component";
import { UsersComponent } from "./users/users.component";
import { PasswordComponent } from "./password/password.component";

const routes: Routes = [
    {
      path:'roles',
      component: RolesComponent,
      canActivate: [AuthGuard]
    },
    {
      path:'users',
      component: UsersComponent,
      canActivate: [AuthGuard]
    },
    {
      path:'changePassword',
      component: PasswordComponent,
      canActivate: [AuthGuard]
    },
  ];

  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class AdminRoutingModule { }