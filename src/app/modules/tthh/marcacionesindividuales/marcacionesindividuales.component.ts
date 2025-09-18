import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartamentosService } from '@data/services/api/departamentos/departamentos.service';
import { UsuariosService } from '@data/services/api/usaurios/usuarios.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Table } from 'primeng/table';
import Swal from 'sweetalert2';
import { FinancieroService } from '@data/services/financiero/financiero.service';
import { SisoService } from '@data/services/tthh/siso/siso.service';
import { TthhService } from '@data/services/tthh/tthh.service';
import { AuthService } from '@data/services/api/auth.service';
import saveAs from 'file-saver';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-marcacionesindividuales',
  templateUrl: './marcacionesindividuales.component.html',
  styleUrl: './marcacionesindividuales.component.scss',
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
export class MarcacionesindividualesComponent {
@ViewChild('tbMarcaciones') tbMarcaciones!: Table; // Añade @ViewChild para obtener la referencia a la tabla


  marcaciones: any[] = [];
  // departamentos: any[] = [];
  errorMessage = '';

  cedulaSearchValue: string = '';
  
  formularioMarcaciones!: FormGroup; // Propiedad para el formulario
  formularioVisible: boolean = false;
  formularioVisible2 : boolean = false;

  clienteIdEditando: number | null = null; // Propiedad para almacenar el ID del estado en edición
  
  primerNombre: string = ''; // Variable para almacenar el primer nombre
  cedula: string = '';
 
  constructor(
    private fb: FormBuilder,
    private tthhService: TthhService,
    private authService: AuthService,
  ) {
    const userDataString = sessionStorage.getItem('currentUserGADMLL');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.cedula = userData.CEDULA;
    }
   }


  ngOnInit(): void {

        
    this.formularioMarcaciones = this.fb.group({
      fecha_desde: [null],
      fecha_hasta: [''],
      cedula: ['']
    });

    this.mostrarFormulario2();

  }

  mostrarFormulario(): void {
    this.formularioVisible = true;
    // this.formularioVisible2 = false;
    // this.recaudaciones = [];
  }

  mostrarFormulario2(): void {
    this.formularioVisible2 = true;
    this.formularioVisible = false;
    this.formularioMarcaciones.reset();
    this.marcaciones = [];

  }

  ocultarFormulario(): void {
    this.formularioVisible = false;
    this.formularioMarcaciones.reset();
    this.clienteIdEditando = null;
  }

  ocultarFormulario2(): void {
    // this.formularioVisible2 = false;
    this.formularioVisible = false;
    this.formularioMarcaciones.reset();
    this.marcaciones = [];
    //this.tbhistorial.clearGlobalFilter()
    this.tbMarcaciones.reset();
    // this.clienteIdEditando = null;
  }

  applyFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      const filterValue = inputElement.value;
      this.tbMarcaciones.filterGlobal(filterValue, 'contains');
    }
  }

  loadDataCM(): void {
    
    const fecha_desde = this.formularioMarcaciones.get('fecha_desde')?.value;
    const fecha_hasta = this.formularioMarcaciones.get('fecha_hasta')?.value;
    const cedula = this.cedula;
    //console.log('Cedula: '+cedula);

    if (fecha_desde && fecha_hasta) {

      const formattedFecha_desde = this.formatDate(fecha_desde);
      const formattedFecha_hasta = this.formatDate(fecha_hasta);
      // console.log(formattedFecha_desde + ' - ' + formattedFecha_hasta);
      this.tthhService.getMarcaciones(formattedFecha_desde, formattedFecha_hasta, cedula).subscribe({
        next: (response) => {
          this.marcaciones = response.data;
          // console.log(this.unidades);
          this.mostrarFormulario();
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud HTTP',
            text: 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.',
            confirmButtonText: 'Ok'
          });
        }
      });
      //console.log(fecha);
      
    } else {
      Swal.fire('Error', 'Debe ingresar la fecha a consultar', 'error');
    }
  }  

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }


  
  // Función para transformar los datos del formulario
  private transformFormData(formData: any): any {
    const { selectedDepart, ...rest } = formData;
    return {
      ...rest,
      clienteid: selectedDepart.clienteid
    };
  }


  exportarExcel() {
    // Obtiene las fechas del formulario
    const fecha_desde = this.formularioMarcaciones.get('fecha_desde')?.value;
    const fecha_hasta = this.formularioMarcaciones.get('fecha_hasta')?.value;
  
    // Formatea las fechas si están disponibles
    const formattedFecha_desde = fecha_desde ? this.formatDate(fecha_desde) : '';
    const formattedFecha_hasta = fecha_hasta ? this.formatDate(fecha_hasta) : '';
    
    // Configura el nombre del archivo con las fechas
    const nombreArchivo = `MARCACIONES_${formattedFecha_desde}_a_${formattedFecha_hasta}.xlsx`;
  
    // Mostrar la alerta de carga
    Swal.fire({
      title: 'Generando archivo Excel...',
      text: 'Por favor, espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    // Reestructura los datos para incluir solo los campos deseados y en el orden deseado
    const data = this.marcaciones.map(marcacion => ({
      'Num. Solicitud': marcacion.numeroSolicitud,
      'Apellidos y Nombres': marcacion.apellidosNombres,
      'Fecha Desde': marcacion.fechaDesde,
      'Fecha Hasta': marcacion.fechaHasta,
      'Días de Permiso': marcacion.diasPermiso,
      'Tipo de Permiso': marcacion.tipoPermiso,
      'Diagnóstico/Comentario': marcacion.diagnosticoComentario,
      'Ingresado Por': marcacion.ingresadoPor,
      'Fecha Ingreso': marcacion.fechaIngreso
    }));
  
    // Crea la hoja de trabajo
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'Datos de Marcaciones': worksheet }, SheetNames: ['Datos de Marcaciones'] };
  
    // Genera el archivo Excel y lo descarga con el nombre configurado
    XLSX.writeFile(workbook, nombreArchivo);
  
    // Cierra la alerta de carga después de la exportación
    Swal.close();
  
    // Muestra una notificación de éxito
    Swal.fire({
      icon: 'success',
      title: 'Archivo Excel generado exitosamente',
      showConfirmButton: false,
      timer: 1500
    });
  }
}
