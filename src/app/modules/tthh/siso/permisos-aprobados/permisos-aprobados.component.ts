import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FinancieroService } from '@data/services/financiero/financiero.service';
import { SisoService } from '@data/services/tthh/siso/siso.service';
import saveAs from 'file-saver';
import { Table } from 'primeng/table';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-permisos-aprobados',
  templateUrl: './permisos-aprobados.component.html',
  styleUrl: './permisos-aprobados.component.scss',
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
export class PermisosAprobadosComponent {
  @ViewChild('tbPermisos') tbPermisos!: Table; // Añade @ViewChild para obtener la referencia a la tabla


  permisos: any[] = [];
  // departamentos: any[] = [];
  errorMessage = '';

  cedulaSearchValue: string = '';
  
  formularioPermisos!: FormGroup; // Propiedad para el formulario
  formularioVisible: boolean = false;
  formularioVisible2 : boolean = false;

  clienteIdEditando: number | null = null; // Propiedad para almacenar el ID del estado en edición
  
  primerNombre: string = ''; // Variable para almacenar el primer nombre
 
 
  constructor(
    private fb: FormBuilder,
    private sisoService: SisoService
  ) { }


  ngOnInit(): void {

        
    this.formularioPermisos = this.fb.group({
      fecha_desde: [null],
      fecha_hasta: ['']
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
    this.formularioPermisos.reset();
    this.permisos = [];

  }

  ocultarFormulario(): void {
    this.formularioVisible = false;
    this.formularioPermisos.reset();
    this.clienteIdEditando = null;
  }

  ocultarFormulario2(): void {
    // this.formularioVisible2 = false;
    this.formularioVisible = false;
    this.formularioPermisos.reset();
    this.permisos = [];
    //this.tbhistorial.clearGlobalFilter()
    this.tbPermisos.reset();
    // this.clienteIdEditando = null;
  }


  applyFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      const filterValue = inputElement.value;
      this.tbPermisos.filterGlobal(filterValue, 'contains');
    }
  }


  loadDataCM(): void {
    
    const fecha_desde = this.formularioPermisos.get('fecha_desde')?.value;
    const fecha_hasta = this.formularioPermisos.get('fecha_hasta')?.value;
    

    if (fecha_desde && fecha_hasta) {

      const formattedFecha_desde = this.formatDate(fecha_desde);
      const formattedFecha_hasta = this.formatDate(fecha_hasta);
      // console.log(formattedFecha_desde + ' - ' + formattedFecha_hasta);
      this.sisoService.getPermisosAprobados(formattedFecha_desde, formattedFecha_hasta).subscribe({
        next: (response) => {
          this.permisos = response.data;
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
      this.ocultarFormulario2();
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
    const fecha_desde = this.formularioPermisos.get('fecha_desde')?.value;
    const fecha_hasta = this.formularioPermisos.get('fecha_hasta')?.value;
  
    // Formatea las fechas si están disponibles
    const formattedFecha_desde = fecha_desde ? this.formatDate(fecha_desde) : '';
    const formattedFecha_hasta = fecha_hasta ? this.formatDate(fecha_hasta) : '';
    
    // Configura el nombre del archivo con las fechas
    const nombreArchivo = `PERMISOS_APROBADOS_${formattedFecha_desde}_a_${formattedFecha_hasta}.xlsx`;
  
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
    const data = this.permisos.map(permiso => ({
      'Num. Solicitud': permiso.numeroSolicitud,
      'Apellidos y Nombres': permiso.apellidosNombres,
      'Fecha Desde': permiso.fechaDesde,
      'Fecha Hasta': permiso.fechaHasta,
      'Días de Permiso': permiso.diasPermiso,
      'Tipo de Permiso': permiso.tipoPermiso,
      'Diagnóstico/Comentario': permiso.diagnosticoComentario,
      'Ingresado Por': permiso.ingresadoPor,
      'Fecha Ingreso': permiso.fechaIngreso
    }));
  
    // Crea la hoja de trabajo
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'Datos de Permisos': worksheet }, SheetNames: ['Datos de Permisos'] };
  
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
