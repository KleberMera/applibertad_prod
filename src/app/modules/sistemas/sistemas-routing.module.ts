import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CorreosComponent } from './correos/correos.component';
import { AuthGuard } from '@core/guards/auth.guard';

const routes: Routes = [
  {
    path:'correos',
    component: CorreosComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SistemasRoutingModule { }
