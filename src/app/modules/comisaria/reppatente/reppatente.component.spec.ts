import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReppatenteComponent } from './reppatente.component';

describe('ReppatenteComponent', () => {
  let component: ReppatenteComponent;
  let fixture: ComponentFixture<ReppatenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReppatenteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReppatenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
