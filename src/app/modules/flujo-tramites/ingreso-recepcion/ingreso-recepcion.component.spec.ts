import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoRecepcionComponent } from './ingreso-recepcion.component';

describe('IngresoRecepcionComponent', () => {
  let component: IngresoRecepcionComponent;
  let fixture: ComponentFixture<IngresoRecepcionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IngresoRecepcionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IngresoRecepcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
