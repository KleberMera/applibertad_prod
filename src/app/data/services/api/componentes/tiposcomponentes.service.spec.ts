import { TestBed } from '@angular/core/testing';

import { TiposComponentesService } from './tiposcomponentes.service';

describe('ComponentesService', () => {
  let service: TiposComponentesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TiposComponentesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
