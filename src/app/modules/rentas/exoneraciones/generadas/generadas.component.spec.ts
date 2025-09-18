import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneradasComponent } from './generadas.component';

describe('GeneradasComponent', () => {
  let component: GeneradasComponent;
  let fixture: ComponentFixture<GeneradasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeneradasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GeneradasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
