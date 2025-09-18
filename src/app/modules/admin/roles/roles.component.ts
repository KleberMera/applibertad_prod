import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RolesService } from '@data/services/admin/roles.service';
import { Table } from 'primeng/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
   animations: [
    trigger('formularioAnimacion', [
      state('void', style({
        opacity: 0,
        transform: 'scaleY(0)'  // Escala verticalmente a 0 en vez de ajustar la altura
      })),
      state('*', style({
        opacity: 1,
        transform: 'scaleY(1)'  // Escala verticalmente a 1 para mostrar completamente
      })),
      transition('void => *', animate('200ms ease-in')),  // Acelera la animación de entrada
      //transition('* => void', animate('100ms ease-out'))  // Acelera la animación de salida
    ])
  ]
})


export class RolesComponent implements OnInit {

  @ViewChild('tbRoles') tbroles!: Table; // Añade @ViewChild para obtener la referencia a la tabla


  roles: any[] = [];
  //departamentos: any[] = [];
  errorMessage = '';

  cedulaSearchValue: string = '';
  
  formularioRoles!: FormGroup; // Propiedad para el formulario
  formularioVisible: boolean = false;
  formularioVisible2 : boolean = false;

  rolIdEditando: number | null = null; // Propiedad para almacenar el ID del estado en edición
  rolEditando: string | null = null; // Propiedad para almacenar el ID del estado en edición
  
 
 
  constructor(
    private fb: FormBuilder,
    private rolesService: RolesService
    //private clienteService: ClientesService,
    // private departamentosService: DepartamentosService
    //private insertEstadoService : InsertEstadosService
  ) { }


  ngOnInit(): void {

        
    this.formularioRoles = this.fb.group({
      //cedula_search: [''],
      rol: ['', Validators.required],  // Campo de fecha requerido
      descripcion: ['', Validators.required],  // Campo de fecha requerido
      // telefono: ['', Validators.required],  // Campo de fecha requerido
      // email: ['', Validators.required],  // Campo de fecha requerido
      // direccion: ['', Validators.required],  // Campo de fecha requerido
    });

    this.obtenerRoles();
    
  
  }


  obtenerRoles(): void {
    //console.log("llamo a obtener roles");
    this.rolesService.getRoles().subscribe(response => {
      if (!response.error) {
        //console.log("datos .. " + response.data);
        this.roles = response.data;
        //console.log(this.roles);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: response.msg,
          confirmButtonText: 'Ok'
        });
      }
    });
  }


  mostrarFormulario(): void {
    this.formularioVisible = true;
    this.formularioVisible2 = false;
    //this.roles = [];
  }

  mostrarFormulario2(): void {
    this.formularioVisible2 = true;
    this.formularioVisible = false;
    this.formularioRoles.reset();
    //this.roles = [];
  }

  ocultarFormulario(): void {
    this.formularioVisible = false;
    this.formularioRoles.reset();
    this.rolIdEditando = null;
  }

  ocultarFormulario2(): void {
    this.formularioVisible2 = false;
    this.formularioVisible = false;
    this.formularioRoles.reset();
    this.rolIdEditando = null;
  }


  applyFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      const filterValue = inputElement.value;
      this.tbroles.filterGlobal(filterValue, 'contains');
    }
  }



  clientesByCed(): void {
    const cedula = this.formularioRoles.get('cedula')?.value;

    if (cedula) {
      Swal.fire({
        title: 'Consultando cliente...',
        text: 'Por favor, espere un momento.',
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // this.clienteService.getClienteByCedula(cedula).subscribe(r => {
      //   Swal.close();

      //   if (!r.error && r.data) {
      //     //console.log(r.data.cliente);
      //     // Limpiamos la lista de clientes y añadimos el cliente encontrado
      //     this.clientes = r.data.cliente;
      //     this.tbclientes.reset(); // Reiniciamos la tabla para aplicar los cambios
      //     //Swal.fire('Cliente encontrado', `Datos cargados correctamente`, 'success');
      //   } else {
      //     this.clientes =[];
      //     Swal.fire('Cliente no encontrado', 'No se encontraron datos para la cédula ingresada', 'error');
      //   }
      // });
    } else {
      Swal.fire('Error', 'Debe ingresar la cédula para realizar la búsqueda', 'error');
    }
  }


  guardarRol(): void {
    const formData = this.formularioRoles.value;
    let confirmacionMensaje = '';
    let confirmacionTitulo = '';
    let accion = '';
  
    // Determinar el mensaje y la acción según si se está editando o no
    if (this.rolIdEditando) {
      confirmacionTitulo = 'Actualizar';
      confirmacionMensaje = '¿Estás seguro de que quieres actualizar este rol?';
      accion = 'actualizar';
    } else {
      confirmacionTitulo = 'Agregar';
      confirmacionMensaje = '¿Estás seguro de que quieres agregar este rol?';
      accion = 'agregar';
    }
  
    if (this.formularioRoles.valid) {
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
          if (this.rolIdEditando) {
            if (this.rolEditando != formData.rol) {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "No se puede cambiar el nombre del rol",
                confirmButtonText: 'Ok'
              });
            }
            // Actualizar rol
            this.rolesService.updateRol(this.rolIdEditando, formData).subscribe(response => {
              if (!response.error) {
                Swal.fire('Listo', `Rol actualizado correctamente`, 'success').then(() => {
                  this.rolIdEditando = null;
                  this.obtenerRoles();
                  this.ocultarFormulario();
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: response.msg,
                  confirmButtonText: 'Ok'
                });
                //Swal.fire('Error', 'No se pudo actualizar el rol', 'error');
              }
            });
          } else {
            // Agregar nuevo rol
            this.rolesService.insertRol(formData).subscribe(response => {
              if (!response.error) {
                Swal.fire('Listo', `Rol agregado correctamente`, 'success').then(() => {
                  this.obtenerRoles();
                  this.ocultarFormulario();
                });
              } else {
                Swal.fire('Error', 'No se pudo agregar el rol', 'error');
              }
            });
          }
        }
      });
    } else {
      //console.log('error datos incompletos ' + this.formularioRoles);
      Swal.fire('Error', 'Datos incompletos.', 'error');
    }
  }


  // Función para transformar los datos del formulario
  private transformFormData(formData: any): any {
    const { selectedDepart, ...rest } = formData;
    return {
      ...rest,
      clienteid: selectedDepart.clienteid
    };
  }


  editarRol(rol: any): void {
    //console.log('Rol editado:', rol);

    // Pone los valores del rol en el formulario para editar
    this.rolIdEditando = rol.ROLE_ID;
    this.rolEditando = rol.ROLE_NAME;

    this.formularioRoles.patchValue({
      rol: rol.ROLE_NAME,
      descripcion: rol.DESCRIPTION
    });
    
    // Muestra el formulario de edición
    //this.rolIdEditando = rol.roleid;
    this.formularioVisible = true;
    
  }

  eliminarRol(usuario: any): void {
    // Lógica para eliminar el estado
  }

}
