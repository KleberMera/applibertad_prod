import { TestBed } from '@angular/core/testing';

import { SearchEmpoyeeService } from './search-empoyee.service';

describe('SearchEmpoyeeService', () => {
  let service: SearchEmpoyeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchEmpoyeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
