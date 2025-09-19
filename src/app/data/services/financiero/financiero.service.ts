import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '@data/constants/routes';
import { catchError, map, Observable, of } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../api/auth.service';

import jsPDF from 'jspdf';
import autoTable, { ColumnInput, UserOptions, Styles, HAlignType } from 'jspdf-autotable';


@Injectable({
  providedIn: 'root'
})
export class FinancieroService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {  }

  private showLoading(message: string): void {
    Swal.fire({
      icon: 'info',
      title: message,
      text: 'Por favor, espere un momento.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  private closeLoading(): void {
    Swal.close();
  }

  private handleResponse<T>(response: Observable<T>): Observable<T> {
    return response.pipe(
      map(r => {
        this.closeLoading();
        return r;
      }),
      catchError(e => {
        this.closeLoading();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: e.error?.msg || 'Ha ocurrido un error inesperado.',
          confirmButtonText: 'Entendido'
        });
        console.error('Error al enviar datos', e);
        return of({ error: true, msg: e.error?.msg || 'Error inesperado', data: null } as any);
      })
    );
  }

  private getHttpOptions(contentType: string = 'application/json'): { headers: HttpHeaders, params?: HttpParams } {
    return {
      headers: new HttpHeaders({ 'Content-Type': contentType }),
      params: new HttpParams().set('rejectUnauthorized', 'false')
    };
  }

  private toFormUrlEncoded(data: any): string {
    let formBody: string[] = [];
    for (let property in data) {
        if (data.hasOwnProperty(property)) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(data[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
    }
    return formBody.join("&");
  }

  /**
   * SERVICIO QUE OBTIENE RECAUDACIONES POR DÍA
   * @param fecha Fecha en formato 'dd/MM/yyyy'
   * @returns Observable<{ error: boolean, msg: string, data: any }>
   */
  getRecaudacionesPorDia(fecha: string): Observable<{ error: boolean, msg: string, data: any }> {
    this.showLoading('Cargando...');
    const body = this.toFormUrlEncoded({ fecha });

    return this.handleResponse(
      this.http.post<{ error: boolean, msg: string, data: any }>(
        API_ROUTES.FINANCIERO.RECAUDACIONES_POR_DIA, // Asegúrate de que esta ruta sea correcta
        body,
        this.getHttpOptions('application/x-www-form-urlencoded') // Especifica el Content-Type como 'application/x-www-form-urlencoded'
      )
    );
  }

  
  generateReporteExoneracionesPDF(
    data: any[],
    titulo: string,
    fechaConsulta: string
  ): Observable<Blob> {
    return new Observable(observer => {
      import('jspdf').then(jsPDFModule => {
        const { jsPDF } = jsPDFModule;
        import('jspdf-autotable').then(autoTableModule => {
          const doc = new jsPDF('landscape');
          const autoTable = autoTableModule.default;
          
          const redondear = (n: number) => Number(n || 0).toFixed(2);
          
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
          
            // Formatear la fecha de consulta para mostrarla en el encabezado
            let fechaFormateada = fechaConsulta;
            if (fechaConsulta.includes(' - ')) {
              fechaFormateada = fechaConsulta; // Ya está formateada
            } else if (fechaConsulta.includes('-')) {
              const [year, month, day] = fechaConsulta.split('-');
              const nombreMes = mesesAbreviados[parseInt(month, 10) - 1];
              fechaFormateada = `${pad(parseInt(day))}/${nombreMes}/${year}`;
            }
          
            const yBase = margins.top;
            const rightX = pageWidth - 10;
          
            // Agregar logo si está disponible
            // if (base64Logo) {
            //   doc.addImage(base64Logo, 'PNG', margins.left, yBase, 40, 15);
            // }
          
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('GAD Municipal del Cantón La Libertad', pageWidth / 2, yBase + 4, { align: 'center' });
          
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('Reporte de Exoneraciones', pageWidth / 2, yBase + 10, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Período: ${fechaFormateada}`, pageWidth / 2, yBase + 16, { align: 'center' });
          
            doc.setFontSize(8);
            doc.text(`Página ${currentPage} de ${totalPagesExp}`, rightX + 25.65, yBase + 4, { align: 'right' });
            // doc.text(`Usuario: ${usuario}`, rightX - 6, yBase + 10, { align: 'right' });
            doc.text(fechaHora, rightX - 6, yBase + 16, { align: 'right' });
          
            doc.setDrawColor(150);
            doc.line(margins.left, yBase + 20, pageWidth - margins.right, yBase + 20);
          };
          
          // Definir las columnas según el requerimiento
          const columns: ColumnInput[] = [
            { header: 'Contribuyente', dataKey: 'CONTRIBUYENTE' },
            { header: 'Detalle', dataKey: 'DETALLE' },
            { header: '% Exoneración', dataKey: 'PORCENTAJE_EXONERACION' },
            { header: 'Descripción', dataKey: 'DESCRIPCION_INGRESO' },
            { header: 'Fecha Emisión', dataKey: 'FECHA_EMISION' },
            { header: 'Título', dataKey: 'TITULO' },
            { header: 'Emitido por', dataKey: 'EMITIDO_POR' },
            { header: 'Valor', dataKey: 'VALOR' },
          ];
          
          // Preparar los datos para la tabla
          const body = data.map(row => ({
            ...row,
            FECHA_EMISION: row.FECHA_EMISION ? new Date(row.FECHA_EMISION).toLocaleDateString() : '',
            FECHA_EXONERACION: row.FECHA_EXONERACION ? new Date(row.FECHA_EXONERACION).toLocaleDateString() : '',
            VALOR: redondear(row.VALOR),
            PORCENTAJE_EXONERACION: row.PORCENTAJE_EXONERACION ? `${row.PORCENTAJE_EXONERACION}%` : '100%'
          }));
          
          // Calcular el total de valores exonerados
          const totalValor = data.reduce((sum, row) => sum + Number(row.VALOR || 0), 0);
          
          // Estilos para las columnas
          const columnStyles: { [key: string]: Partial<Styles> } = {
            CONTRIBUYENTE: { halign: 'left', cellWidth: 50 },
            DETALLE: { halign: 'left', cellWidth: 60 },
            PORCENTAJE_EXONERACION: { halign: 'center', cellWidth: 20 },
            DESCRIPCION_INGRESO: { halign: 'left', cellWidth: 40 },
            FECHA_EMISION: { halign: 'center', cellWidth: 25 },
            TITULO: { halign: 'center', cellWidth: 25 },
            EMITIDO_POR: { halign: 'left', cellWidth: 30 },
            VALOR: { halign: 'right', cellWidth: 20 },
          };
          
          // Dibujar la tabla principal
          autoTable(doc, {
            columns,
            body,
            startY: margins.top + 25,
            theme: 'grid',
            headStyles: {
              fillColor: [0, 35, 115],
              halign: 'center',
              textColor: 255,
              fontSize: 8
            },
            bodyStyles: { 
              fontSize: 8,
              cellPadding: 2,
              overflow: 'linebreak',
              lineWidth: 0.1,
              textColor: [0, 0, 0],
              font: 'helvetica'
            },
            alternateRowStyles: {
              fillColor: [245, 245, 245]
            },
            columnStyles,
            margin: { top: 35, left: margins.left, right: margins.right, bottom: margins.bottom },
            didDrawPage: () => {
              drawEncabezado();
            }
          });
          
          // Obtener la posición Y después de la tabla
          let currentY = (doc as any).lastAutoTable.finalY + 10;
          
          // Verificar si hay suficiente espacio para la tabla de totales
          if (currentY + 30 > pageHeight - margins.bottom) {
            doc.addPage();
            drawEncabezado();
            currentY = margins.top + 25;
          }
          
          // Agregar tabla de totales
          autoTable(doc, {
            body: [[
              { content: 'Total Exonerado:', colSpan: 7, styles: { halign: 'right', fontStyle: 'bold', fontSize: 9 } },
              { content: totalValor.toLocaleString('es-EC', { minimumFractionDigits: 2 }), styles: { halign: 'right', fontStyle: 'bold', fontSize: 9 } }
            ]],
            startY: currentY,
            theme: 'grid',
            styles: { 
              fontSize: 9, 
              textColor: 20, 
              fontStyle: 'bold',
              lineColor: [0, 0, 0],
              lineWidth: 0.1,
            },
            margin: { left: margins.left, right: margins.right },
            didDrawPage: () => {
              drawEncabezado();
            }
          });
          
          // Actualizar currentY después de la tabla de totales
          currentY = (doc as any).lastAutoTable.finalY + 10;
          
          // Agregar resumen de registros
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(`Total de registros: ${data.length}`, margins.left, currentY);
          
          // Finalizar el PDF
          doc.putTotalPages('{total_pages_count_string}');
          
          // Generar el PDF como Blob
          const pdfBlob = doc.output('blob');
          observer.next(pdfBlob);
          observer.complete();
        }).catch(error => {
          console.error('Error al cargar jspdf-autotable:', error);
          observer.error(error);
        });
      }).catch(error => {
        console.error('Error al cargar jspdf:', error);
        observer.error(error);
      });
    });
  }

  generateReportePDF(data: any[], usuario: string, fechaConsulta: string, base64Logo: string) {
    const doc = new jsPDF('landscape');
    const redondear = (n: number) => Number(n || 0).toFixed(2);
    const ubicacionesUnicas = [...new Set(data.map(d => d.UBICACION))];
    
    const totalConcepto = data.reduce((sum, row) => sum + Number(row.CONCEPTO || 0), 0);
    const totalTasa = data.reduce((sum, row) => sum + Number(row.TASA || 0), 0);
    const totalIVA = data.reduce((sum, row) => sum + Number(row.IVA || 0), 0);
    const totalInteres = data.reduce((sum, row) => sum + Number(row.INTERES || 0), 0);
    const totalCoactiva = data.reduce((sum, row) => sum + Number(row.COACTIVA || 0), 0);
    const totalDescuento = data.reduce((sum, row) => sum + Number(row.DESCUENTO || 0), 0);
    const totalTotal = data.reduce((sum, row) => sum + Number(row.TOTAL || 0), 0);
    
    const columns: ColumnInput[] = [
      { header: 'Transac.', dataKey: 'CAJA_TRAN' },
      { header: 'Emisión', dataKey: 'EMISION' },
      { header: 'No. Título', dataKey: 'TITCRED' },
      { header: 'Cédula', dataKey: 'CEDULA' },
      { header: 'Contribuyente', dataKey: 'CONTRIBUYENTE' },
      { header: 'Concepto', dataKey: 'CONCEPTO' },
      { header: 'Tasa', dataKey: 'TASA' },
      { header: 'IVA', dataKey: 'IVA' },
      { header: '(+)Int', dataKey: 'INTERES' },
      { header: 'Coactiva', dataKey: 'COACTIVA' },
      { header: '(-)Desc', dataKey: 'DESCUENTO' },
      { header: 'Total', dataKey: 'TOTAL' },
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
      const nombreMes = mesesAbreviados[parseInt(month, 10) - 1];
      const fechaFormateada = `${pad(parseInt(day))}/${nombreMes}/${year}`;
    
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
      doc.text('Informe de Conceptos Mensuales Recaudados', pageWidth / 2, yBase + 10, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Fecha: ${fechaFormateada}`, pageWidth / 2, yBase + 16, { align: 'center' });
    
      doc.setFontSize(8);
      doc.text(`Página ${currentPage} de ${totalPagesExp}`, rightX + 25.65, yBase + 4, { align: 'right' });
      doc.text(`Usuario: ${usuario}`, rightX - 6, yBase + 10, { align: 'right' });
      doc.text(fechaHora, rightX - 6, yBase + 16, { align: 'right' });
    
      doc.setDrawColor(150);
      doc.line(margins.left, yBase + 20, pageWidth - margins.right, yBase + 20);
    };        
    
    const columnStyles: { [key: string]: Partial<Styles> } = {
      CAJA_TRAN: { halign: 'left', cellWidth: 20 },
      EMISION: { halign: 'center', cellWidth: 20 },
      TITCRED: { halign: 'right', cellWidth: 20 },
      CEDULA: { halign: 'right', cellWidth: 20 },
      CONTRIBUYENTE: { halign: 'left', cellWidth: 70 },
      CONCEPTO: { halign: 'right', cellWidth: 20 },
      TASA: { halign: 'right', cellWidth: 15 },
      IVA: { halign: 'right', cellWidth: 15 },
      INTERES: { halign: 'right', cellWidth: 15 },
      COACTIVA: { halign: 'right', cellWidth: 20 },
      DESCUENTO: { halign: 'right', cellWidth: 16 },
      TOTAL: { halign: 'right', cellWidth: 15 },
    };    
    
    const headerHeight = 20;
    // Iniciamos currentY después del encabezado con el margen correcto
    let currentY = margins.top + headerHeight + 5;
    
    drawEncabezado();
    
    for (const ubicacion of ubicacionesUnicas) {
      const grupo = data.filter(row => row.UBICACION === ubicacion);
      
      // Verificar si hay suficiente espacio para la siguiente sección
      // Calculamos aproximadamente cuánto espacio necesitamos
      const espacioNecesario = 40; // Espacio para título, subtítulo y un poco más
      
      // Si no hay suficiente espacio, añadir una nueva página
      if (currentY + espacioNecesario > pageHeight - margins.bottom) {
        doc.addPage();
        drawEncabezado();
        currentY = margins.top + headerHeight + 5;
      }
      
      const sumaUbicacion = {
        CONCEPTO: grupo.reduce((sum, row) => sum + Number(row.CONCEPTO || 0), 0),
        TASA: grupo.reduce((sum, row) => sum + Number(row.TASA || 0), 0),
        IVA: grupo.reduce((sum, row) => sum + Number(row.IVA || 0), 0),
        INTERES: grupo.reduce((sum, row) => sum + Number(row.INTERES || 0), 0),
        COACTIVA: grupo.reduce((sum, row) => sum + Number(row.COACTIVA || 0), 0),
        DESCUENTO: grupo.reduce((sum, row) => sum + Number(row.DESCUENTO || 0), 0),
        TOTAL: grupo.reduce((sum, row) => sum + Number(row.TOTAL || 0), 0),
      };
      
      const body = grupo.map(row => ({
        ...row,
        CONCEPTO: redondear(row.CONCEPTO),
        TASA: redondear(row.TASA),
        IVA: redondear(row.IVA),
        INTERES: redondear(row.INTERES),
        COACTIVA: redondear(row.COACTIVA),
        DESCUENTO: redondear(row.DESCUENTO),
        TOTAL: redondear(row.TOTAL),
      }));
      
      body.push({
        CAJA_TRAN: '',
        EMISION: '',
        TITCRED: '',
        CEDULA: '',
        CONTRIBUYENTE: 'Total por Ubicación:',
        CONCEPTO: redondear(sumaUbicacion.CONCEPTO),
        TASA: redondear(sumaUbicacion.TASA),
        IVA: redondear(sumaUbicacion.IVA),
        INTERES: redondear(sumaUbicacion.INTERES),
        COACTIVA: redondear(sumaUbicacion.COACTIVA),
        DESCUENTO: redondear(sumaUbicacion.DESCUENTO),
        TOTAL: redondear(sumaUbicacion.TOTAL),
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`UBICACIÓN: ${ubicacion}`, margins.left, currentY+1);
      currentY += 6;
    
      doc.setFont('helvetica', 'normal');
      doc.text(`Total de títulos: ${String(grupo.length).padStart(3, '0')}`, margins.left, currentY);
      currentY += 3; // Incrementado para dar más espacio
    
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
        bodyStyles: { fontSize: 8 },
        columnStyles,
        margin: { top: 35, left: margins.left, right: margins.right, bottom: margins.bottom },
        didDrawPage: () => {
          drawEncabezado();
        },
        didParseCell: (data) => {
          if (data.row.index === body.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            if (data.column.dataKey === 'CONTRIBUYENTE') {
              data.cell.styles.halign = 'right';
            }
          }
        }
      });      
      
      // Asegurarse de que currentY se actualice correctamente
      if ((doc as any).lastAutoTable && (doc as any).lastAutoTable.finalY) {
        currentY = (doc as any).lastAutoTable.finalY + 5;
      } else {
        // Si por alguna razón no se puede obtener finalY, incrementar currentY manualmente
        currentY += 150; // Un valor arbitrario grande que garantice espacio para la tabla
      }
    }
    
    // Verificar si hay suficiente espacio para la tabla de totales
    if (currentY + 30 > pageHeight - margins.bottom) {
      doc.addPage();
      drawEncabezado();
      currentY = margins.top + headerHeight + 5;
    }
    
    const colStartX = margins.left + 4 * 20;
    
    autoTable(doc, {
      body: [[
        { content: 'Total: ', colSpan:1, styles: { halign: 'right', fontStyle: 'bold'} },
        { content: totalConcepto.toLocaleString('es-EC', { minimumFractionDigits: 2 }), styles: { halign: 'right' } },
        { content: totalTasa.toLocaleString('es-EC', { minimumFractionDigits: 2 }), styles: { halign: 'right' } },
        { content: totalIVA.toLocaleString('es-EC', { minimumFractionDigits: 2 }), styles: { halign: 'right' } },
        { content: totalInteres.toLocaleString('es-EC', { minimumFractionDigits: 2 }), styles: { halign: 'right' } },
        { content: totalCoactiva.toLocaleString('es-EC', { minimumFractionDigits: 2 }), styles: { halign: 'right' } },
        { content: totalDescuento.toLocaleString('es-EC', { minimumFractionDigits: 2 }), styles: { halign: 'right' } },
        { content: totalTotal.toLocaleString('es-EC', { minimumFractionDigits: 2 }), styles: { halign: 'right' } },
      ]],      
      theme: 'grid',
      styles: { 
        fontSize: 8, 
        textColor: 20, 
        fontStyle: 'bold',
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      margin: { left: colStartX },
      columnStyles: {
        0: { cellWidth: 70, fontSize: 10},
        1: { cellWidth: 20 },
        2: { cellWidth: 15 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 20 },
        6: { cellWidth: 16 },
        7: { cellWidth: 15 },
      },
      startY: currentY,
      didDrawPage: () => {
        drawEncabezado();
      }
    });

    // Actualizar currentY después de la tabla de totales
    if ((doc as any).lastAutoTable && (doc as any).lastAutoTable.finalY) {
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Verificar si hay suficiente espacio para el resumen por ubicación
    if (currentY + 50 > pageHeight - margins.bottom) {
      doc.addPage();
      drawEncabezado();
      currentY = margins.top + headerHeight + 5;
    }
    
    // NUEVA SECCIÓN: RESUMEN POR UBICACIÓN
    // Contar por ubicación
    const resumenPorUbicacion = data.reduce((acc, row) => {
      const ubicacion = row.UBICACION || 'Sin especificar';
      acc[ubicacion] = (acc[ubicacion] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL DE REGISTROS POR UBICACIÓN:', margins.left, currentY);
    currentY += 3;
    
    const resumenBody = Object.entries(resumenPorUbicacion).map(([ubicacion, cantidad]) => [
      ubicacion,
      (cantidad as number).toString()
    ]);
    
    // Agregar total general
    resumenBody.push([
      'TOTAL GENERAL:',
      data.length.toString()
    ]);
    
    autoTable(doc, {
      head: [['Ubicación', 'Cantidad']],
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
    doc.save(`CRM_${fechaConsulta}.pdf`);
  }

  /**
   * SERVICIO QUE OBTIENE RECAUDACIONES POR DÍA
   * @param fecha Fecha en formato 'dd/MM/yyyy'
   * @returns Observable<{ error: boolean, msg: string, data: any }>
   */
  getRecaudacionesPorFecha(fechaDesde: string, fechaHasta: string): Observable<{ error: boolean, msg: string, data: any }> {
    this.showLoading('Cargando...');
    const body = this.toFormUrlEncoded({ fechaDesde, fechaHasta });

    return this.handleResponse(
      this.http.post<{ error: boolean, msg: string, data: any }>(
        API_ROUTES.FINANCIERO.RECAUDACIONES_POR_FECHA, // Asegúrate de que esta ruta sea correcta
        body,
        this.getHttpOptions('application/x-www-form-urlencoded') // Especifica el Content-Type como 'application/x-www-form-urlencoded'
      )
    );
  }

  

  /**
   * SERVICIO QUE OBTIENE UN PDF CON INFORMACIÓN
   * @param fecha Fecha en formato 'dd/MM/yyyy'
   * @returns Observable<Blob> 
   */
  getPdfReporte(fecha: string): Observable<Blob> {
    this.showLoading('Generando PDF...');
    const user = this.authService.getUserFromLocalStorage();
  
    if (user) {
      // Crea el objeto data con fecha y usuario
      const data = {
        fecha: fecha,
        user: user.username // Ajusta si es necesario
      };
  
      return this.handleResponse(
        this.http.post(
          API_ROUTES.FINANCIERO.REPORT_RECAUD_POR_DIA, // Asegúrate de que esta ruta sea correcta
          this.toFormUrlEncoded(data),
          {
            responseType: 'blob',
            ...this.getHttpOptions('application/x-www-form-urlencoded')
          }
        ).pipe(
          map(response => {
            this.closeLoading();
            return response;
          })
        )
      );
    } else {
      console.error('No se encontró el usuario en el local storage.');
      this.closeLoading();
      return of(new Blob()); // Devuelve un Blob vacío en caso de error
    }
  }
  
  /**
   * SERVICIO QUE OBTIENE UN PDF CON INFORMACIÓN
   * @param fecha Fecha en formato 'dd/MM/yyyy'
   * @returns Observable<Blob> 
   */
  getPdfReporteFechas(fechaDesde: string, fechaHasta: string): Observable<Blob> {
    this.showLoading('Generando PDF...');
    const user = this.authService.getUserFromLocalStorage();
  
    if (user) {
      // Crea el objeto data con fecha y usuario
      const data = {
        fechaDesde: fechaDesde,
        fechaHasta: fechaHasta,
        user: user.username // Ajusta si es necesario
      };
  
      return this.handleResponse(
        this.http.post(
          API_ROUTES.FINANCIERO.REPORT_RECAUD_POR_FECHA, // Asegúrate de que esta ruta sea correcta
          this.toFormUrlEncoded(data),
          {
            responseType: 'blob',
            ...this.getHttpOptions('application/x-www-form-urlencoded')
          }
        ).pipe(
          map(response => {
            this.closeLoading();
            return response;
          })
        )
      );
    } else {
      console.error('No se encontró el usuario en el local storage.');
      this.closeLoading();
      return of(new Blob()); // Devuelve un Blob vacío en caso de error
    }
  }


  generateReporteMensualPDF(data: any[], usuario: string, fechaConsulta: string, fechaHastaConsulta: string, base64Logo: string) {
    const doc = new jsPDF('landscape');
    function redondear(valor: number | string): string {
      const num = Number(valor) || 0;
      return num.toLocaleString('es-EC', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    
    const ubicacionesUnicas = [...new Set(data.map(d => d.UBICACION))];
    
    const totalConcepto = data.reduce((sum, row) => sum + Number(row.CONCEPTO || 0), 0);
    const totalTasa = data.reduce((sum, row) => sum + Number(row.TASA || 0), 0);
    const totalIVA = data.reduce((sum, row) => sum + Number(row.IVA || 0), 0);
    const totalInteres = data.reduce((sum, row) => sum + Number(row.INTERES || 0), 0);
    const totalCoactiva = data.reduce((sum, row) => sum + Number(row.COACTIVA || 0), 0);
    const totalDescuento = data.reduce((sum, row) => sum + Number(row.DESCUENTO || 0), 0);
    const totalTotal = data.reduce((sum, row) => sum + Number(row.TOTAL || 0), 0);
    
    const columns: ColumnInput[] = [
      { header: 'Transac.', dataKey: 'CAJA_TRAN' },
      { header: 'Emisión', dataKey: 'EMISION' },
      { header: 'No. Título', dataKey: 'TITCRED' },
      { header: 'Cédula', dataKey: 'CEDULA' },
      { header: 'Contribuyente', dataKey: 'CONTRIBUYENTE' },
      { header: 'Concepto', dataKey: 'CONCEPTO' },
      { header: 'Tasa', dataKey: 'TASA' },
      { header: 'IVA', dataKey: 'IVA' },
      { header: '(+)Int', dataKey: 'INTERES' },
      { header: 'Coactiva', dataKey: 'COACTIVA' },
      { header: '(-)Desc', dataKey: 'DESCUENTO' },
      { header: 'Total', dataKey: 'TOTAL' },
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
      doc.text('Informe de Conceptos Mensuales Recaudados', pageWidth / 2, yBase + 10, { align: 'center' });
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
      CAJA_TRAN: { halign: 'left', cellWidth: 20 },
      EMISION: { halign: 'center', cellWidth: 20 },
      TITCRED: { halign: 'right', cellWidth: 20 },
      CEDULA: { halign: 'right', cellWidth: 20 },
      CONTRIBUYENTE: { halign: 'left', cellWidth: 70 },
      CONCEPTO: { halign: 'right', cellWidth: 20 },
      TASA: { halign: 'right', cellWidth: 15 },
      IVA: { halign: 'right', cellWidth: 15 },
      INTERES: { halign: 'right', cellWidth: 15 },
      COACTIVA: { halign: 'right', cellWidth: 20 },
      DESCUENTO: { halign: 'right', cellWidth: 16 },
      TOTAL: { halign: 'right', cellWidth: 15 },
    };    
    
    const headerHeight = 20;
    // Iniciamos currentY después del encabezado con el margen correcto
    let currentY = margins.top + headerHeight + 5;
    
    drawEncabezado();
    
    for (const ubicacion of ubicacionesUnicas) {
      const grupo = data.filter(row => row.UBICACION === ubicacion);
      
      // Verificar si hay suficiente espacio para la siguiente sección
      // Calculamos aproximadamente cuánto espacio necesitamos
      const espacioNecesario = 40; // Espacio para título, subtítulo y un poco más
      
      // Si no hay suficiente espacio, añadir una nueva página
      if (currentY + espacioNecesario > pageHeight - margins.bottom) {
        doc.addPage();
        drawEncabezado();
        currentY = margins.top + headerHeight + 5;
      }
      
      const sumaUbicacion = {
        CONCEPTO: grupo.reduce((sum, row) => sum + Number(row.CONCEPTO || 0), 0),
        TASA: grupo.reduce((sum, row) => sum + Number(row.TASA || 0), 0),
        IVA: grupo.reduce((sum, row) => sum + Number(row.IVA || 0), 0),
        INTERES: grupo.reduce((sum, row) => sum + Number(row.INTERES || 0), 0),
        COACTIVA: grupo.reduce((sum, row) => sum + Number(row.COACTIVA || 0), 0),
        DESCUENTO: grupo.reduce((sum, row) => sum + Number(row.DESCUENTO || 0), 0),
        TOTAL: grupo.reduce((sum, row) => sum + Number(row.TOTAL || 0), 0),
      };
      
      const body = grupo.map(row => ({
        ...row,
        CONCEPTO: redondear(row.CONCEPTO),
        TASA: redondear(row.TASA),
        IVA: redondear(row.IVA),
        INTERES: redondear(row.INTERES),
        COACTIVA: redondear(row.COACTIVA),
        DESCUENTO: redondear(row.DESCUENTO),
        TOTAL: redondear(row.TOTAL),
      }));
      
      body.push({
        CAJA_TRAN: '',
        EMISION: '',
        TITCRED: '',
        CEDULA: '',
        CONTRIBUYENTE: 'Total por Ubicación:',
        CONCEPTO: redondear(sumaUbicacion.CONCEPTO),
        TASA: redondear(sumaUbicacion.TASA),
        IVA: redondear(sumaUbicacion.IVA),
        INTERES: redondear(sumaUbicacion.INTERES),
        COACTIVA: redondear(sumaUbicacion.COACTIVA),
        DESCUENTO: redondear(sumaUbicacion.DESCUENTO),
        TOTAL: redondear(sumaUbicacion.TOTAL),
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`UBICACIÓN: ${ubicacion}`, margins.left, currentY+1);
      currentY += 6;
    
      doc.setFont('helvetica', 'normal');
      doc.text(`Total de títulos: ${String(grupo.length).padStart(3, '0')}`, margins.left, currentY);
      currentY += 3; // Incrementado para dar más espacio
    
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
        bodyStyles: { fontSize: 8 },
        columnStyles,
        margin: { top: 35, left: margins.left, right: margins.right, bottom: margins.bottom },
        didDrawPage: () => {
          drawEncabezado();
        },
        didParseCell: (data) => {
          if (data.row.index === body.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            if (data.column.dataKey === 'CONTRIBUYENTE') {
              data.cell.styles.halign = 'right';
            }
          }
        }
      });      
      
      // Asegurarse de que currentY se actualice correctamente
      if ((doc as any).lastAutoTable && (doc as any).lastAutoTable.finalY) {
        currentY = (doc as any).lastAutoTable.finalY + 5;
      } else {
        // Si por alguna razón no se puede obtener finalY, incrementar currentY manualmente
        currentY += 150; // Un valor arbitrario grande que garantice espacio para la tabla
      }
    }
    
    // Verificar si hay suficiente espacio para la tabla de totales
    if (currentY + 30 > pageHeight - margins.bottom) {
      doc.addPage();
      drawEncabezado();
      currentY = margins.top + headerHeight + 5;
    }
    
    const colStartX = margins.left + 4 * 20;
    
    autoTable(doc, {
      body: [[
        { content: 'Total: ', colSpan:1, styles: { halign: 'right', fontStyle: 'bold'} },
        { content: totalConcepto.toLocaleString('es-EC', { minimumFractionDigits: 2 }), styles: { halign: 'right' } },
        { content: totalTasa.toLocaleString('es-EC', { minimumFractionDigits: 2 }), styles: { halign: 'right' } },
        { content: totalIVA.toLocaleString('es-EC', { minimumFractionDigits: 2 }), styles: { halign: 'right' } },
        { content: totalInteres.toLocaleString('es-EC', { minimumFractionDigits: 2 }), styles: { halign: 'right' } },
        { content: totalCoactiva.toLocaleString('es-EC', { minimumFractionDigits: 2 }), styles: { halign: 'right' } },
        { content: totalDescuento.toLocaleString('es-EC', { minimumFractionDigits: 2 }), styles: { halign: 'right' } },
        { content: totalTotal.toLocaleString('es-EC', { minimumFractionDigits: 2 }), styles: { halign: 'right' } },
      ]],
      theme: 'grid',
      styles: { 
        fontSize: 8, 
        textColor: 20, 
        fontStyle: 'bold',
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      margin: { left: colStartX },
      columnStyles: {
        0: { cellWidth: 70, fontSize: 10},
        1: { cellWidth: 20 },
        2: { cellWidth: 15 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 20 },
        6: { cellWidth: 16 },
        7: { cellWidth: 15 },
      },
      startY: currentY,
      didDrawPage: () => {
        drawEncabezado();
      }
    });

    // Actualizar currentY después de la tabla de totales
    if ((doc as any).lastAutoTable && (doc as any).lastAutoTable.finalY) {
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }
    
    if (currentY + 50 > pageHeight - margins.bottom) {
      doc.addPage();
      drawEncabezado();
      currentY = margins.top + headerHeight + 5;
    }
    
    // NUEVA SECCIÓN: RESUMEN POR UBICACIÓN
    // Contar por ubicación
    const resumenPorUbicacion = data.reduce((acc, row) => {
      const ubicacion = row.UBICACION || 'Sin especificar';
      acc[ubicacion] = (acc[ubicacion] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL DE REGISTROS POR UBICACIÓN:', margins.left, currentY);
    currentY += 3;
    
    const resumenBody = Object.entries(resumenPorUbicacion).map(([ubicacion, cantidad]) => [
      ubicacion,
      (cantidad as number).toString()
    ]);
    
    // Agregar total general
    resumenBody.push([
      'TOTAL GENERAL:',
      data.length.toString()
    ]);
    
    autoTable(doc, {
      head: [['Ubicación', 'Cantidad']],
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
    doc.save(`CRM_${fechaConsulta}-${fechaHastaConsulta}.pdf`);
  }

}
