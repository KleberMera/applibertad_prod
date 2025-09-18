import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'greetings'
})
export class GreetingsPipe implements PipeTransform {

  transform(name: string, gender?: string, role: string = 'Usuario'): any {
    let grt = '';
    switch (gender) {
      case 'M':
        grt = 'Bienvenido';
        break;
      case 'F':
        grt = 'Bienvenida';
        break;
      default:
        grt = 'Bienvenid@';
        break;
    }
    //const grt = (gender === 'F') ? 'Bienvenida' : 'Bienvenido';
    return `${grt} ${name}, tiene permisos de ${role}`;
  }

}
