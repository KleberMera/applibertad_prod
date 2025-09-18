import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TiposComponentesService } from '@data/services/api/componentes/tiposcomponentes.service';
import { InsertEstadosService } from '@data/services/api/insert/insert-estados.service';
import { Table } from 'primeng/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tipocomponente',
  templateUrl: './tipocomponente.component.html',
  styleUrl: './tipocomponente.component.scss',
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
export class TipocomponenteComponent implements OnInit {

  @ViewChild('tbTipComp') tbTipComp!: Table; // Añade @ViewChild para obtener la referencia a la tabla


  tipoComponentes: any[] = [];
  
  formTipComp!: FormGroup; // Propiedad para el formulario
  formularioVisible: boolean = false;

  estadoIdEditando: number | null = null; // Propiedad para almacenar el ID del estado en edición



  
  constructor(
    private fb: FormBuilder,
    private tiposComponetesService: TiposComponentesService
    // private insertEstadoService : InsertEstadosService
  ) { }
  
  ngOnInit(): void {
    this.formTipComp = this.fb.group({
      descripcion: ['', Validators.required], // Campo de texto requerido
      // codEstado: ['', Validators.required],  // Campo de fecha requerido
    });
    this.obtenerTipComp();
  }

  obtenerTipComp(): void {
    this.tiposComponetesService.getTipComponentes().subscribe(r => {
      if (!r.error) {
        this.tipoComponentes = r.data.data;
        console.log(r.data.data);
      }
    });
  }

  mostrarFormulario(): void {
    this.formularioVisible = true;
  }

  ocultarFormulario(): void {
    this.formularioVisible = false;
    this.formTipComp.reset();
    this.estadoIdEditando = null;
  }

  editarTipComp(tipcomp: any): void {
    this.formTipComp.patchValue({
      descripcion: tipcomp.descripcion,
    });
    this.estadoIdEditando = tipcomp.tipocomponenteid; // Almacenar el ID del estado en edición
    this.mostrarFormulario();
  }

  eliminarTipComp(estado: any): void {
    // Lógica para eliminar el estado
  }

  guardarTipComp(): void {
    const formData = this.formTipComp.value;
  
    let confirmacionMensaje = '';
    let confirmacionTitulo = '';
    let accion = '';
  
    // Determinar el mensaje y la acción según si se está editando o no
    if (this.estadoIdEditando) {
      confirmacionTitulo = 'Actualizar'
      confirmacionMensaje = '¿Estás seguro de que quieres actualizar?';
      accion = 'actualizar';
    } else {
      confirmacionTitulo = 'Agregar'
      confirmacionMensaje = '¿Estás seguro de que quieres agregar?';
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
          this.tiposComponetesService.updateTipComp(this.estadoIdEditando, formData).subscribe(r => {
            if (!r.error) {
              Swal.fire('Listo', `Estado actualizado correctamente`, 'success').then(() => {
                this.estadoIdEditando = null;
                this.obtenerTipComp();
                this.ocultarFormulario();
              })
            } else {
              Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
            }
          });
        } else {
          this.tiposComponetesService.insertTipComp(formData).subscribe(r => {
            if (!r.error) {
              Swal.fire('Listo', `Estado agregado correctamente`, 'success').then(() => {
                this.obtenerTipComp();
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
      this.tbTipComp.filterGlobal(filterValue, 'contains');
    }
  }

}
