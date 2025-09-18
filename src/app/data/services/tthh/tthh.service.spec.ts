import { TestBed } from '@angular/core/testing';

import { TthhService } from './tthh.service';

describe('TthhService', () => {
  let service: TthhService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TthhService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
