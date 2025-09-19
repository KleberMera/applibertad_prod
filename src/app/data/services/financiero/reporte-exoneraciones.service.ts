import { Injectable } from '@angular/core';
import { ColumnInput, Styles } from 'jspdf-autotable';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReporteExoneracionesService {

  
  generateReporteExoneracionesPDF(
    data: any[],
    titulo: string,
    fechaConsulta: string,
    usuario: string = '',
    base64Logo: string = ''
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
            if (base64Logo) {
              doc.addImage(base64Logo, 'PNG', margins.left, yBase, 40, 15);
            }
          
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('GAD Municipal del Cantón La Libertad', pageWidth / 2, yBase + 4, { align: 'center' });
          
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('Emision Diarias de Exoneraciones', pageWidth / 2, yBase + 10, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Período: ${fechaFormateada}`, pageWidth / 2, yBase + 16, { align: 'center' });
          
            doc.setFontSize(8);
            doc.text(`Página ${currentPage} de ${totalPagesExp}`, rightX + 25.65, yBase + 4, { align: 'right' });
            doc.text(`Usuario: ${usuario}`, rightX - 6, yBase + 10, { align: 'right' });
            doc.text(fechaHora, rightX - 6, yBase + 16, { align: 'right' });
          
            doc.setDrawColor(150);
            doc.line(margins.left, yBase + 20, pageWidth - margins.right, yBase + 20);
          };
          
          // Definir las columnas según el requerimiento
          const columns: ColumnInput[] = [
            { header: 'Contribuyente', dataKey: 'CONTRIBUYENTE' },
            { header: 'Detalle', dataKey: 'DETALLE' },
            { header: '% Exoneración', dataKey: 'PORCENTAJE_EXONERACION' },
            { header: 'Concepto', dataKey: 'DESCRIPCION_INGRESO' },
            { header: 'Fecha Emisión', dataKey: 'FECHA_EMISION' },
            { header: 'Título Crédito', dataKey: 'TITULO' },
            { header: 'Emitido por', dataKey: 'EMITIDO_POR' },
            { header: 'Valor Exonerado', dataKey: 'VALOR' },
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
            PORCENTAJE_EXONERACION: { halign: 'center', cellWidth: 25 },
            DESCRIPCION_INGRESO: { halign: 'left', cellWidth: 40 },
            FECHA_EMISION: { halign: 'center', cellWidth: 25 },
            TITULO: { halign: 'center', cellWidth: 30 },
            EMITIDO_POR: { halign: 'left', cellWidth: 25 },
            VALOR: { halign: 'right', cellWidth: 15 },
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
}
