import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartamentosService } from '@data/services/api/departamentos/departamentos.service';
import { Table } from 'primeng/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-departamento',
  templateUrl: './departamento.component.html',
  styleUrl: './departamento.component.scss',
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


export class DepartamentoComponent implements OnInit {
 
  @ViewChild('tbDepartamentos') tbDepartamentos!: Table; // Añade @ViewChild para obtener la referencia a la tabla

  departamentos: any[] = [];
  
  formularioDepartamento!: FormGroup; // Propiedad para el formulario
  formularioVisible: boolean = false;

  departamentoIdEditando: number | null = null; // Propiedad para almacenar el ID del estado en edición
 
 
  constructor(
    private fb: FormBuilder,
    private departamentoService: DepartamentosService,
    //private insertEstadoService : InsertEstadosService
  ) { }

  ngOnInit(): void {
    this.formularioDepartamento = this.fb.group({
      nombre: ['', Validators.required], // Campo de texto requerido
      ubicacion: ['', Validators.required],  // Campo de fecha requerido
    });
    this.obtenerDepartamentos();
  }

  obtenerDepartamentos(): void {
    this.departamentoService.getDepartamentos().subscribe(r => {
      if (!r.error) {
        this.departamentos = r.data.data;
        //console.log(r.data.data);
      }
    });
  }

  
  mostrarFormulario(): void {
    this.formularioVisible = true;
  }

  ocultarFormulario(): void {
    this.formularioVisible = false;
    this.formularioDepartamento.reset();
    this.departamentoIdEditando = null;
  }

  applyFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      const filterValue = inputElement.value;
      this.tbDepartamentos.filterGlobal(filterValue, 'contains');
    }
  }


  guardarDepartamento(): void {
    const formData = this.formularioDepartamento.value;
  
    let confirmacionMensaje = '';
    let confirmacionTitulo = '';
    let accion = '';
  
    // Determinar el mensaje y la acción según si se está editando o no
    if (this.departamentoIdEditando) {
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
        if (this.departamentoIdEditando) {
          //console.log (formData);
          this.departamentoService.updateDepart(this.departamentoIdEditando, formData).subscribe(r => {
            if (!r.error) {
              Swal.fire('Listo', `Estado actualizado correctamente`, 'success').then(() => {
                this.departamentoIdEditando = null;
                this.obtenerDepartamentos();
                this.ocultarFormulario();
              })
            } else {
              Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
            }
          });
        } else {
          this.departamentoService.insertDepart(formData).subscribe(r => {
            if (!r.error) {
              Swal.fire('Listo', `Estado agregado correctamente`, 'success').then(() => {
                this.obtenerDepartamentos();
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

  editarDepartamento(departamento: any): void {
    this.formularioDepartamento.patchValue({
      nombre: departamento.nombre,
      ubicacion: departamento.ubicacion
    });
    this.departamentoIdEditando = departamento.departamentoid; // Almacenar el ID del estado en edición
    this.mostrarFormulario();
  }

  eliminarDepartamento(estado: any): void {
    // Lógica para eliminar el estado
  }

}
