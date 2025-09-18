import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportcontratosComponent } from './reportcontratos.component';

describe('ReportcontratosComponent', () => {
  let component: ReportcontratosComponent;
  let fixture: ComponentFixture<ReportcontratosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportcontratosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportcontratosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
