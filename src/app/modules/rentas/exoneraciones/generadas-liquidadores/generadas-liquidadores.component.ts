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
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import saveAs from 'file-saver';
import * as XLSX from 'xlsx';
import { API_ROUTES } from '@data/constants/routes';
import * as FileSaver from 'file-saver';
import { ReporteExoneracionesService } from '@data/services/financiero/reporte-exoneraciones.service';

@Component({
  selector: 'app-generadas-liquidadores',
  templateUrl: './generadas-liquidadores.component.html',
  styleUrl: './generadas-liquidadores.component.scss',
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
export class GeneradasLiquidadoresComponent {
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
      username: string = '';
     
      constructor(
        private departamentosService: DepartamentosService,
        private usuariosService: UsuariosService,
        private fb: FormBuilder,
        private tthhService: TthhService,
        private http: HttpClient,
        private financieroService: FinancieroService,
        private sisoService: SisoService,
        private reporteExoneracionesService: ReporteExoneracionesService,
      ) { 
        const userDataString = sessionStorage.getItem('currentUserGADMLL');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          this.username = userData.username;
          // console.log(userData); // Muestra los datos obtenidos del usuario
        }
      }
    
    
      ngOnInit(): void {
        this.formularioMarcaciones = this.fb.group({
          fecha_desde: [null],
          fecha_hasta: [''],
          usuario: ['']
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
        const username = this.username;
  
        if (fecha_desde && fecha_hasta) {
          const formattedFecha_desde = this.formatDate(fecha_desde);
          const formattedFecha_hasta = this.formatDate(fecha_hasta);
  
          const body = new HttpParams()
            .set('fechaDesde', formattedFecha_desde)
            .set('fechaHasta', formattedFecha_hasta)
            .set('username', username);
  
          const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
          });
  
          // Mostrar modal de carga
          Swal.fire({
            icon: 'info',
            title: 'Consultando registros...',
            text: 'Por favor, espere un momento.',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });
  
          this.http.post(API_ROUTES.RENTAS.REPORTE_EXONERACIONES, body.toString(), { headers })
            .subscribe(
              (response: any) => {
                Swal.close(); // Oculta el loading al terminar
  
                if (response.data && response.data.length > 0) {
                  this.marcaciones = response.data;
                  console.log(response.data);
                } else {
                  Swal.fire({
                    icon: 'warning',
                    title: 'Sin resultados',
                    text: 'No se encontraron registros con los valores proporcionados.',
                  });
                }
              },
              error => {
                Swal.close(); // Oculta el loading si hay error
                console.error('Error en la petición:', error);
  
                Swal.fire({
                  icon: error.error?.msg ? 'info' : 'error',
                  title: error.error?.msg ? 'Información' : 'Error',
                  text: error.error?.msg || 'Ocurrió un error al realizar la consulta.',
                });
              }
            );
  
        } else {
          Swal.fire('Error', 'Debe ingresar la fecha a consultar', 'error');
          this.ocultarFormulario2();
        }
      }
  
    
      private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return `${year}/${month}/${day}`;
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
        const fecha_desde = this.formularioMarcaciones.get('fecha_desde')?.value;
        const fecha_hasta = this.formularioMarcaciones.get('fecha_hasta')?.value;
  
        const formattedFecha_desde = fecha_desde ? this.formatDate(fecha_desde) : '';
        const formattedFecha_hasta = fecha_hasta ? this.formatDate(fecha_hasta) : '';
  
        const nombreArchivo = `EXONERACIONES_${this.username}_${formattedFecha_desde}_a_${formattedFecha_hasta}.xlsx`;
  
        // Mostrar loader
        Swal.fire({
          title: 'Generando archivo Excel...',
          text: 'Por favor, espere',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });
  
        // Validar que haya datos
        if (!this.marcaciones || this.marcaciones.length === 0) {
          Swal.close();
          Swal.fire('Info', 'No hay datos para exportar.', 'info');
          return;
        }
  
        // Reordenar y transformar datos
        const data = this.marcaciones.map(m => ({
          'FECHA_EXONERACION': m.FECHA_EXONERACION?.split(' ')[0], // quitar hora
          'EXONERADO_POR': m.EXONERADO_POR,
          'CONTRIBUYENTE': m.CONTRIBUYENTE,
          'CEDULA': m.CEDULA,
          'CODIGO_DACTILAR': m.CODIGO_DACTILAR,
          'TITULO': m.TITULO,
          'FECHA_EMISION': m.FECHA_EMISION?.split(' ')[0],
          'EMITIDO_POR': m.EMITIDO_POR,
          'DESCRIPCION_INGRESO': m.DESCRIPCION_INGRESO,
          'DETALLE': m.DETALLE,
          'VALOR': m.VALOR
        }));
  
        // Crear hoja y archivo
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        const workbook: XLSX.WorkBook = { Sheets: { 'Exoneraciones': worksheet }, SheetNames: ['Exoneraciones'] };
  
        XLSX.writeFile(workbook, nombreArchivo);
  
        Swal.close();
  
        Swal.fire({
          icon: 'success',
          title: 'Archivo Excel generado exitosamente',
          showConfirmButton: false,
          timer: 1500
        });
      }

      generarPDF() {
    if (!this.formularioMarcaciones.valid) {
      Swal.fire('Error', 'Por favor complete los campos requeridos', 'error');
      return;
    }

    const fecha_desde = this.formularioMarcaciones.get('fecha_desde')?.value;
    const fecha_hasta = this.formularioMarcaciones.get('fecha_hasta')?.value;
    
    if (!fecha_desde || !fecha_hasta) {
      Swal.fire('Error', 'Por favor seleccione ambas fechas', 'error');
      return;
    }

    // Formatear fechas para mostrarlas en el PDF
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    };

    const formattedFecha_desde = formatDate(new Date(fecha_desde));
    const formattedFecha_hasta = formatDate(new Date(fecha_hasta));

    // Mostrar loading
    Swal.fire({
      title: 'Generando reporte PDF...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Mapear los datos para el PDF
    const datosExoneraciones = this.marcaciones.map((item, index) => ({
      'N°': (index + 1).toString(),
      'Cédula': item.CEDULA || '-',
      'Contribuyente': item.CONTRIBUYENTE || '-',
      'Código Dactilar': item.CODIGO_DACTILAR || '-',
      'Título': item.TITULO || '-',
      'Fecha Emisión': item.FECHA_EMISION ? new Date(item.FECHA_EMISION).toLocaleDateString() : '-',
      'Emitido por': item.EMITIDO_POR || '-',
      'Descripción Ingreso': item.DESCRIPCION_INGRESO || '-',
      'Valor': item.VALOR ? parseFloat(item.VALOR).toFixed(2) : '0.00',
      'Exonerado por': item.EXONERADO_POR || '-',
      'Fecha Exoneración': item.FECHA_EXONERACION ? new Date(item.FECHA_EXONERACION).toLocaleDateString() : '-',
    }));

    // Llamar al servicio para generar el PDF
    // Obtener el nombre de usuario del localStorage
    const userDataString = sessionStorage.getItem('currentUserGADMLL');
    let username = 'Usuario';
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      username = userData.username || 'Usuario';
    }
    
    this.reporteExoneracionesService.generateReporteExoneracionesPDF(
      datosExoneraciones,
      'Sistema de Exoneraciones - Liquidadores',
      `Período: ${formattedFecha_desde} - ${formattedFecha_hasta}`,
      username
    ).subscribe({
      next: (response: Blob) => {
        Swal.close();
        const blobFile = new Blob([response], { type: 'application/pdf' });
        const fileName = `Reporte_Exoneraciones_Liquidadores_${formattedFecha_desde}_a_${formattedFecha_hasta}.pdf`;
        FileSaver.saveAs(blobFile, fileName);
      },
      error: (error: any) => {
        console.error('Error al generar el PDF:', error);
        Swal.fire('Error', 'Ocurrió un error al generar el PDF', 'error');
      }
    });
  }

  verDetalle(row: any) {
        Swal.fire({
          html: `
            <div style="margin: 0; background: white; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #ccc; border-radius: 8px;">
              <!-- Encabezado tipo barra de título -->
              <div style="background: linear-gradient(90deg, #4a90e2 0%, #357abd 100%); color: white; padding: 10px 16px; font-size: 14px; font-weight: 500; display: flex; align-items: center; border-radius: 7px 7px 0 0; margin: -1px -1px 0 -1px;">
                <i class="pi pi-info-circle" style="margin-right: 8px; font-size: 14px;"></i>
                Detalle
              </div>
              
              <!-- Cuerpo con borde -->
              <div style="padding: 16px; background: #fafafa; border-top: 1px solid #ddd; border-radius: 0 0 7px 7px; margin: 0 -1px -1px -1px;">
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #333; text-align: left;">
                  ${row.DETALLE}
                </p>
                <div style="text-align: center; margin-top: 16px;">
                  <button id="cerrar-detalle" style="
                    background-color: #4a90e2;
                    color: white;
                    font-size: 12px;
                    padding: 6px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                  " onmouseover="this.style.backgroundColor='#357abd'" onmouseout="this.style.backgroundColor='#4a90e2'">
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          `,
          showConfirmButton: false,
          showCloseButton: false,
          icon: undefined,
          width: '40em',
          padding: '10px 0 22px 0',
          allowOutsideClick: true,
          allowEscapeKey: true,
          customClass: {
            popup: 'custom-popup'
          },
          didOpen: () => {
            // Agregar el event listener después de que se abra el modal
            const cerrarBtn = document.getElementById('cerrar-detalle');
            if (cerrarBtn) {
              cerrarBtn.addEventListener('click', () => {
                Swal.close();
              });
            }
          }
        });
      }
}
