import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoEmpleadosComponent } from './ingreso-empleados.component';

describe('IngresoEmpleadosComponent', () => {
  let component: IngresoEmpleadosComponent;
  let fixture: ComponentFixture<IngresoEmpleadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IngresoEmpleadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IngresoEmpleadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
