import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FinancieroService } from '@data/services/financiero/financiero.service';
import { AuthService } from '@data/services/api/auth.service';
import { Table } from 'primeng/table';
import Swal from 'sweetalert2';

import { saveAs } from 'file-saver'

@Component({
  selector: 'app-repdiariofecha-cm',
  templateUrl: './repdiariofecha-cm.component.html',
  styleUrl: './repdiariofecha-cm.component.scss',
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
export class RepdiariofechaCmComponent {

  @ViewChild('tbHistorial') tbhistorial!: Table; // Añade @ViewChild para obtener la referencia a la tabla


  recaudaciones: any[] = [];
  // departamentos: any[] = [];
  errorMessage = '';

  cedulaSearchValue: string = '';
  
  formularioConceptosMensuales!: FormGroup; // Propiedad para el formulario
  formularioVisible: boolean = false;
  formularioVisible2 : boolean = false;

  clienteIdEditando: number | null = null; // Propiedad para almacenar el ID del estado en edición
  
  primerNombre: string = ''; // Variable para almacenar el primer nombre
 
  constructor(
      private fb: FormBuilder,
      private financieroService: FinancieroService, // Inyecta el servicio aquí
      private authService: AuthService
    ) { }
  
  ngOnInit(): void {

      
    this.formularioConceptosMensuales = this.fb.group({
      date_start: [''],
      date_end: [''],
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
    this.formularioConceptosMensuales.reset();
    this.recaudaciones = [];

  }


  ocultarFormulario(): void {
    this.formularioVisible = false;
    this.formularioConceptosMensuales.reset();
    this.clienteIdEditando = null;
  }


  ocultarFormulario2(): void {
    // this.formularioVisible2 = false;
    // this.formularioVisible = false;
    this.formularioConceptosMensuales.reset();
    this.recaudaciones = [];
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


  loadDataCM(): void {
      const fecha_desde = this.formularioConceptosMensuales.get('date_start')?.value;
      const fecha_hasta = this.formularioConceptosMensuales.get('date_end')?.value;
      // const fecha = this.formularioConceptosMensuales.get('date')?.value;
  
      if (fecha_desde && fecha_hasta) {
        
        const formattedDate_start = this.formatDate(fecha_desde);
        const formattedDate_end = this.formatDate(fecha_hasta);
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
        this.financieroService.getRecaudacionesPorFecha(formattedDate_start, formattedDate_end).subscribe(r => {
          Swal.close();
  
          if (!r.error && r.data) {
            // Limpiamos la lista de clientes y añadimos el cliente encontrado
            this.recaudaciones = r.data; // Actualiza la lista de clientes con la respuesta
            this.mostrarFormulario();
            this.tbhistorial.reset(); // Reiniciamos la tabla para aplicar los cambios
          } else {
            this.recaudaciones =[];
            Swal.fire({
              title: 'Datos no encontrados',
              text: 'No se encontraron datos para la consulta realizada. ¿Desea generar el reporte?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Sí',
              cancelButtonText: 'No'
            }).then((result) => {
              this.ocultarFormulario2();
              if (result.isConfirmed) {
                // Si el usuario elige "Sí", llama a la función para generar el reporte con valores predeterminados
                this.exportarPDF();
              }
            });
          }
        });
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
  
  
    exportarPDF(){
      const fecha_desde = this.formularioConceptosMensuales.get('date_start')?.value;
      const fecha_hasta = this.formularioConceptosMensuales.get('date_end')?.value;
  
      if (fecha_desde && fecha_hasta) {
        // Asegúrate de que la fecha esté en el formato correcto
        const formattedDate_start = this.formatDate(fecha_desde);
        const formattedDate_end = this.formatDate(fecha_hasta);
    
        this.financieroService.getPdfReporteFechas(formattedDate_start, formattedDate_end)
          .subscribe(
            (response: Blob) => {
             
               // Crea un nuevo Blob con la respuesta del servidor
               const blob = new Blob([response], { type: 'application/pdf' });
  
               // Formatea la fecha para usarla en el nombre del archivo
              //  const fileDate = new Date(formattedDate_start).toISOString().split('T')[0]; // yyyy-mm-dd
               // Formatea las fechas de inicio y fin para usarlas en el nombre del archivo
               const startDateFormatted = new Date(formattedDate_start).toISOString().split('T')[0]; // yyyy-mm-dd
               const endDateFormatted = new Date(formattedDate_end).toISOString().split('T')[0]; // yyyy-mm-dd
               
               // Crea el nombre del archivo usando ambas fechas
               const fileName = `CMR_desde_${startDateFormatted}_hasta_${endDateFormatted}.pdf`;

       
               // Usa FileSaver.js para guardar el archivo
               saveAs(blob, fileName);
            },
            error => {
              console.error('Error al descargar el PDF', error);
              // Maneja el error, por ejemplo, mostrando un mensaje al usuario
            }
          );
      } else {
        console.error('Fecha no proporcionada.');
        // Maneja el error, por ejemplo, mostrando un mensaje al usuario
      }
    }


    loadImageBase64(url: string): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        fetch(url)
          .then(res => res.blob())
          .then(blob => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
      });
    }  
  
    exportarPDF2() {
      const fechaDesde = this.formularioConceptosMensuales.get('date_start')?.value;
      const fechaHasta = this.formularioConceptosMensuales.get('date_end')?.value;
    
      if (!fechaDesde || !fechaHasta) {
        console.error('Fechas no proporcionadas.');
        return;
      }
    
      const fechaDesdeFormateada = this.formatDate(fechaDesde);
      const fechaHastaFormateada = this.formatDate(fechaHasta);
    
      this.loadImageBase64('assets/img/logo2.png')
        .then(base64Logo => {
          const usuarioData = this.authService.getUserFromLocalStorage();
          const usuarioNombre = usuarioData?.username || 'Usuario desconocido';
    
          this.financieroService.getRecaudacionesPorFecha(fechaDesdeFormateada, fechaHastaFormateada)
            .subscribe(dataRes => {
              if (!dataRes.error && dataRes.data && dataRes.data.length > 0) {
                this.financieroService.generateReporteMensualPDF(
                  dataRes.data,
                  usuarioNombre,
                  `${fechaDesdeFormateada}`,
                  `${fechaHastaFormateada}`,
                  base64Logo
                );
              } else {
                console.warn('No hay datos para exportar');
              }
            });
        })
        .catch(err => {
          console.error('Error cargando el logo:', err);
        });
    }    

}
