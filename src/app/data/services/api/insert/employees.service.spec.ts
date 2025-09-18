import { TestBed } from '@angular/core/testing';

import { IngresoEmpleadosService } from './employees.service';

describe('IngresoEmpleadosService', () => {
  let service: IngresoEmpleadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IngresoEmpleadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
