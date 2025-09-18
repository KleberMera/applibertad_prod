import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondModComponent } from './second-mod.component';

describe('SecondModComponent', () => {
  let component: SecondModComponent;
  let fixture: ComponentFixture<SecondModComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SecondModComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SecondModComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
