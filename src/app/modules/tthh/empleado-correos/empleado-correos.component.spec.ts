import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpleadoCorreosComponent } from './empleado-correos.component';

describe('EmpleadoCorreosComponent', () => {
  let component: EmpleadoCorreosComponent;
  let fixture: ComponentFixture<EmpleadoCorreosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmpleadoCorreosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmpleadoCorreosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
