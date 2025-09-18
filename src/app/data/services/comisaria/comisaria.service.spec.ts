import { TestBed } from '@angular/core/testing';

import { ComisariaService } from './comisaria.service';

describe('ComisariaService', () => {
  let service: ComisariaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComisariaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
