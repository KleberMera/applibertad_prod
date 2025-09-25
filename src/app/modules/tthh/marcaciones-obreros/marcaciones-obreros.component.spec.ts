import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcacionesObrerosComponent } from './marcaciones-obreros.component';

describe('MarcacionesObrerosComponent', () => {
  let component: MarcacionesObrerosComponent;
  let fixture: ComponentFixture<MarcacionesObrerosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarcacionesObrerosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarcacionesObrerosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
