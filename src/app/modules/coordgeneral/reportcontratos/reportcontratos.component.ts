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

import jsPDF from 'jspdf';
import autoTable, { ColumnInput, UserOptions, Styles, HAlignType } from 'jspdf-autotable';

import { saveAs } from 'file-saver'

interface Ubicacion {
  CODIGO: string;
  UBICACION: string;
  ORDEN: string;
  FECHA_CONSULTA: string;
}

interface Tipo {
  CODIGO: string;
  DESCRIPCION: string;
  ORDEN: string;
  FECHA_CONSULTA: string;
}

@Component({
  selector: 'app-reportcontratos',
  templateUrl: './reportcontratos.component.html',
  styleUrl: './reportcontratos.component.scss',
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
export class ReportcontratosComponent {
  @ViewChild('tbHistorial') tbhistorial!: Table; // Añade @ViewChild para obtener la referencia a la tabla
  
    ubicaciones: Ubicacion[] = [];
    tipos: Tipo[] = [];
    selectedUbicacion: string = '';
    selectedTipo: string = '';

    recaudaciones: any[] = [];
    // departamentos: any[] = [];
    errorMessage = '';
  
    cedulaSearchValue: string = '';
    
    formularioConceptosMensuales!: FormGroup; // Propiedad para el formulario
    formularioVisible: boolean = false;
    formularioVisible2 : boolean = false;
  
    clienteIdEditando: number | null = null; // Propiedad para almacenar el ID del estado en edición
    
    primerNombre: string = ''; // Variable para almacenar el primer nombre
    iconTipo: string = 'pi pi-info-circle';
   
   
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
    }
  
  
    ngOnInit(): void {
  
      this.mostrarFormulario2();

      this.cargarUbicaciones();
      this.cargarTipos();

      // this.http.get<any>(API_ROUTES.COORDINACION.UBICACIONES_CONTRATOS)
      // .subscribe(response => {
      //   if (!response.error) {
      //     this.ubicaciones = response.data.map((item: any) => ({
      //       CODIGO: item.CODIGO,
      //       UBICACION: item.UBICACION
      //     }));
      //   }
      // });

      // this.http.get<any>(API_ROUTES.COORDINACION.TIPOS_CONTRATOS)
      // .subscribe(response => {
      //   console.log(response.data);
      //   if (!response.error) {
      //     this.tipos = response.data.map((item: any) => ({
      //       CODIGO: item.CODIGO,
      //       DESCRIPCION: item.DESCRIPCION
      //     }));
      //   }
      // });
  
    }
  
    // Cargar ubicaciones desde la API
  cargarUbicaciones(): void {
    this.http.get(API_ROUTES.COORDINACION.UBICACIONES_CONTRATOS)
      .subscribe({
        next: (response: any) => {
          if (!response.error && response.data) {
            this.ubicaciones = response.data;
          } else {
            console.error('Error al cargar ubicaciones:', response.msg);
          }
        },
        error: (error) => {
          console.error('Error en la petición de ubicaciones:', error);
        }
      });
  }

  // Cargar tipos desde la API
  cargarTipos(): void {
    this.http.get(API_ROUTES.COORDINACION.TIPOS_CONTRATOS)
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
      const formData = this.formularioConceptosMensuales.value;
    
      if (formData.dateDesde && formData.dateHasta) {
        // ✅ Formateo de fechas a yyyy-MM-dd
        const fechaDesde = this.formatFecha(formData.dateDesde);
        const fechaHasta = this.formatFecha(formData.dateHasta);
        const ubicacion = formData.ubicacion;
        const tipo = formData.tipo;

        let params = new HttpParams()
          .set('fechaDesde', fechaDesde)
          .set('fechaHasta', fechaHasta)
          .set('idUbica', ubicacion || '')
          .set('idTipo', tipo || '');
    
        // console.log('Parámetros enviados:', {
        //   fechaDesde,
        //   fechaHasta,
        //   idUbica: this.selectedUbicacion || '',
        //   idTipo: this.selectedTipo || ''
        // });
    
        const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    
        Swal.fire({
          title: 'Consultando datos...',
          text: 'Por favor, espere un momento.',
          icon: 'info',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });
    
        this.http.post(API_ROUTES.COORDINACION.ESTADO_CONTRATOS, params.toString(), { headers })
          .subscribe({
            next: (response: any) => {
              Swal.close();
    
              if (!response.error && response.data && response.data.length > 0) {
                this.recaudaciones = response.data;
                this.mostrarFormulario();
                if (this.tbhistorial) {
                  this.tbhistorial.reset();
                }
                // console.log('Datos cargados:', this.recaudaciones);
              } else {
                this.recaudaciones = [];
                Swal.fire({
                  title: 'Datos no encontrados',
                  text: 'No se encontraron datos para la consulta realizada. ¿Desea generar el reporte?',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Sí',
                  cancelButtonText: 'No',
                }).then((result) => {
                  this.ocultarFormulario2();
                  if (result.isConfirmed) {
                    this.exportarPDF2();
                  }
                });
              }
            },
            error: (error) => {
              this.ocultarFormulario2();
              Swal.close();
              console.error('Error en la consulta:', error);
              Swal.fire({
                title: 'Datos no encontrados',
                text: 'No se encontraron contratos para la consulta realizada.',
                icon: 'warning',
                confirmButtonColor: 'Ok'
              });
              this.ocultarFormulario2();
            }
          });
      } else {
        Swal.fire('Error', 'Debe ingresar ambas fechas para la consulta', 'error');
        this.ocultarFormulario2();
      }
    }

    formatFecha(date: Date): string {
      const year = date.getFullYear();
      const month = (`0${date.getMonth() + 1}`).slice(-2); // +1 porque enero es 0
      const day = (`0${date.getDate()}`).slice(-2);
      return `${year}-${month}-${day}`;
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
            }
          );
      } else {
        console.error('Fecha no proporcionada.');
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
      const formData = this.formularioConceptosMensuales.value; 
      const fechaDesde = this.formatFecha(formData.dateDesde); 
      const fechaHasta = this.formatFecha(formData.dateHasta); 
      const ubicacion = formData.ubicacion; 
      const tipo = formData.tipo; 
     
      this.loadImageBase64('assets/img/logo2.png') 
        .then(base64Logo => { 
          // Obtener el usuario desde sessionStorage 
          const usuarioData = this.authService.getUserFromLocalStorage(); 
          const usuarioNombre = usuarioData?.username || 'Usuario desconocido'; 
     
          // Preparar parámetros para la consulta de contratos
          const params = new URLSearchParams();
          params.append('fechaDesde', fechaDesde);
          params.append('fechaHasta', fechaHasta);
          
          if (ubicacion && ubicacion !== '') {
            params.append('idUbica', ubicacion);
          }
          
          if (tipo && tipo !== '') {
            params.append('idTipo', tipo);
          }
    
          // Configurar headers
          const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
          });
     
          // Realizar la consulta al endpoint de contratos
          this.http.post(API_ROUTES.COORDINACION.ESTADO_CONTRATOS, params.toString(), { headers })
            .subscribe({
              next: (dataRes: any) => {
                if (!dataRes.error && dataRes.data && dataRes.data.length > 0) {
                  // Enviar directamente los datos del array data al generateReportePDF
                  this.generateReportePDF( 
                    dataRes.data,  
                    usuarioNombre, 
                    fechaDesde, 
                    fechaHasta,
                    base64Logo 
                  ); 
                } else { 
                  console.warn('No hay datos para exportar'); 
                } 
              },
              error: (error) => {
                console.error('Error al obtener datos de contratos:', error);
                
              }
            });
     
        }) 
        .catch(err => { 
          console.error('Error cargando el logo:', err); 
        }); 
    }
    
    generateReportePDF(data: any[], usuario: string, fechaConsulta: string, fechaHastaConsulta: string, base64Logo: string) {
      const doc = new jsPDF('landscape');
      const ubicacionesUnicas = [...new Set(data.map(d => d.UBICACION))];
      
      const columns: ColumnInput[] = [
        { header: 'Contribuyente', dataKey: 'CONTRIBUYENTE' },
        { header: 'Período', dataKey: 'PERIODO' },
        { header: 'Contrato', dataKey: 'CONTRATO' },
        { header: 'Tipo', dataKey: 'TIPO_DESCRIPCION' },
        { header: 'Realizado Por', dataKey: 'REALIZADO_POR' },
        { header: 'Fecha', dataKey: 'FECHA' },
        { header: 'Observación', dataKey: 'OBSERVACION' },
      ];
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margins = { top: 15, bottom: 15, left: 15, right: 15 };
      const paginasConEncabezado = new Set<number>();
      
      const drawEncabezado = () => {
        const currentPage = doc.getCurrentPageInfo().pageNumber;
        if (paginasConEncabezado.has(currentPage)) return;
        paginasConEncabezado.add(currentPage);
      
        const totalPagesExp = '{total_pages_count_string}';
        const pad = (n: number) => n.toString().padStart(2, '0');
        const mesesAbreviados = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEPT', 'OCT', 'NOV', 'DIC'];
      
        const now = new Date();
        const hours = now.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
      
        const fechaHora = `${pad(now.getDate())}/${mesesAbreviados[now.getMonth()]}/${now.getFullYear()}, ${pad(hour12)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${ampm}`;
      
        const [year, month, day] = fechaConsulta.split('-');

        const [y1, m1, d1] = fechaConsulta.split('-');
        const [y2, m2, d2] = fechaHastaConsulta.split('-');

        const nombreMes1 = mesesAbreviados[parseInt(m1, 10) - 1];
        const nombreMes2 = mesesAbreviados[parseInt(m2, 10) - 1];
        const fechaFormateadaDesde = `${pad(parseInt(d1))}/${nombreMes1}/${y1}`;
        const fechaFormateadaHasta = `${pad(parseInt(d2))}/${nombreMes2}/${y2}`;
      
        const yBase = margins.top;
        const rightX = pageWidth - 10;
      
        if (base64Logo) {
          doc.addImage(base64Logo, 'PNG', margins.left, yBase, 40, 15);
        }
      
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('GAD Municipal del Cantón La Libertad', pageWidth / 2, yBase + 4, { align: 'center' });
      
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Informe de Contratos Finalizados y Anulados', pageWidth / 2, yBase + 10, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Desde: ${fechaFormateadaDesde} - Hasta: ${fechaFormateadaHasta}`, pageWidth / 2, yBase + 16, {
          align: 'center'
        });
      
        doc.setFontSize(8);
        doc.text(`Página ${currentPage} de ${totalPagesExp}`, rightX + 25.65, yBase + 4, { align: 'right' });
        doc.text(`Usuario: ${usuario}`, rightX - 6, yBase + 10, { align: 'right' });
        doc.text(fechaHora, rightX - 6, yBase + 16, { align: 'right' });
      
        doc.setDrawColor(150);
        doc.line(margins.left, yBase + 20, pageWidth - margins.right, yBase + 20);
      };        
      
      const columnStyles: { [key: string]: Partial<Styles> } = {
        CONTRIBUYENTE: { halign: 'left', cellWidth: 70 },
        PERIODO: { halign: 'center', cellWidth: 20 },
        CONTRATO: { halign: 'left', cellWidth: 25 },
        TIPO_DESCRIPCION: { halign: 'center', cellWidth: 30 },
        REALIZADO_POR: { halign: 'center', cellWidth: 30 },
        FECHA: { halign: 'center', cellWidth: 30 },
        OBSERVACION: { halign: 'left', cellWidth: 62 },
      };    
      
      const headerHeight = 20;
      let currentY = margins.top + headerHeight + 5;
      
      drawEncabezado();
      
      for (const ubicacion of ubicacionesUnicas) {
        const grupo = data.filter(row => row.UBICACION === ubicacion);
        
        // Verificar si hay suficiente espacio para la siguiente sección
        const espacioNecesario = 40;
        
        if (currentY + espacioNecesario > pageHeight - margins.bottom) {
          doc.addPage();
          drawEncabezado();
          currentY = margins.top + headerHeight + 5;
        }
        
        // Formatear los datos para mostrar
        const body = grupo.map(row => ({
          ...row,
          // Formatear la fecha si es necesario
          FECHA: row.FECHA ? new Date(row.FECHA).toLocaleDateString('es-EC') + ' ' + 
                 new Date(row.FECHA).toLocaleTimeString('es-EC', { hour12: false }) : '',
        }));
  
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`UBICACIÓN: ${ubicacion}`, margins.left, currentY+1);
        currentY += 3;
      
        autoTable(doc, {
          columns,
          body,
          startY: currentY,
          theme: 'grid',
          headStyles: {
            fillColor: [0, 35, 115],
            halign: 'center',
            textColor: 255
          },
          bodyStyles: { fontSize: 7 }, 
          columnStyles,
          margin: { top: 35, left: margins.left, right: margins.right, bottom: margins.bottom },
          didDrawPage: () => {
            drawEncabezado();
          }
        });      
        
        // Actualizar currentY después de la tabla
        if ((doc as any).lastAutoTable && (doc as any).lastAutoTable.finalY) {
          currentY = (doc as any).lastAutoTable.finalY + 5;
        } else {
          currentY += 150;
        }

        doc.setFont('helvetica', 'normal');
        doc.text(`Total de contratos: ${String(grupo.length).padStart(3, '0')}`, margins.left, currentY);
        currentY += 10;
      }
      
      // Agregar resumen final por tipo de contrato
      if (currentY + 50 > pageHeight - margins.bottom) {
        doc.addPage();
        drawEncabezado();
        currentY = margins.top + headerHeight + 5;
      }

      
      // Contar por tipo de descripción
      const resumenPorTipo = data.reduce((acc, row) => {
        const tipo = row.TIPO_DESCRIPCION || 'Sin especificar';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('RESUMEN POR TIPO DE CONTRATO:', margins.left, currentY);
      currentY += 3;
      
      const resumenBody = Object.entries(resumenPorTipo).map(([tipo, cantidad]) => [
        tipo,
        (cantidad as number).toString()
      ]);
      
      // Agregar total general
      resumenBody.push([
        'TOTAL GENERAL:',
        data.length.toString()
      ]);
      
      autoTable(doc, {
        head: [['Tipo de Contrato', 'Cantidad']],
        body: resumenBody,
        startY: currentY,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 35, 115],
          halign: 'center',
          textColor: 255
        },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { halign: 'left', cellWidth: 100 },
          1: { halign: 'center', cellWidth: 30 }
        },
        margin: { left: margins.left },
        didDrawPage: () => {
          drawEncabezado();
        },
        didParseCell: (data) => {
          // Hacer bold la fila del total
          if (data.row.index === resumenBody.length - 1) {
            data.cell.styles.fontStyle = 'bold';
          }
        }
      });
      
      doc.putTotalPages('{total_pages_count_string}');
      doc.save(`Contratos_${fechaConsulta}.pdf`);
  }
}
