import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepdiariofechaCmComponent } from './repdiariofecha-cm.component';

describe('RepdiariofechaCmComponent', () => {
  let component: RepdiariofechaCmComponent;
  let fixture: ComponentFixture<RepdiariofechaCmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RepdiariofechaCmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RepdiariofechaCmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
