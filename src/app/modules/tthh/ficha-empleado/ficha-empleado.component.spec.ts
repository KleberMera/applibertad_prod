import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FichaEmpleadoComponent } from './ficha-empleado.component';

describe('FichaEmpleadoComponent', () => {
  let component: FichaEmpleadoComponent;
  let fixture: ComponentFixture<FichaEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FichaEmpleadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FichaEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
