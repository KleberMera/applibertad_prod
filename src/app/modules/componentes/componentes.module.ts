import { NgModule } from '@angular/core';
import { ComponenteComponent } from './componente/componente.component';
import { SharedModule } from '@shared/shared.module';
import { ComponentesRoutingModule } from './componentes-routing.module';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TableModule } from 'primeng/table';
import { TipocomponenteComponent } from './tipocomponente/tipocomponente.component';
import { DropdownModule } from 'primeng/dropdown';



@NgModule({
  declarations: [
    ComponenteComponent,
    TipocomponenteComponent
  ],
  imports: [
    SharedModule,
    ComponentesRoutingModule,
    ButtonModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule
  ]
})
export class ComponentesModule { }
