import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

//rutas
//import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { HashLocationStrategy, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { SkeletonComponent } from './layout/skeleton/skeleton.component';
import { FooterComponent } from './layout/footer/footer.component';
import { NavigationComponent } from './layout/navigation/navigation.component';
import { HeaderComponent } from './layout/header/header.component';
import { LeftNavComponent } from './layout/left-nav/left-nav.component';
import { LeftNavMenuComponent } from './layout/left-nav/left-nav-menu/left-nav-menu.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Importa BrowserAnimationsModule

import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { MenuModule } from 'primeng/menu';  // Importa MenuModule


import { DatePipe } from '@angular/common';
import { AuthGuard } from '@core/guards/auth.guard';
import { RestablecerComponent } from './auth/restablecer/restablecer.component';
import { ServiceWorkerModule } from '@angular/service-worker';

//import { PrimeIconsModule } from 'primeng/icon';

@NgModule({
  declarations: [
    AppComponent,
    SkeletonComponent,
    FooterComponent,
    NavigationComponent,
    HeaderComponent,
    LeftNavComponent,
    LeftNavMenuComponent,
    RestablecerComponent,
  ],
  imports: [
    BrowserModule,
    //CORE
    CoreModule,
    SharedModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ButtonModule,
    ProgressSpinnerModule,
    MenuModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }) // Añade MenuModule aquí
    //PRIMEICONS
    //PrimeIconsModule
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
      
    },
    DatePipe,
    AuthGuard
    // {
    //   provide: LocationStrategy,
    //   useClass: PathLocationStrategy
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
