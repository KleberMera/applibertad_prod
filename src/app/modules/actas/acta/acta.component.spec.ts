import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActaComponent } from './acta.component';

describe('ActaComponent', () => {
  let component: ActaComponent;
  let fixture: ComponentFixture<ActaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
