import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cleanName'
})
export class CleanNamePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (value == null) return '';
    let s = String(value);
    // Eliminar puntos, guiones y espacios al inicio, incluyendo el patrón " . "
    s = s.replace(/^[\s\.-]+/, '');
    // Reemplazar patrones específicos como " . " al inicio si quedaran
    s = s.replace(/^\s*\.(\s)*/, '');
    // Colapsar espacios múltiples y recortar
    s = s.replace(/\s{2,}/g, ' ').trim();
    return s;
  }
}
