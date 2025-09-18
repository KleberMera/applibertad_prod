import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolInspeccionComponent } from './sol-inspeccion.component';

describe('SolInspeccionComponent', () => {
  let component: SolInspeccionComponent;
  let fixture: ComponentFixture<SolInspeccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SolInspeccionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolInspeccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
