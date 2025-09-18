import { NgModule } from '@angular/core';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { SharedModule } from '@shared/shared.module';
import { UsuariosRoutingModule } from './usuarios-routing.module';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';



@NgModule({
  declarations: [
    UsuariosComponent
  ],
  imports: [
    SharedModule,
    UsuariosRoutingModule,
    ButtonModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule
  ]
})
export class UsuariosModule { }
