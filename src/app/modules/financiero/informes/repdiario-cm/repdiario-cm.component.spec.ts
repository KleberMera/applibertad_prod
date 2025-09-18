import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepdiarioCmComponent } from './repdiario-cm.component';

describe('RepdiarioCmComponent', () => {
  let component: RepdiarioCmComponent;
  let fixture: ComponentFixture<RepdiarioCmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RepdiarioCmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RepdiarioCmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
