import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaEstadosComponent } from './lista-estados.component';

describe('ListaEstadosComponent', () => {
  let component: ListaEstadosComponent;
  let fixture: ComponentFixture<ListaEstadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListaEstadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListaEstadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
