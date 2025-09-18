import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { PrincipalComponent } from "./principal/principal.component";
import { SecondModComponent } from "./second-mod/second-mod.component";
import { CurrencyComponent } from "./currency/currency.component";
import { AuthGuard } from "@core/guards/auth.guard";

const routes: Routes = [
    {
      path:'',
      component: CurrencyComponent,
      canActivate: [AuthGuard]
    },
    {
      path:'principal',
      component: PrincipalComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'secondary',
      component: SecondModComponent,
      canActivate: [AuthGuard]
    }
  
    
  ];

  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class PruebaRoutingModule { }