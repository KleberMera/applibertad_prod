import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneradasLiquidadoresComponent } from './generadas-liquidadores.component';

describe('GeneradasLiquidadoresComponent', () => {
  let component: GeneradasLiquidadoresComponent;
  let fixture: ComponentFixture<GeneradasLiquidadoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeneradasLiquidadoresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GeneradasLiquidadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
