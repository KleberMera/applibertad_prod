import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TramiteInternoComponent } from './tramite-interno.component';

describe('TramiteInternoComponent', () => {
  let component: TramiteInternoComponent;
  let fixture: ComponentFixture<TramiteInternoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TramiteInternoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TramiteInternoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
