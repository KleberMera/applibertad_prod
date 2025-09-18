import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FinancieroService } from '@data/services/financiero/financiero.service';
import { UsersService } from '@data/services/admin/users.service';
import { AuthService } from '@data/services/api/auth.service';
import { Table } from 'primeng/table';
import Swal from 'sweetalert2';

import { saveAs } from 'file-saver'

@Component({
  selector: 'app-repdiario-cm',
  templateUrl: './repdiario-cm.component.html',
  styleUrl: './repdiario-cm.component.scss',
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
export class RepdiarioCmComponent {

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
      date: [''],
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
    const fecha = this.formularioConceptosMensuales.get('date')?.value;
    // const fecha = this.formularioConceptosMensuales.get('date')?.value;

    if (fecha) {
      
      const formattedDate = this.formatDate(fecha);
      //console.log(formattedDate);
      Swal.fire({
        title: 'Consultando datos...',
        text: 'Por favor, espere un momento.',
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      ////console.log(fecha);
      this.financieroService.getRecaudacionesPorDia(formattedDate).subscribe(r => {
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
    const fecha = this.formularioConceptosMensuales.get('date')?.value;

    if (fecha) {
      // Asegúrate de que la fecha esté en el formato correcto
      const formattedDate = this.formatDate(fecha);
  
      this.financieroService.getPdfReporte(formattedDate)
        .subscribe(
          (response: Blob) => {
           
             // Crea un nuevo Blob con la respuesta del servidor
             const blob = new Blob([response], { type: 'application/pdf' });

             // Formatea la fecha para usarla en el nombre del archivo
             const fileDate = new Date(formattedDate).toISOString().split('T')[0]; // yyyy-mm-dd
             const fileName = `CMR_${fileDate}.pdf`;
     
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
    const fecha = this.formularioConceptosMensuales.get('date')?.value;
  
    if (!fecha) {
      console.error('Fecha no proporcionada.');
      return;
    }
  
    const formattedDate = this.formatDate(fecha);
  
    this.loadImageBase64('assets/img/logo2.png')
      .then(base64Logo => {
        // Obtener el usuario desde sessionStorage
        const usuarioData = this.authService.getUserFromLocalStorage();
        const usuarioNombre = usuarioData?.username || 'Usuario desconocido';
  
        // Obtener los datos de recaudaciones
        this.financieroService.getRecaudacionesPorDia(formattedDate).subscribe(dataRes => {
          if (!dataRes.error && dataRes.data && dataRes.data.length > 0) {
            this.financieroService.generateReportePDF(
              dataRes.data,
              usuarioNombre,
              formattedDate,
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
