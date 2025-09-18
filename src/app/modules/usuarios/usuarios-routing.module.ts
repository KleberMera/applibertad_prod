import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { UsuariosComponent } from "./usuarios/usuarios.component";

const routes: Routes = [
    {
        path:'',
        component: UsuariosComponent,
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
export class UsuariosRoutingModule { }