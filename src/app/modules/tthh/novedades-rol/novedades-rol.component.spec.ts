import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NovedadesRolComponent } from './novedades-rol.component';

describe('NovedadesRolComponent', () => {
  let component: NovedadesRolComponent;
  let fixture: ComponentFixture<NovedadesRolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NovedadesRolComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NovedadesRolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
