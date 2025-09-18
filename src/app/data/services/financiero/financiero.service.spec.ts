import { TestBed } from '@angular/core/testing';

import { FinancieroService } from './financiero.service';

describe('FinancieroService', () => {
  let service: FinancieroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinancieroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
