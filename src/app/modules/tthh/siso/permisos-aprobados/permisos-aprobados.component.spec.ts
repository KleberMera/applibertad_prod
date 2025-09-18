import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermisosAprobadosComponent } from './permisos-aprobados.component';

describe('PermisosAprobadosComponent', () => {
  let component: PermisosAprobadosComponent;
  let fixture: ComponentFixture<PermisosAprobadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PermisosAprobadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PermisosAprobadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
