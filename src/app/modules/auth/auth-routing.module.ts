import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { INTERNAL_PATHS } from '@data/constants/routes';
import { NoAuthGuard } from '@core/guards/no-auth.guard';

const routes : Routes = [
    {
        path: INTERNAL_PATHS.AUTH_LOGIN,
        component: LoginComponent,
        canActivate: [NoAuthGuard]   
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
export class AuthRoutingModule { }
