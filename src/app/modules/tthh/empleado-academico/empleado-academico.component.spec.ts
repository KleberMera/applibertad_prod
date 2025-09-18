import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpleadoAcademicoComponent } from './empleado-academico.component';

describe('EmpleadoAcademicoComponent', () => {
  let component: EmpleadoAcademicoComponent;
  let fixture: ComponentFixture<EmpleadoAcademicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmpleadoAcademicoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmpleadoAcademicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
