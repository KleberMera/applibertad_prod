import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComponenteService } from '@data/services/api/componentes/componente.service';
import { TiposComponentesService } from '@data/services/api/componentes/tiposcomponentes.service';
import { EstadosService } from '@data/services/api/consult/estados.service';
import { Table } from 'primeng/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-componente',
  templateUrl: './componente.component.html',
  styleUrl: './componente.component.scss',
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
export class ComponenteComponent {

  @ViewChild('tbComponentes') tbComponentes!: Table; // Añade @ViewChild para obtener la referencia a la tabla

  componentes: any[] = [];
  estados: any[] = [];
  tiposcomponentes: any[] = [];

  errorMessage = '';

  formularioComponentes!: FormGroup; // Propiedad para el formulario
  
  componenteIdEditando: number | null = null; // Propiedad para almacenar el ID del estado en edición


  formularioVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private componenteService: ComponenteService,
    private tiposComponentesService: TiposComponentesService,
    private consultaEstadoService : EstadosService
  ) { }

  ngOnInit(): void {

        
    this.formularioComponentes = this.fb.group({
      selectedTipComp: ['', Validators.required], // Campo de texto requerido
      codcomponente: ['', Validators.required], // Campo de texto requerido
      marca: ['', Validators.required],  // Campo de fecha requerido
      modelo: ['', Validators.required],  // Campo de fecha requerido
      numeroserie: ['', Validators.required],  // Campo de fecha requerido
      selectedEstado: ['', Validators.required] //
    });
    this.obtenerComponentes();
    
    // Carga los tipos de componentes desde el servicio
     this.tiposComponentesService.getTipComponentes().subscribe(
      response => {
        if (!response.error) {
          this.tiposcomponentes = response.data.data;
        } else {
          this.errorMessage = response.msg;
        }
      },
      error => {
        this.errorMessage = 'Error en la solicitud: ' + error.message;
      }
    );

    // Carga los estados desde el servicio
    this.consultaEstadoService.getEstadosShort().subscribe(
      response => {
        if (!response.error) {
          this.estados = response.data.data;
        } else {
          this.errorMessage = response.msg;
        }
      },
      error => {
        this.errorMessage = 'Error en la solicitud: ' + error.message;
      }
    );
  
  }


  obtenerComponentes(): void {
    this.componenteService.getComponentes().subscribe(r => {
      if (!r.error) {
        this.componentes = r.data.data;
        //console.log(r.data.data);
      }
    });
  }


  mostrarFormulario(): void {
    this.formularioVisible = true;
  }

  ocultarFormulario(): void {
    this.formularioVisible = false;
    this.formularioComponentes.reset();
    this.componenteIdEditando = null;
  }

  applyFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      const filterValue = inputElement.value;
      this.tbComponentes.filterGlobal(filterValue, 'contains');
    }
  }


  guardarComponente(): void {
    const formData = this.formularioComponentes.value;

    const transformedData = this.transformFormData(formData);
  
    let confirmacionMensaje = '';
    let confirmacionTitulo = '';
    let accion = '';
  
    // Determinar el mensaje y la acción según si se está editando o no
    if (this.componenteIdEditando) {
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
        if (this.componenteIdEditando) {
          //console.log (transformedData);
          this.componenteService.updateComponente(this.componenteIdEditando, transformedData).subscribe(r => {
            if (!r.error) {
              Swal.fire('Listo', `Estado actualizado correctamente`, 'success').then(() => {
                this.componenteIdEditando = null;
                this.obtenerComponentes();
                this.ocultarFormulario();
              })
            } else {
              Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
            }
          });
        } else {
          this.componenteService.insertComponente(transformedData).subscribe(r => {
            if (!r.error) {
              Swal.fire('Listo', `Estado agregado correctamente`, 'success').then(() => {
                this.obtenerComponentes();
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

  private transformFormData(formData: any): any {
    const { selectedTipComp, selectedEstado, ...rest } = formData;
    return {
      ...rest,
      tipocomponenteid: selectedTipComp.tipocomponenteid,
      estadoid : selectedEstado.estadoid
    };
  }


  editaComponente(componente: any): void {
    //console.log('Usuario editado:', componente);

    // Convertir el departamentoid del usuario a un número
    const tipoComponenteID= parseInt(componente.tipocomponenteid, 10);
    const estadoID= parseInt(componente.estadoid, 10);

    // Busca el departamento correspondiente al usuario editado
    const tipoComponenteSeleccionado = this.tiposcomponentes.find(componente => componente.tipocomponenteid === tipoComponenteID);
    const estadoSeleccionado = this.estados.find(componente => componente.estadoid === estadoID);
    
    //console.log('estado seleccionado:', estadoSeleccionado);
    //console.log('estado seleccionado:', componente.estadoid);
    // Asigna el departamento seleccionado al formulario
    this.formularioComponentes.patchValue({
        selectedTipComp: tipoComponenteSeleccionado,
        codcomponente: componente.codcomponente,
        marca: componente.marca,
        modelo: componente.modelo,
        numeroserie: componente.numeroserie,
        selectedEstado : estadoSeleccionado
    });

    // Muestra el formulario de edición
    this.componenteIdEditando = componente.componenteid;
    this.mostrarFormulario();
      // this.formularioUsuario.patchValue({
      //   selectedDepart: usuario.departamentoid,
      //   cedula: usuario.cedula,
      //   nombre: usuario.nombre,
      //   apellido: usuario.apellido
      // });
      // this.usuarioIdEditando = usuario.usuarioid;
      // this.mostrarFormulario();
  }

  eliminarComponente(componente: any): void {
    // Lógica para eliminar el estado
  }

}
