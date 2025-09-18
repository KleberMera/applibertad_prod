import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EstadosService } from '@data/services/api/consult/estados.service';
import { InsertEstadosService } from '@data/services/api/insert/insert-estados.service';
import { Table } from 'primeng/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lista-estados',
  templateUrl: './lista-estados.component.html',
  styleUrl: './lista-estados.component.scss',
  animations: [
    trigger('formularioAnimacion', [
      state('visible', style({
        opacity: 1,
        height: '*'
      })),
      state('oculto', style({
        opacity: 0,
        height: '0px',
        overflow: 'hidden'
      })),
      transition('oculto => visible', [
        style({ height: 'auto' }),
        animate('300ms ease-in')
      ]),
      transition('visible => oculto', [
        animate('300ms ease-out')
      ])
    ])
  ]
})
export class ListaEstadosComponent implements OnInit {

  @ViewChild('tbEstados') tbEstados!: Table; // Añade @ViewChild para obtener la referencia a la tabla


  estados: any[] = [];
  
  formularioEstado!: FormGroup; // Propiedad para el formulario
  formularioVisible: boolean = false;

  estadoIdEditando: number | null = null; // Propiedad para almacenar el ID del estado en edición



  
  constructor(
    private fb: FormBuilder,
    private estadosService: EstadosService,
    private insertEstadoService : InsertEstadosService
  ) { }
  
  ngOnInit(): void {
    this.formularioEstado = this.fb.group({
      descripcion: ['', Validators.required], // Campo de texto requerido
      codEstado: ['', Validators.required],  // Campo de fecha requerido
    });
    this.obtenerEstados();
  }

  obtenerEstados(): void {
    this.estadosService.getEstados().subscribe(r => {
      if (!r.error) {
        this.estados = r.data.data;
        console.log(r.data.data);
      }
    });
  }

  mostrarFormulario(): void {
    this.formularioVisible = true;
  }

  ocultarFormulario(): void {
    this.formularioVisible = false;
    this.formularioEstado.reset();
    this.estadoIdEditando = null;
  }

  editarEstado(estado: any): void {
    this.formularioEstado.patchValue({
      descripcion: estado.DESCRIPCION,
      codEstado: estado.COD_ESTADO
    });
    this.estadoIdEditando = estado.ESTADOID; // Almacenar el ID del estado en edición
    this.mostrarFormulario();
  }

  eliminarEstado(estado: any): void {
    // Lógica para eliminar el estado
  }

  guardarEstado(): void {
    const formData = this.formularioEstado.value;
  
    let confirmacionMensaje = '';
    let confirmacionTitulo = '';
    let accion = '';
  
    // Determinar el mensaje y la acción según si se está editando o no
    if (this.estadoIdEditando) {
      confirmacionTitulo = 'Actualizar'
      confirmacionMensaje = '¿Estás seguro de que quieres actualizar este estado?';
      accion = 'actualizar';
    } else {
      confirmacionTitulo = 'Agregar'
      confirmacionMensaje = '¿Estás seguro de que quieres agregar este estado?';
      accion = 'agregar';
    }
  
    // Mostrar el mensaje de confirmación
    Swal.fire({
      title: confirmacionTitulo,
      text: confirmacionMensaje,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma, realizar la acción correspondiente
        if (this.estadoIdEditando) {
          this.insertEstadoService.updateEstado(this.estadoIdEditando, formData).subscribe(r => {
            if (!r.error) {
              Swal.fire('Listo', `Estado actualizado correctamente`, 'success').then(() => {
                this.estadoIdEditando = null;
                this.obtenerEstados();
                this.ocultarFormulario();
              })
            } else {
              Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
            }
          });
        } else {
          this.insertEstadoService.insertEstado(formData).subscribe(r => {
            if (!r.error) {
              Swal.fire('Listo', `Estado agregado correctamente`, 'success').then(() => {
                this.obtenerEstados();
                this.ocultarFormulario();
              })
            } else {
              Swal.fire('Error', 'No se pudo agregar el estado', 'error');
            }
          });
        }
      }
    });
  }

  applyFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      const filterValue = inputElement.value;
      this.tbEstados.filterGlobal(filterValue, 'contains');
    }
  }
  

  
}
