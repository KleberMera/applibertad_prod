import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SistemasRoutingModule } from './sistemas-routing.module';
import { CorreosComponent } from './correos/correos.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '@shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { SidebarModule } from 'primeng/sidebar';
import { AnimateModule } from 'primeng/animate';
import { AccordionModule } from 'primeng/accordion';
import { AutoFocusModule } from 'primeng/autofocus';
import { DialogModule } from 'primeng/dialog';
import { ScrollTopModule } from 'primeng/scrolltop';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BrowserModule } from '@angular/platform-browser';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';

import { FooterComponent } from '@layout/footer/footer.component';

import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CalendarModule } from 'primeng/calendar';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    CorreosComponent
  ],
  imports: [
    CommonModule,
    SistemasRoutingModule,
    DividerModule,
    ProgressSpinnerModule,
    ProgressBarModule,
    ToastModule,
    ScrollTopModule,
    CommonModule,
    SharedModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    TableModule,
    AvatarModule,
    SidebarModule,
    AnimateModule,
    AccordionModule,
    AutoFocusModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule,
    FloatLabelModule,
    CalendarModule,
    ReactiveFormsModule
  ]
})
export class SistemasModule { }
