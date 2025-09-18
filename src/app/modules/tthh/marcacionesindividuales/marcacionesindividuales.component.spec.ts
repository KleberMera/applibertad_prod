import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcacionesindividualesComponent } from './marcacionesindividuales.component';

describe('MarcacionesindividualesComponent', () => {
  let component: MarcacionesindividualesComponent;
  let fixture: ComponentFixture<MarcacionesindividualesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarcacionesindividualesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarcacionesindividualesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
