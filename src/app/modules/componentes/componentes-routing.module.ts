import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { ComponenteComponent } from "./componente/componente.component";
import { TipocomponenteComponent } from "./tipocomponente/tipocomponente.component";
import { AuthGuard } from "@core/guards/auth.guard";

const routes: Routes = [
    {
        path:'',
        component: ComponenteComponent,
        canActivate: [AuthGuard]
    },
    {
        path:'tipos',
        component: TipocomponenteComponent,
        //canActivate: [AuthGuard]
    }
];


@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class ComponentesRoutingModule { }