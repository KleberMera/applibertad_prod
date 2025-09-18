import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipocomponenteComponent } from './tipocomponente.component';

describe('TipocomponenteComponent', () => {
  let component: TipocomponenteComponent;
  let fixture: ComponentFixture<TipocomponenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TipocomponenteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TipocomponenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
