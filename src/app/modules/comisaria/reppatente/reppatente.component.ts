import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ComisariaService } from '@data/services/comisaria/comisaria.service';
import { FinancieroService } from '@data/services/financiero/financiero.service';
import { Table } from 'primeng/table';
import Swal from 'sweetalert2';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-reppatente',
  templateUrl: './reppatente.component.html',
  styleUrl: './reppatente.component.scss',
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
export class ReppatenteComponent {

  @ViewChild('tbRepPatente') tbRepPatente!: Table; // Añade @ViewChild para obtener la referencia a la tabla


  reporte: any[] = [];
  // departamentos: any[] = [];
  errorMessage = '';

  cedulaSearchValue: string = '';
  
  formularioRepPatente!: FormGroup; // Propiedad para el formulario
  formularioVisible: boolean = false;
  formularioVisible2 : boolean = false;

  clienteIdEditando: number | null = null; // Propiedad para almacenar el ID del estado en edición
  
  primerNombre: string = ''; // Variable para almacenar el primer nombre
 
 
  constructor(
    private fb: FormBuilder,
    private comisariaService: ComisariaService // Inyecta el servicio aquí
    //private clienteService: ClientesService,
    // private departamentosService: DepartamentosService
    //private insertEstadoService : InsertEstadosService
  ) { }


  ngOnInit(): void {

        
    this.formularioRepPatente = this.fb.group({
      //cedula_search: [''],
      date: [''],
      // cedula: ['', Validators.required],  // Campo de fecha requerido
      // nombre: ['', Validators.required],  // Campo de fecha requerido
      // departamento: ['', Validators.required],  // Campo de fecha requerido
      // cargo: ['', Validators.required],  // Campo de fecha requerido
      //direccion: ['', Validators.required],  // Campo de fecha requerido
    });
    // this.obtenerUsuarios();
    
     // Carga los eventos desde el servicio
    //  this.departamentosService.getDepartShort().subscribe(
    //   response => {
    //     if (!response.error) {
    //       this.departamentos = response.data.data;
    //       // if (this.departamentos.length > 0) {
    //       //   // Selecciona el primer evento por defecto
    //       //   this.formularioUsuario.patchValue({ selectedDepart: this.departamentos[0] });
    //       //   console.log('dato ', this.departamentos[0]);
    //       //   // Habilita el campo después de establecer el valor por defecto
    //       //   const selectedDepartControl = this.formularioUsuario.get('selectedDepart');
    //       //   // if (selectedEventControl) {
    //       //   //   selectedEventControl.disable();
    //       //   // } 
    //       // }
    //     } else {
    //       this.errorMessage = response.msg;
    //     }
    //   },
    //   error => {
    //     this.errorMessage = 'Error en la solicitud: ' + error.message;
    //   }
    // );

    this.mostrarFormulario2();
    // this.historiaEmpleadoByPeriod();
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
    // this.formularioVisible2 = false;
    // this.recaudaciones = [];
  }

  mostrarFormulario2(): void {
    this.formularioVisible2 = true;
    this.formularioVisible = false;
    this.formularioRepPatente.reset();
    this.reporte = [];

  }

  ocultarFormulario(): void {
    this.formularioVisible = false;
    this.formularioRepPatente.reset();
    this.clienteIdEditando = null;
  }

  ocultarFormulario2(): void {
    // this.formularioVisible2 = false;
    // this.formularioVisible = false;
    this.formularioRepPatente.reset();
    this.reporte = [];
    //this.tbhistorial.clearGlobalFilter()
    this.tbRepPatente.reset();
    // this.clienteIdEditando = null;
  }


  applyFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      const filterValue = inputElement.value;
      this.tbRepPatente.filterGlobal(filterValue, 'contains');
    }
  }



  loadData(): void {
    // const fecha = this.formularioRepPatente.get('date')?.value;
    // const fecha = this.formularioRepPatente.get('date')?.value;

    // if (fecha) {
      
      // const formattedDate = this.formatDate(fecha);
      // console.log(formattedDate);
      Swal.fire({
        title: 'Consultando datos...',
        text: 'Por favor, espere un momento.',
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      //console.log(fecha);
      this.comisariaService.getRepPatente().subscribe(r => {
        Swal.close();

        if (!r.error && r.data) {
          // Limpiamos la lista de clientes y añadimos el cliente encontrado
          this.reporte = r.data; // Actualiza la lista de clientes con la respuesta
          this.mostrarFormulario();
          //console.log(this.empleados);
          // Asignar los primeros datos al formulario
          // if (this.empleados.length > 0) {
          //   this.formularioRepPatente.patchValue({
          //     cedula: this.empleados[0].CEDULA,
          //     nombre: this.empleados[0].NOMBRE,
          //     // Otros campos si es necesario
          //   });
          // }
          // this.clientes = r.data.cliente;
          this.tbRepPatente.reset(); // Reiniciamos la tabla para aplicar los cambios
          //Swal.fire('Cliente encontrado', `Datos cargados correctamente`, 'success');
        } else {
          this.reporte =[];
          // Swal.fire('Datos no encontrado', 'No se encontraron datos para la consulta realizada', 'error');
          Swal.fire({
            title: 'Datos no encontrados',
            text: 'No se encontraron datos para la consulta realizada. ¿Desea generar el reporte?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
          }).then((result) => {
            if (result.isConfirmed) {
              // Si el usuario elige "Sí", llama a la función para generar el reporte con valores predeterminados
              this.exportarPDF();
            }
          });
        }
      });
    // } else {
    //   Swal.fire('Error', 'Debe ingresar la fecha a consultar', 'error');
    // }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }


  historiaEmpleadoByPeriod(): void {
    // const cedula = this.formularioRepPatente.get('anio')?.value;
    // const anio = anio;

    // if (anio) {
      Swal.fire({
        title: 'Consultando datos...',
        text: 'Por favor, espere un momento.',
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // this.tthhService.getEmployeeRelationPeriod().subscribe(r => {
      //   Swal.close();

      //   if (!r.error && r.data) {
      //     // Limpiamos la lista de clientes y añadimos el cliente encontrado
      //     this.empleados = r.data; // Actualiza la lista de empleados con la respuesta
      //     //console.log(this.empleados);
      //     // Asignar los primeros datos al formulario
      //     // if (this.empleados.length > 0) {
      //     //   this.formularioRepPatente.patchValue({
      //     //     cedula: this.empleados[0].CEDULA,
      //     //     nombre: this.empleados[0].NOMBRE,
      //     //     // Otros campos si es necesario
      //     //   });
      //     // }
      //     //this.clientes = r.data.cliente;
      //     this.tbhistorial.reset(); // Reiniciamos la tabla para aplicar los cambios
      //     //Swal.fire('Cliente encontrado', `Datos cargados correctamente`, 'success');
      //   } else {
      //     this.empleados =[];
      //     Swal.fire('Empleado no encontrado', 'No se encontraron datos para la cédula ingresada', 'error');
      //   }
      // });
    // } else {
    //   Swal.fire('Error', 'Debe ingresar la cédula para realizar la búsqueda', 'error');
    // }
  }


  guardarUsuario(): void {
    // const formData = this.formularioClientes.value;

    // //const transformedData = this.transformFormData(formData);

    // let confirmacionMensaje = '';
    // let confirmacionTitulo = '';
    // let accion = '';

    // // Determinar el mensaje y la acción según si se está editando o no
    // if (this.clienteIdEditando) {
    //   confirmacionTitulo = 'Actualizar';
    //   confirmacionMensaje = '¿Estás seguro de que quieres actualizar este estado?';
    //   accion = 'actualizar';
    // } else {
    //   confirmacionTitulo = 'Agregar';
    //   confirmacionMensaje = '¿Estás seguro de que quieres agregar este estado?';
    //   accion = 'agregar';
    // }

    // if (this.formularioClientes.valid) {
    //   // Mostrar el mensaje de confirmación
    //   Swal.fire({
    //     title: confirmacionTitulo,
    //     text: confirmacionMensaje,
    //     icon: 'question',
    //     showCancelButton: true,
    //     confirmButtonText: 'Sí',
    //     cancelButtonText: 'No'
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       // Si el usuario confirma, realizar la acción correspondiente
    //       if (this.clienteIdEditando) {
    //         // Actualizar cliente
    //         // this.clienteService.actualizarCliente(formData).subscribe(r => {
    //         //   if (!r.error) {
    //         //     Swal.fire('Listo', `Cliente actualizado correctamente`, 'success').then(() => {
    //         //       this.clienteIdEditando = null;
    //         //       // Actualizar la lista de clientes si es necesario
    //         //       this.obtenerClientes();
    //         //       this.ocultarFormulario();
    //         //     });
    //         //   } else {
    //         //     Swal.fire('Error', 'No se pudo actualizar el cliente', 'error');
    //         //   }
    //         // });
    //       } else {
    //         // this.clienteService.insertCliente(formData).subscribe(r => {
    //         //   if (!r.error) {
    //         //     Swal.fire('Listo', `Cliente agregado correctamente`, 'success').then(() => {
    //         //       //this.obtenerUsuarios();
    //         //       this.ocultarFormulario();
    //         //     });
    //         //   } else {
    //         //     Swal.fire('Error', 'No se pudo agregar el cliente', 'error');
    //         //   }
    //         // });
    //       }
    //     }
    //   });
    // }else{ 
    //   Swal.fire('Error', 'Datos incompletos.', 'error');
    //   //console.log(this.formularioClientes);
    // }
  }


  // Función para transformar los datos del formulario
  private transformFormData(formData: any): any {
    const { selectedDepart, ...rest } = formData;
    return {
      ...rest,
      clienteid: selectedDepart.clienteid
    };
  }


  editarUsuario(cliente: any): void {
    // //console.log('Cliente editado:', cliente);

    // // Convertir el departamentoid del usuario a un número
    // const clienteId = parseInt(cliente.clienteid, 10);

    // // Busca el departamento correspondiente al usuario editado
    // const clienteSeleccionado = this.clientes.find(cliente => cliente.clienteid === clienteId);
    // //console.log('Cliente seleccionado:', clienteSeleccionado);
    // // Asigna el departamento seleccionado al formulario
    // this.formularioClientes.patchValue({
    //     //selectedDepart: departamentoSeleccionado,
    //     //cedula_search : '',
    //     cedula: cliente.cedula,
    //     nombre: cliente.nombre,
    //     direccion: cliente.direccion,
    //     telefono: cliente.telefono,
    //     email: cliente.email
    // });


    // // Muestra el formulario de edición
    // this.clienteIdEditando = cliente.clienteid;
    // this.formularioVisible = true;
    //   // this.formularioUsuario.patchValue({
    //   //   selectedDepart: usuario.departamentoid,
    //   //   cedula: usuario.cedula,
    //   //   nombre: usuario.nombre,
    //   //   apellido: usuario.apellido
    //   // });
    //   // this.usuarioIdEditando = usuario.usuarioid;
    //   // this.mostrarFormulario();
  }

  eliminarUsuario(usuario: any): void {
    // Lógica para eliminar el estado
  }


  exportarExcel() {

    // Definir el nuevo orden de columnas
    const columnasOrdenadas = [
      'IDLOCAL',
      'RAZON_SOCIAL_LOCAL',
      'ACTIVIDAD_ECONOMICA',
      'IDCONTRI',
      'CEDULA',
      'CONTRIB_NEGOCIO',
      'DIRECCION_LOCAL',
      'COD_CATASTRAL',
      'SECTOR',
      'PATENTE_ULTIMA',
      'FUNCIONAMIENTO_ULTIMA',
      'ESTADO'
    ];
  
    // Reordenar los datos según el nuevo orden de columnas
    const datosReordenados = this.reporte.map(rep => {
      const reordenado: any = {};
      columnasOrdenadas.forEach(columna => {
        reordenado[columna] = rep[columna];
      });
      return reordenado;
    });

    // Crear un nuevo libro de trabajo (workbook)
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    
    // Convertir los datos reordenados a una hoja de cálculo (worksheet)
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosReordenados);
    
    // Añadir la hoja de cálculo al libro de trabajo
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    
    // Convertir el libro de trabajo a un blob
    const wbout: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Obtener la fecha actual en formato yyyy-mm-dd
    const fechaActual = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    
    // Crear el nombre del archivo con la fecha actual
    const nombreArchivo = `REPORTE_AL_${fechaActual}.xlsx`;
    
    // Guardar el archivo Excel
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, nombreArchivo);
  }

  exportarPDF(){
    // const fecha = this.formularioRepPatente.get('date')?.value;

    // if (fecha) {
    //   // Asegúrate de que la fecha esté en el formato correcto
    //   const formattedDate = this.formatDate(fecha);
  
    //   this.financieroService.getPdfReporte(formattedDate)
    //     .subscribe(
    //       (response: Blob) => {
           
    //          // Crea un nuevo Blob con la respuesta del servidor
    //          const blob = new Blob([response], { type: 'application/pdf' });

    //          // Formatea la fecha para usarla en el nombre del archivo
    //          const fileDate = new Date(formattedDate).toISOString().split('T')[0]; // yyyy-mm-dd
    //          const fileName = `CMR_${fileDate}.pdf`;
     
    //          // Usa FileSaver.js para guardar el archivo
    //          saveAs(blob, fileName);
    //       },
    //       error => {
    //         console.error('Error al descargar el PDF', error);
    //         // Maneja el error, por ejemplo, mostrando un mensaje al usuario
    //       }
    //     );
    // } else {
    //   console.error('Fecha no proporcionada.');
    //   // Maneja el error, por ejemplo, mostrando un mensaje al usuario
    // }
  }


}
