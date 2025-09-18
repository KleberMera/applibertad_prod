import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { DepartamentoComponent } from "./departamento/departamento.component";

const routes: Routes = [
    {
        path:'',
        component: DepartamentoComponent,
        //canActivate: [AuthGuard]
    }//,
    // {
    //     path:'tipos',
    //     component: TipocomponenteComponent,
    //     //canActivate: [AuthGuard]
    // }
];


@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class DepartamentosRoutingModule { }