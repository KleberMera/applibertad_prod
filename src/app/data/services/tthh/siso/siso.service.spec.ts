import { TestBed } from '@angular/core/testing';

import { SisoService } from './siso.service';

describe('SisoService', () => {
  let service: SisoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SisoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
