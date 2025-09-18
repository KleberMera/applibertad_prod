import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesdepagoTTHHComponent } from './rolesdepago.component';

describe('RolesdepagoComponent', () => {
  let component: RolesdepagoTTHHComponent;
  let fixture: ComponentFixture<RolesdepagoTTHHComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RolesdepagoTTHHComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RolesdepagoTTHHComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
