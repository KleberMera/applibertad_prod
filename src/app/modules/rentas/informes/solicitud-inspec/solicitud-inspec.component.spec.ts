import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudInspecComponent } from './solicitud-inspec.component';

describe('SolicitudInspecComponent', () => {
  let component: SolicitudInspecComponent;
  let fixture: ComponentFixture<SolicitudInspecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SolicitudInspecComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolicitudInspecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
