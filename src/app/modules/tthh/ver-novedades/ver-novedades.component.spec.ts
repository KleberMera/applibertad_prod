import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerNovedadesComponent } from './ver-novedades.component';

describe('VerNovedadesComponent', () => {
  let component: VerNovedadesComponent;
  let fixture: ComponentFixture<VerNovedadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerNovedadesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerNovedadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
