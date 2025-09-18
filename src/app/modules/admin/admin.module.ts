import { NgModule } from '@angular/core';
import { RolesComponent } from './roles/roles.component';
import { AdminRoutingModule } from './admin-routing.module';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SharedModule } from '@shared/shared.module';
import { UsersComponent } from './users/users.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordComponent } from './password/password.component';





@NgModule({
  declarations: [
    RolesComponent,
    UsersComponent,
    PasswordComponent
  ],
  imports: [
    SharedModule,
    AdminRoutingModule,
    ButtonModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule,
    FloatLabelModule,
    MultiSelectModule 
  ]
})
export class AdminModule { }
