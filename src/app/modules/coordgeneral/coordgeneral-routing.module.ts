import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportcontratosComponent } from './reportcontratos/reportcontratos.component';
import { AuthGuard } from '@core/guards/auth.guard';

const routes: Routes = [
  {
    path:'contratos',
    component: ReportcontratosComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoordgeneralRoutingModule { }
