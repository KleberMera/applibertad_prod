import { TestBed } from '@angular/core/testing';

import { InsertEstadosService } from './insert-estados.service';

describe('InsertEstadosService', () => {
  let service: InsertEstadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InsertEstadosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
