// archivo: status.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status'
})
export class StatusPipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case 'A':
        return 'ACTIVO';
      case 'B':
        return 'BAJA';
      case 'X':
        return 'ANULADO';
      default:
        return 'OTRO';
    }
  }
}
