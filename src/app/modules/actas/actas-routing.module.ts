import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { ActaComponent } from "./acta/acta.component";

const routes: Routes = [
    {
        path:'',
        component: ActaComponent,
        //canActivate: [AuthGuard]
    }
];


@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule]
})
export class ActasRoutingModule { }