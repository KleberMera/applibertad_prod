import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FinancieroService } from '@data/services/financiero/financiero.service';
import { API_ROUTES } from '@data/constants/routes';
import { UsersService } from '@data/services/admin/users.service';
import { AuthService } from '@data/services/api/auth.service';
import { Table } from 'primeng/table';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable, { ColumnInput, UserOptions, Styles, HAlignType } from 'jspdf-autotable';

import { saveAs } from 'file-saver';

interface Tipo {
  CODIGO: string;
  FECHA_CONSULTA: string;
  DESCRIPCION: string;
}

@Component({
  selector: 'app-novedades-rol',
  templateUrl: './novedades-rol.component.html',
  styleUrl: './novedades-rol.component.scss',
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
export class NovedadesRolComponent {
    @ViewChild('tbHistorial') tbhistorial!: Table; // Añade @ViewChild para obtener la referencia a la tabla
    
    //Variables para el manejo de los formularios
    formularioConceptosMensuales!: FormGroup;
    formularioVisible: boolean = false;
    formularioVisible2 : boolean = false;

    //Variables manejo de excel
    excelPreviewData: any[] = [];
    excelColumns: string[] = [];
    excelPersonasCero: string = '';
    cedulasConError: string[] = [];
    jsonValido = true;
    cargaValida = false;

    //Para procesar
    periodoProcesar: string = '';
    idConceptoProcesar: string = '';

    //Variables para el funcionamiento
    tipos: Tipo[] = [];
    selectedTipo: string = '';
    fechaOptions: { label: string, value: string, disabled?: boolean }[] = [];
    selectedFecha: string = '';
   
    constructor(
      private fb: FormBuilder,
      private financieroService: FinancieroService, // Inyecta el servicio aquí
      private authService: AuthService,
      private http: HttpClient
    ) { 
      this.formularioConceptosMensuales = this.fb.group({
        dateDesde: ['', Validators.required],
        dateHasta: ['', Validators.required],
        ubicacion: ['', Validators.required],
        tipo: ['', Validators.required]
      });
      
      // Suscribirse a cambios en el control tipo para actualizar selectedTipo
      this.formularioConceptosMensuales.get('tipo')?.valueChanges.subscribe(value => {
        this.selectedTipo = value;
      });
    }
  
    ngOnInit(): void {
      this.mostrarFormulario2();
      this.cargarTipos();
      this.generarFechasPermitidas();
      this.mostrarFaltantes2();
    }

    generarFechasPermitidas() {
      const hoy = new Date();
      const currentYear = hoy.getFullYear();
      const currentMonth = hoy.getMonth() + 1; 

      this.fechaOptions = [];

      for (let i = 0; i < 6; i++) {
        const date = new Date(currentYear, currentMonth - 1 - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const value = `${year}${month.toString().padStart(2, '0')}`;

        const isSelectable =
          (year === currentYear && month === currentMonth) ||
          (year === currentYear && month === currentMonth - 1) ||
          (currentMonth === 1 && year === currentYear - 1 && month === 12);

        this.fechaOptions.push({
          label: value,
          value: value,
          disabled: !isSelectable
        });
      }

      const periodoActual = `${currentYear}${currentMonth.toString().padStart(2, '0')}`;
      this.selectedFecha = periodoActual;
    }


    mostrarFaltantes2(): void {
      if (!this.selectedFecha) {
        Swal.fire({
          title: 'Advertencia',
          text: 'Debe seleccionar un periodo antes de continuar',
          icon: 'warning'
        });
        return;
      }
      console.log('Periodo seleccionado del dropdown:', this.selectedFecha);
      this.consultarFaltantes(this.selectedFecha);
    }

    onFechaChange(event: any): void {
      this.selectedFecha = event.value;
      console.log('Fecha seleccionada actualizada:', this.selectedFecha);
    }

    mostrarFaltantesConRefresh(): void {
      const dropdownElement = document.querySelector('p-dropdown[placeholder="Seleccione Periodo"]');
      console.log('Elemento dropdown encontrado:', dropdownElement);
      
      if (!this.selectedFecha) {
        Swal.fire({
          title: 'Advertencia',
          text: 'Debe seleccionar un periodo antes de continuar',
          icon: 'warning'
        });
        return;
      }
      
      console.log('Enviando consulta con periodo:', this.selectedFecha);
      this.consultarFaltantes(this.selectedFecha);
    }

    mostrarFaltantesConDelay(): void {
      setTimeout(() => {
        console.log('Después del timeout - selectedFecha:', this.selectedFecha);
        
        if (!this.selectedFecha) {
          Swal.fire({
            title: 'Advertencia',
            text: 'Debe seleccionar un periodo antes de continuar',
            icon: 'warning'
          });
          return;
        }
        
        this.consultarFaltantes(this.selectedFecha);
      }, 100);
    }

    private consultarFaltantes(periodo: string): void {
      const body = new HttpParams().set('periodo', periodo);
      const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

      this.http.post(API_ROUTES.TTHH.VERFALTANTES, body.toString(), { headers }).subscribe({
        next: (response: any) => {
          const data = response.data;
          let htmlErrores = `
            <div style="text-align:center;">
              <table style="width:80%; border-collapse:collapse; margin: 0 auto;">
                <thead>
                  <tr>
                    <th style="border-bottom:1px solid #ccc; text-align:left;">Descripción</th>
                    <th style="border-bottom:1px solid #ccc; text-align:center;">Estado</th>
                  </tr>
                </thead>
                <tbody>
          `;

          for (const item of data) {
            const estadoIcono = item.EXISTE === 'S' ? '✅' : '❌';
            htmlErrores += `
              <tr>
                <td style='text-align:left;'>${item.DESCRIPCION}</td>
                <td style='text-align:center;'>${estadoIcono}</td>
              </tr>
            `;
          }

          htmlErrores += '</tbody></table></div>';

          Swal.fire({
            title: 'Conceptos Registrados',
            icon: 'info',
            html: htmlErrores,
            width: '500px'
          });
        },
        error: () => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo consultar faltantes',
            icon: 'error'
          });
        }
      });
    }

    cargarTipos(): void {
      this.http.get(API_ROUTES.TTHH.ROLESCONCEPTOS)
        .subscribe({
          next: (response: any) => {
            if (!response.error && response.data) {
              this.tipos = response.data;
            } else {
              console.error('Error al cargar tipos:', response.msg);
            }
          },
          error: (error) => {
            console.error('Error en la petición de tipos:', error);
          }
        });
    }

    onExcelUpload(event: any): void {
      const file = event.target.files[0];
      const usuarioActual = this.authService.getUser;
      const username = usuarioActual?.username;
      if (!file) return;

      const now = new Date();
      const timestamp = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
      const nombreArchivo = `${this.selectedTipo}_${this.selectedFecha}_${timestamp}.xlsx`;

      const archivoRenombrado = new File([file], nombreArchivo, { type: file.type });

      // const formData = new FormData();
      // formData.append('archivo', archivoRenombrado);
      // formData.append('usuario', username || '');
      // formData.append('tipo', this.selectedTipo);
      // formData.append('fecha', this.selectedFecha);

      // this.http.post('Aquí va la ruta del endpoint para subir el archivo', formData).subscribe({
      //   next: () => {
      //     console.log('Archivo subido a Nextcloud');
      //   },
      //   error: () => {
      //     console.error('Error al subir el archivo a Nextcloud');
      //   }
      // });

      const reader = new FileReader();

      reader.onload = (e: any) => {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rawData: { [key: string]: any }[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' , raw: false});

        if (rawData.length === 0) return;

        const originalKeys = Object.keys(rawData[0]);
        if (originalKeys.length < 2) {
          Swal.fire({ icon: 'error', title: 'Error', text: 'El archivo debe tener al menos 2 columnas.' });
          return;
        }

        const colCedulaKey = originalKeys[0];
        const colValorKey = originalKeys[1];

        const data = rawData.map(row => ({
          idConcepto: this.selectedTipo,
          periodo: this.selectedFecha,
          cedula: String(row[colCedulaKey]).trim(),
          valor: parseFloat(String(row[colValorKey]).replace(',', '.')) || 0,
          username: username
        }));

        this.periodoProcesar = this.selectedFecha;
        this.idConceptoProcesar = this.selectedTipo;

        this.excelPreviewData = data;
        this.excelColumns = ['CEDULA', 'VALOR'];

        // Validaciones acumuladas
        const erroresDecimales = [];
        const erroresCedula = [];
        const erroresValorCero = [];

        for (const row of data) {
          const valor = row.valor;
          const valorString = valor.toString();
          const partes = valorString.split('.');
          if (partes.length === 2 && partes[1].length > 2) {
            erroresDecimales.push(row);
          }

          if (!/^\d{10}$/.test(row.cedula)) {
            erroresCedula.push(row);
          }

          if (valor === 0) {
            erroresValorCero.push(row);
          }
        }

        // Mostrar todos los errores del doc en un solo swal.fire
        if (erroresDecimales.length > 0 || erroresCedula.length > 0 || erroresValorCero.length > 0) {
          let htmlErrores = '';

          if (erroresDecimales.length > 0) {
            htmlErrores += `<strong>Valores con más de 2 decimales:</strong><br>`;
            htmlErrores += erroresDecimales.map(e => `Cédula: ${e.cedula}, Valor: ${e.valor}`).join('<br>') + '<br><br>';
          }

          if (erroresCedula.length > 0) {
            htmlErrores += `<strong>Cédulas inválidas (deben tener 10 dígitos):</strong><br>`;
            htmlErrores += erroresCedula.map(e => `Cédula: ${e.cedula}`).join('<br>') + '<br><br>';
          }

          if (erroresValorCero.length > 0) {
            htmlErrores += `<strong>Valores en 0:</strong><br>`;
            htmlErrores += erroresValorCero.map(e => `Cédula: ${e.cedula}`).join('<br>') + '<br><br>';
          }

          this.excelPreviewData = [];
          this.excelColumns = [];

          Swal.fire({
            icon: 'error',
            title: 'Errores detectados en el archivo',
            html: htmlErrores,
            width: 800,
          });
          return;
        }
            
        // Si no hay errores
        this.cedulasConError = [];
        this.excelPersonasCero = '';
        Swal.fire({
          icon: 'success',
          title: 'Archivo seleccionado correctamente',
        });
      };

      (event.target as HTMLInputElement).value = '';

      reader.readAsBinaryString(file);
    }

    mostrarFormulario(): void {
      this.formularioVisible = true;
      // this.formularioVisible2 = false;
      // this.recaudaciones = [];
    }

    mostrarFormulario2(): void {
      this.formularioVisible2 = true;
      this.formularioVisible = false;
      this.formularioConceptosMensuales.reset();
  
    }
  
    ocultarFormulario(): void {
      this.formularioVisible = false;
      this.formularioConceptosMensuales.reset();
    }

    ocultarFormulario2(): void {
      // this.formularioVisible2 = false;
      // this.formularioVisible = false;
      this.formularioConceptosMensuales.reset();
      //this.tbhistorial.clearGlobalFilter()
      this.tbhistorial.reset();
      // this.clienteIdEditando = null;
    }
  
    applyFilterGlobal(event: Event) {
      const inputElement = event.target as HTMLInputElement;
      if (inputElement) {
        const filterValue = inputElement.value;
        this.tbhistorial.filterGlobal(filterValue, 'contains');
      }
    }
  
    cargarDatos(): void {
      if (!this.jsonValido || !this.excelPreviewData || this.excelPreviewData.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'No hay datos válidos',
          text: 'No hay datos válidos para enviar.',
        });
        return;
      }

      // Mostrar confirmación antes de enviar
      Swal.fire({
        title: '¿Confirmar carga?',
        text: `Se van a cargar ${this.excelPreviewData.length} registros. ¿Desea continuar?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cargar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.enviarDatos();
        }
        this.cargaValida = true;
      });
    }

    private enviarDatos(): void {
      // El payload es directamente el array de datos
      const payload = this.excelPreviewData;

      // Mostrar loading
      Swal.fire({
        title: 'Cargando datos...',
        text: 'Por favor espere mientras se procesan los datos.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Enviar datos por POST
      this.http.post(API_ROUTES.TTHH.CARGARVALORES, payload)
        .subscribe({
          next: (response: any) => {
            Swal.close();
            
            if (response.error === false || response.success) {
              Swal.fire({
                icon: 'success',
                title: 'Carga exitosa',
                text: response.message || 'Los datos se han cargado correctamente.',
              }).then(() => {
                // Limpiar datos después de la carga exitosa
                // this.limpiarDatos();
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error en la carga',
                text: response.message || 'Ocurrió un error al cargar los datos.',
              });
            }
          },
          error: (error) => {
            Swal.close();
            console.error('Error al enviar datos:', error);
            
            let mensajeError = 'Error de conexión con el servidor.';
            if (error.error && error.error.message) {
              mensajeError = error.error.message;
            } else if (error.message) {
              mensajeError = error.message;
            }

            Swal.fire({
              icon: 'error',
              title: 'Error al cargar datos',
              text: mensajeError,
            });
          }
        });
    }

    // Método para generar novedades
    generarNovedades(): void {
      // Validar que existan los datos necesarios
      if (!this.selectedFecha || !this.selectedTipo) {
        Swal.fire({
          icon: 'warning',
          title: 'Datos faltantes',
          text: 'Debe seleccionar el período y el tipo de concepto antes de procesar.',
        });
        return;
      }

      // Mostrar confirmación antes de procesar
      Swal.fire({
        title: '¿Confirmar procesamiento?',
        text: `Se van a generar las novedades para el período ${this.selectedFecha}. ¿Desea continuar?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, procesar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.enviarDatosNovedades();
        }
      });
    }

    private enviarDatosNovedades(): void {
      const headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      });

      const formData = new URLSearchParams();
      formData.set('periodo', this.selectedFecha);
      formData.set('idConcepto', this.selectedTipo);

      // Mostrar loading
      Swal.fire({
        title: 'Procesando novedades...',
        text: 'Por favor espere mientras se generan las novedades.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Enviar datos por POST
      this.http.post(API_ROUTES.TTHH.GENERARNOVEDADES, formData.toString(), { headers })
        .subscribe({
          next: (response: any) => {
            Swal.close();
            
            if (response.error === false || response.success) {
              Swal.fire({
                icon: 'success',
                title: 'Novedades generadas',
                text: response.message || 'Las novedades se han generado correctamente.',
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error al generar novedades',
                text: response.message || 'Ocurrió un error al generar las novedades.',
              });
            }
            
            // Limpiar datos independientemente del resultado
            this.limpiarDatosTabla();
          },
          error: (error) => {
            Swal.close();
            console.error('Error al generar novedades:', error);
            
            let mensajeError = 'Error de conexión con el servidor.';
            if (error.error && error.error.message) {
              mensajeError = error.error.message;
            } else if (error.message) {
              mensajeError = error.message;
            }

            Swal.fire({
              icon: 'error',
              title: 'Error al generar novedades',
              text: mensajeError,
            });
            
            // Limpiar datos también en caso de error
            this.limpiarDatosTabla();
          }
        });
    }

    private limpiarDatosTabla(): void {
      this.excelPreviewData = [];
      this.cedulasConError = [];
 
      this.cargaValida = false;
      
      // Limpiar formulario y variables
      this.formularioConceptosMensuales.reset();
      
      // Forzar la limpieza de selectedFecha y selectedTipo
      this.selectedFecha = '';
      this.selectedTipo = '';
      
      // Regenerar fechas permitidas para actualizar la UI
      setTimeout(() => {
        this.generarFechasPermitidas();
      }, 0);
      
      if (this.tbhistorial) {
        this.tbhistorial.reset();
      }
    }


    get totalValor(): number {
        return (this.excelPreviewData || []).reduce((acc, row) => acc + (Number(row.valor) || 0), 0);
    }

   
}
