import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RolesService } from '@data/services/admin/roles.service';
import { UsersService } from '@data/services/admin/users.service';
import { Table } from 'primeng/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
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


export class UsersComponent implements OnInit {

  @ViewChild('tbUsuarios') tbusuarios!: Table; // Añade @ViewChild para obtener la referencia a la tabla
  //@ViewChild('usernameInput') usernameInput!: ElementRef;

  yaTieneUsuario: boolean = false;
  usuariosRegistrados: any[] = [];

  usuarios: any[] = [];
  roles: any[] = [];
  errorMessage = '';

  cedulaSearchValue: string = '';
  
  formularioUsuarios!: FormGroup; // Propiedad para el formulario
  formularioVisible: boolean = false;
  formularioVisible2 : boolean = false;

  clienteIdEditando: number | null = null; // Propiedad para almacenar el ID del estado en edición
 
  constructor(
    private fb: FormBuilder,
    private rolesService: RolesService,
    private usersService: UsersService
    //private renderer: Renderer2
    //private clienteService: ClientesService,
    // private departamentosService: DepartamentosService
    //private insertEstadoService : InsertEstadosService
  ) { }


  ngOnInit(): void {
    this.formularioUsuarios = this.fb.group({
      cedula_search: [''],
      personId : ['', Validators.required],
      cedula: ['', Validators.required],
      nombre: ['', Validators.required],
      cargo: ['', Validators.required],
      departamento: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    // Carga los roles
    this.rolesService.getRolesShort().subscribe(
      response => {
        if (!response.error) {
          this.roles = response.data;
        } else {
          this.errorMessage = response.msg;
        }
      },
      error => {
        this.errorMessage = 'Error en la solicitud: ' + error.message;
      }
    );

    // Carga usuarios ya registrados
    this.usersService.getAllUsers().subscribe(res => {
      if (!res.error && res.data) {
        this.usuariosRegistrados = res.data;
      }
    });

    // 🔁 Suscribirse a cambios en cedula_search para limpiar campos relacionados
    this.formularioUsuarios.get('cedula_search')?.valueChanges.subscribe(() => {
      this.yaTieneUsuario = false;

      this.formularioUsuarios.patchValue({
        personId: '',
        cedula: '',
        nombre: '',
        departamento: '',
        cargo: '',
        username: '',
      });

      // También puedes resetear el campo password si deseas
      // this.formularioUsuarios.get('password')?.reset();
    });
  }



  obtenerClientes(): void {
    // this.clienteService.getClientes().subscribe(r => {
    //   if (!r.error) {
    //     this.clientes = r.data.clientes;
    //     //console.log(r.data.clientes);
    //   }
    // });
  }


  mostrarFormulario(): void {
    this.formularioVisible = true;
    this.formularioVisible2 = false;
    this.usuarios = [];
  }

  mostrarFormulario2(): void {
    this.formularioVisible2 = true;
    this.formularioVisible = false;
    this.formularioUsuarios.reset();
    this.usuarios = [];
    this.loadUsuarios();
  }


  loadUsuarios(): void {
    this.usersService.getUsersRoles().subscribe({
      next: (response) => {
        if (response.error) {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: response.msg,
            confirmButtonText: 'Ok'
          });
        } else {
          this.usuarios = response.data;
          //console.log(this.usuarios);
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error de red',
          text: 'No se pudo conectar con el servidor.',
          confirmButtonText: 'Ok'
        });
        console.error('Error en la solicitud HTTP:', err);
      }
    });
  }
  // loadUsuarios(): void {
  //   this.usersService.getAllUsers().subscribe({
  //     next: (response) => {
  //       if (response.error) {
  //         Swal.fire({
  //           icon: 'error',
  //           title: 'Error!',
  //           text: response.msg,
  //           confirmButtonText: 'Ok'
  //         });
  //       } else {
  //         this.usuarios = response.data;
  //         console.log(this.usuarios);
  //       }
  //     },
  //     error: (err) => {
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Error de red',
  //         text: 'No se pudo conectar con el servidor.',
  //         confirmButtonText: 'Ok'
  //       });
  //       console.error('Error en la solicitud HTTP:', err);
  //     }
  //   });
  // }

  ocultarFormulario(): void {
    this.formularioVisible = false;
    this.formularioUsuarios.reset();
    this.clienteIdEditando = null;
  }

  ocultarFormulario2(): void {
    this.formularioVisible2 = false;
    this.formularioVisible = false;
    this.formularioUsuarios.reset();
    this.clienteIdEditando = null;
  }


  applyFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      const filterValue = inputElement.value;
      this.tbusuarios.filterGlobal(filterValue, 'contains');
    }
  }



  usuarioByCed(): void {
    const cedula = this.formularioUsuarios.get('cedula_search')?.value;

    if (cedula) {
      Swal.fire({
        title: 'Consultando datos...',
        text: 'Por favor, espere un momento.',
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.usersService.getUserDataByCedula(cedula).subscribe(r => {
        Swal.close();
        ////console.log("datos recibidos", r.data);
        if (!r.error && r.data) {

          const nombreCompleto = r.data[0].NOMBRE.trim();
          const nombres = nombreCompleto.split(' ');
          const primerNombre = nombres[nombres.length - 2]; // Último nombre
          const segundoNombre = nombres[nombres.length - 1]; // Segundo nombre
          const primerApellido = nombres[0]; // Primer apellido
          const segundoApellido = nombres[1]; // Segundo apellido

          //console.log(nombreCompleto);
          //console.log(nombres);
          //console.log(primerNombre);
          //console.log(segundoNombre);
          //console.log(primerApellido);
          //console.log(segundoApellido);
          
          const sugerenciaUsername = `${primerNombre[0].toLowerCase()}${segundoNombre[0].toLowerCase()}${primerApellido.toLowerCase()}${segundoApellido[0].toLowerCase()}`; 

          const personIdConsultado = r.data[0].ID?.trim?.();
          // console.log('persona consutada: ', personIdConsultado);

          // 🔍 Compara si ya tiene usuario
          this.yaTieneUsuario = this.usuariosRegistrados.some(
            u => u.PERSON_ID?.trim?.() === personIdConsultado
          );
          // console.log(u.PERSON_ID);
     
          // Asume que los datos recibidos son del tipo { nombre: string, departamento: string, cargo: string }
          this.formularioUsuarios.patchValue({
            personId: r.data[0].ID,
            cedula: r.data[0].CEDULA,
            nombre: r.data[0].NOMBRE,
            departamento: r.data[0].DEPARTAMENTO,
            cargo: r.data[0].CARGO,
            username : sugerenciaUsername
          });
          //this.usernameInput.nativeElement.focus();
          //Swal.fire('Datos cargados', 'Datos cargados correctamente', 'success');
        } else {
          Swal.fire('Error', r.msg || 'No se encontraron datos para la cédula ingresada', 'error');
        }
      });
    } else {
      Swal.fire('Error', 'Debe ingresar la cédula para realizar la búsqueda', 'error');
    }
  
  }

  guardarUsuario(): void {
    if (this.formularioUsuarios.valid) {
      const formData = this.formularioUsuarios.value;

      Swal.fire({
        title: 'Agregar',
        text: '¿Estás seguro de que quieres agregar este usuario?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.isConfirmed) {
          // Llamar al servicio para insertar un nuevo usuario
          this.usersService.insertUser(formData).subscribe(r => {
            //console.log("error: ", r.error);
            if (!r.error) {
              Swal.fire('Listo', `Usuario agregado correctamente`, 'success').then(() => {
                //this.ocultarFormulario();
                this.formularioUsuarios.reset();
              });
            } else {
              Swal.fire('Error', r.msg || 'No se pudo agregar el usuario', 'error');
            }
          });
        }
      });
    } else {
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


  editarUsuario(usuario: any): void {
    //console.log('Cliente editado:', cliente);

    // Convertir el departamentoid del usuario a un número
    const clienteId = parseInt(usuario.clienteid, 10);

    // Busca el departamento correspondiente al usuario editado
    const clienteSeleccionado = this.usuarios.find(usuario => usuario.clienteid === clienteId);
    //console.log('Cliente seleccionado:', clienteSeleccionado);
    // Asigna el departamento seleccionado al formulario
    this.formularioUsuarios.patchValue({
        //selectedDepart: departamentoSeleccionado,
        //cedula_search : '',
        cedula: usuario.cedula,
        nombre: usuario.nombre,
        direccion: usuario.direccion,
        telefono: usuario.telefono,
        email: usuario.email
    });


    // Muestra el formulario de edición
    this.clienteIdEditando = usuario.clienteid;
    this.formularioVisible = true;
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
