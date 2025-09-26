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
          const headerHeight = 20;
          
          // Nueva lógica de paginación similar a tthh.service.ts
          const drawEncabezado = () => {
            const currentPage = (doc as any).getCurrentPageInfo()?.pageNumber || 1;
            if (paginasConEncabezado.has(currentPage)) return;
            paginasConEncabezado.add(currentPage);

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
            const rightX = pageWidth - margins.right;

            // Agregar logo si está disponible
            if (base64Logo) {
              doc.addImage(base64Logo, 'PNG', margins.left, yBase, 40, 15);
            }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('GAD Municipal del Cantón La Libertad', pageWidth / 2, yBase + 4, { align: 'center' });

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('Emisión Diaria de Exoneraciones', pageWidth / 2, yBase + 10, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Período: ${fechaFormateada}`, pageWidth / 2, yBase + 16, { align: 'center' });

            doc.setFontSize(8);
            doc.text(`Usuario: ${usuario}`, rightX, yBase + 10, { align: 'right' });
            doc.text(fechaHora, rightX, yBase + 16, { align: 'right' });

            doc.setDrawColor(150);
            doc.line(margins.left, yBase + 20, pageWidth - margins.right, yBase + 20);
          };
          
          // Definir las columnas según el requerimiento
          const columns: ColumnInput[] = [
            { header: 'Contribuyente', dataKey: 'CONTRIBUYENTE' },
            { header: 'Detalle', dataKey: 'DETALLE' },
            { header: '% Exonerado', dataKey: 'PORCENTAJE_EXONERACION' },
            { header: 'Concepto', dataKey: 'DESCRIPCION_INGRESO' },
            { header: 'F. Emisión', dataKey: 'FECHA_EMISION' },
            { header: 'Título Crédito', dataKey: 'TITULO' },
            { header: 'Emitido por', dataKey: 'EMITIDO_POR' },
            { header: 'V. Exonerado', dataKey: 'VALOR' },
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
            CONTRIBUYENTE: { halign: 'left', cellWidth: 42, fontSize: 8 },
            DETALLE: { halign: 'left', cellWidth: 60, fontSize: 8 },
            PORCENTAJE_EXONERACION: { halign: 'center', cellWidth: 25, fontSize: 8 },
            DESCRIPCION_INGRESO: { halign: 'left', cellWidth: 38, fontSize: 8 },
            FECHA_EMISION: { halign: 'center', cellWidth: 23, fontSize: 8 },
            TITULO: { halign: 'center', cellWidth: 30, fontSize: 8 },
            EMITIDO_POR: { halign: 'left', cellWidth: 25, fontSize: 8 },
            VALOR: { halign: 'right', cellWidth: 25, fontSize: 8 },
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
              fontSize: 9,
              font: 'helvetica',
              fontStyle: 'bold',
              lineWidth: 0.1,
              lineColor: [255, 255, 255],
              cellPadding: 2
            },
            /*headStyles: {
              fillColor: [0, 35, 115],
              halign: 'center',
              textColor: 255
            },*/
            bodyStyles: { 
              fontSize: 8,
              cellPadding: 2,
              overflow: 'linebreak',
              lineWidth: 0.1,
              textColor: [0, 0, 0],
              font: 'helvetica',
              lineColor: [200, 200, 200]
            },
            alternateRowStyles: {
              fillColor: [245, 245, 245]
            },
            columnStyles,
            margin: { top: margins.top + 25, left: margins.left, right: margins.right, bottom: margins.bottom },
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
          
          // Agregar tabla de totales con las mismas dimensiones que la tabla principal
          autoTable(doc, {
            body: [
              [
                { content: '', styles: { cellWidth: 42 } }, // Ancho de columna Contribuyente
                { content: '', styles: { cellWidth: 60 } }, // Ancho de columna Detalle
                { content: '', styles: { cellWidth: 25 } }, // Ancho de columna % Exoneración
                { content: '', styles: { cellWidth: 38 } }, // Ancho de columna Concepto
                { content: '', styles: { cellWidth: 23 } }, // Ancho de columna Fecha Emisión
                { content: '', styles: { cellWidth: 30 } }, // Ancho de columna Título Crédito
                { 
                  content: 'Total Exonerado:', 
                  styles: { 
                  halign: 'left', 
                  fontStyle: 'bold', 
                  fontSize: 9,
                  font: 'helvetica',
                  cellWidth: 25,
                  cellPadding: 2
                  } 
                },
                { 
                  content: '$ ' + totalValor.toLocaleString('es-EC', { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                  }), 
                  styles: { 
                  halign: 'right', 
                  fontStyle: 'bold', 
                  fontSize: 9,
                  font: 'helvetica',
                  cellWidth: 25,
                  cellPadding: 2
                  } 
                }
                ]
              ],
              startY: currentY,
              theme: 'striped',
              styles: { 
                fontSize: 9, 
                textColor: [0, 0, 0],
                font: 'helvetica',
              // fontStyle: 'bold',
              //lineColor: [0, 0, 0],
              lineWidth: 0.1,
              cellPadding: 2,
              fillColor: [245, 245, 245]
            },
            margin: { left: margins.left },
            didDrawPage: () => {
              drawEncabezado();
            }
          });
          
          // Actualizar currentY después de la tabla de totales
          currentY = (doc as any).lastAutoTable.finalY + 10;
          
          // Verificar si hay suficiente espacio para la sección de resumen por usuario
          if (currentY + 50 > pageHeight - margins.bottom) {
            doc.addPage();
            drawEncabezado();
            currentY = margins.top + 25;
          }
          
          // SECCIÓN: RESUMEN POR USUARIO
          // Contar por usuario (EMITIDO_POR)
          const resumenPorUsuario = data.reduce((acc, row) => {
            const usuario = row.EMITIDO_POR || 'Sin especificar';
            acc[usuario] = (acc[usuario] || 0) + 1;
            return acc;
          }, {} as { [key: string]: number });
          
          // Ordenar usuarios alfabéticamente
          const usuariosOrdenados = Object.keys(resumenPorUsuario).sort();
          
          // Crear el cuerpo de la tabla
          const resumenBody = usuariosOrdenados.map(usuario => [
            usuario,
            resumenPorUsuario[usuario].toString()
          ]);
          
          // Agregar total general
          resumenBody.push([
            'TOTAL GENERAL:',
            data.length.toString()
          ]);
          
          // Agregar título
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text('TOTAL DE REGISTRO POR USUARIO:', margins.left, currentY);
          currentY += 3;
          
          // Agregar tabla de resumen por usuario
          autoTable(doc, {
            head: [['Usuario', 'Cantidad']],
            body: resumenBody,
            startY: currentY,
            theme: 'grid',
            headStyles: {
              fillColor: [0, 35, 115],
              halign: 'center',
              textColor: 255,
              fontSize: 9,
              font: 'helvetica',
              fontStyle: 'bold',
              lineWidth: 0.1,
              lineColor: [255, 255, 255],
              cellPadding: 2
            },
            bodyStyles: { 
              fontSize: 9,
              cellPadding: 2,
              lineWidth: 0.1,
              font: 'helvetica',
              lineColor: [200, 200, 200]
            },
            columnStyles: {
              0: { halign: 'left', cellWidth: 100 },
              1: { halign: 'right', cellWidth: 30 }
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
          
       
          // Segunda pasada: dibujar paginación con el total real y alineada al margen derecho
          const totalPages = (doc as any).internal.getNumberOfPages();
          for (let i = 1; i <= totalPages; i++) {
            (doc as any).setPage(i);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            const rightX = pageWidth - margins.right;
            const yBase = margins.top;
            const pageLabel = `Página ${i} de ${totalPages}`;
            const labelWidth = doc.getTextWidth(pageLabel);
            const x = rightX - labelWidth;
            doc.text(pageLabel, x, yBase + 4);
          }

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
