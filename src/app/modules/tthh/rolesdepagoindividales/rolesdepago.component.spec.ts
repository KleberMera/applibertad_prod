import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesdepagoComponent } from './rolesdepago.component';

describe('RolesdepagoComponent', () => {
  let component: RolesdepagoComponent;
  let fixture: ComponentFixture<RolesdepagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RolesdepagoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RolesdepagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
