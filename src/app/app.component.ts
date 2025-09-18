// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrl: './app.component.css'
// })
// export class AppComponent {
//   title = 'baseHADev';
// }

// import { Component } from '@angular/core';
// import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
// import { filter } from 'rxjs/operators';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent {
//   title = 'baseHADev';

//   constructor(private swUpdate: SwUpdate) {
//     if (this.swUpdate.isEnabled) {
//       this.swUpdate.versionUpdates
//         .pipe(
//           filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY')
//         )
//         .subscribe(() => {
//           // Actualiza directamente sin preguntar al usuario
//           window.location.reload();
//         });
//     }
//   }
// }

import { Component } from '@angular/core';
import { SwUpdate, VersionEvent, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // ojo: style**s**Url con "s"
})
export class AppComponent {
  title = 'baseHADev';

  constructor(private swUpdate: SwUpdate) {
    if (swUpdate.isEnabled) {
      swUpdate.versionUpdates
        .pipe(
          filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
        )
        .subscribe(() => {
          const reload = confirm('¡Hay una nueva versión disponible! ¿Deseas actualizar ahora?');
          if (reload) {
            window.location.reload();
          }
        });
    }
  }
}
