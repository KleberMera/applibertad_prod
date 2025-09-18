import { TestBed } from '@angular/core/testing';

import { ActaService } from './acta.service';

describe('ActaService', () => {
  let service: ActaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
