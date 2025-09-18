import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartamentosService } from '@data/services/api/departamentos/departamentos.service';
import { UsuariosService } from '@data/services/api/usaurios/usuarios.service';
import { Table } from 'primeng/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
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

export class UsuariosComponent implements OnInit {
 
  @ViewChild('tbUsuarios') tbusuarios!: Table; // Añade @ViewChild para obtener la referencia a la tabla


  usuarios: any[] = [];
  departamentos: any[] = [];
  errorMessage = '';
  
  formularioUsuario!: FormGroup; // Propiedad para el formulario
  formularioVisible: boolean = false;

  usuarioIdEditando: number | null = null; // Propiedad para almacenar el ID del estado en edición
  
 
 
  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuariosService,
    private departamentosService: DepartamentosService
    //private insertEstadoService : InsertEstadosService
  ) { }


  ngOnInit(): void {

        
    this.formularioUsuario = this.fb.group({
      selectedDepart: ['', Validators.required], // Campo de texto requerido
      cedula: ['', Validators.required],  // Campo de fecha requerido
      nombre: ['', Validators.required],  // Campo de fecha requerido
      apellido: ['', Validators.required],  // Campo de fecha requerido
    });
    this.obtenerUsuarios();
    
     // Carga los eventos desde el servicio
     this.departamentosService.getDepartShort().subscribe(
      response => {
        if (!response.error) {
          this.departamentos = response.data.data;
          // if (this.departamentos.length > 0) {
          //   // Selecciona el primer evento por defecto
          //   this.formularioUsuario.patchValue({ selectedDepart: this.departamentos[0] });
          //   console.log('dato ', this.departamentos[0]);
          //   // Habilita el campo después de establecer el valor por defecto
          //   const selectedDepartControl = this.formularioUsuario.get('selectedDepart');
          //   // if (selectedEventControl) {
          //   //   selectedEventControl.disable();
          //   // } 
          // }
        } else {
          this.errorMessage = response.msg;
        }
      },
      error => {
        this.errorMessage = 'Error en la solicitud: ' + error.message;
      }
    );
  
  }

  obtenerUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe(r => {
      if (!r.error) {
        this.usuarios = r.data.data;
        //console.log(r.data.data);
      }
    });
  }

  mostrarFormulario(): void {
    this.formularioVisible = true;
  }

  ocultarFormulario(): void {
    this.formularioVisible = false;
    this.formularioUsuario.reset();
    this.usuarioIdEditando = null;
  }

  applyFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      const filterValue = inputElement.value;
      this.tbusuarios.filterGlobal(filterValue, 'contains');
    }
  }


  guardarUsuario(): void {
    const formData = this.formularioUsuario.value;

    const transformedData = this.transformFormData(formData);
  
    let confirmacionMensaje = '';
    let confirmacionTitulo = '';
    let accion = '';
  
    // Determinar el mensaje y la acción según si se está editando o no
    if (this.usuarioIdEditando) {
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
        if (this.usuarioIdEditando) {
          //console.log (transformedData);
          this.usuarioService.updateUsuario(this.usuarioIdEditando, transformedData).subscribe(r => {
            if (!r.error) {
              Swal.fire('Listo', `Estado actualizado correctamente`, 'success').then(() => {
                this.usuarioIdEditando = null;
                this.obtenerUsuarios();
                this.ocultarFormulario();
              })
            } else {
              Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
            }
          });
        } else {
          this.usuarioService.insertUsuario(transformedData).subscribe(r => {
            if (!r.error) {
              Swal.fire('Listo', `Estado agregado correctamente`, 'success').then(() => {
                this.obtenerUsuarios();
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


  // Función para transformar los datos del formulario
  private transformFormData(formData: any): any {
    const { selectedDepart, ...rest } = formData;
    return {
      ...rest,
      departamentoid: selectedDepart.departamentoid
    };
  }


  editarUsuario(usuario: any): void {
    //console.log('Usuario editado:', usuario);

    // Convertir el departamentoid del usuario a un número
    const usuarioDepartamentoId = parseInt(usuario.departamentoid, 10);

    // Busca el departamento correspondiente al usuario editado
    const departamentoSeleccionado = this.departamentos.find(departamento => departamento.departamentoid === usuarioDepartamentoId);
    //console.log('Departamento seleccionado:', departamentoSeleccionado);
    // Asigna el departamento seleccionado al formulario
    this.formularioUsuario.patchValue({
        selectedDepart: departamentoSeleccionado,
        cedula: usuario.cedula,
        nombre: usuario.nombre,
        apellido: usuario.apellido
    });

    // Muestra el formulario de edición
    this.usuarioIdEditando = usuario.usuarioid;
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

  eliminarUsuario(usuario: any): void {
    // Lógica para eliminar el estado
  }

}
