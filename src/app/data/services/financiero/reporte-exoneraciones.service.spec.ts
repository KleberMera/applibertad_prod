import { TestBed } from '@angular/core/testing';

import { ReporteExoneracionesService } from './reporte-exoneraciones.service';

describe('ReporteExoneracionesService', () => {
  let service: ReporteExoneracionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReporteExoneracionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
