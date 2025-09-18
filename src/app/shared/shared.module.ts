import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import * as fromComponents from './components';
import * as fromPipes from './pipes';
import { RouterModule } from '@angular/router';
import { CardLoaderComponent } from './components/loaders/card-loader/card-loader.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { StatusPipe } from './pipes/tthh/status.pipe';



@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    FontAwesomeModule
  ],
  declarations: [...fromComponents.components, ...fromPipes.pipes, StatusPipe],
  exports:[
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    FontAwesomeModule,
    ...fromComponents.components,
    ...fromPipes.pipes
  ]
})
export class SharedModule { }
