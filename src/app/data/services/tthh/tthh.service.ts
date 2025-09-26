import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ROUTES } from '@data/constants/routes'; // Asegúrate de tener la constante de ruta adecuada
import { Observable, catchError, map, of } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable, { ColumnInput, Styles } from 'jspdf-autotable';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class TthhService {

  // Constructor para inyectar HttpClient
  constructor(private http: HttpClient) { }

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
  
    private handleResponse<T>(response: Observable<T>, showSuccessMessage: boolean = true): Observable<T> {
      return response.pipe(
        map((r: any) => {
          this.closeLoading();
          if (r.error) {
            Swal.fire({
              icon: 'warning',
              title: 'Advertencia',
              text: r.msg || 'Ocurrió un problema.'
            });
          } else if (showSuccessMessage) {
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: r.msg || 'Operación exitosa'
            });
          }
          return r;
        }),
        catchError(e => {
          this.closeLoading();
          const errorMsg = e.error?.msg || 'Ha ocurrido un error inesperado.';
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMsg
          });
          return of({ error: true, msg: errorMsg, data: null } as any);
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

  // Método para obtener el resumen de marcaciones de obreros
  getResumenMarcaciones(params: string): Observable<any> {
    const httpOptions = this.getHttpOptions('application/x-www-form-urlencoded');
    return this.http.post<any>(
      API_ROUTES.TTHH.RESUMEN_MARCACIONES,
      params,
      httpOptions
    ).pipe(
      catchError(error => {
        console.error('Error en getResumenMarcaciones:', error);
        return of({ error: true, msg: 'Error al obtener el resumen de marcaciones', data: null });
      })
    );
  }

  // Método para obtener la lista completa de empleados para el filtro
  getListaEmpleadosFiltro(): Observable<any> {
    return this.http.get<any>(API_ROUTES.TTHH.LISTA_EMPLEADOS_FILTRO).pipe(
      catchError(error => {
        console.error('Error en getListaEmpleadosFiltro:', error);
        return of({ error: true, msg: 'Error al obtener la lista de empleados', data: [] });
      })
    );
  }

  // Método para obtener la relación laboral del empleado
  getEmployeeRelation(cedula: string): Observable<{ error: boolean; msg: string; data: any }> {
    // Convertir datos a formato application/x-www-form-urlencoded
    const requestData = new URLSearchParams({ cedula }).toString();

    // Configurar cabeceras HTTP
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    };

    // Enviar solicitud POST
    return this.http.post<{ error: boolean; msg: string; data: any }>(
      API_ROUTES.TTHH.CONS_REL_LAB_BYCED, // Ajusta esta ruta a tu configuración
      requestData,
      httpOptions
    ).pipe(
      map(response => {
        // Manejar la respuesta del servidor
        if (response.error === true) {
          console.error('Error:', response.msg);
        } else {
          //console.log('Datos obtenidos:', response.data);
        }
        return response;
      }),
      catchError(e => {
        // Manejar el error
        console.error('Error en la solicitud:', e);
        return of({ error: true, msg: 'Error de conexión', data: null });
      })
    );
  }

  getMarcaciones(fechaDesde: string, fechaHasta: string, cedula: string){
    this.showLoading('Cargando marcaciones...');
  
    // Crear el objeto de datos a enviar
    const data = {
      fechaDesde: fechaDesde,
      fechaHasta: fechaHasta,
      cedula: cedula
    };
  
    // Convertir a formato URL-encoded
    const body = this.toFormUrlEncoded(data);
    //console.log(body);
  
    return this.handleResponse(
      this.http.post<{ error: boolean, msg: string, data: any[] }>(
        API_ROUTES.TTHH.MARCACIONES,
        body, // Aquí pasas el cuerpo como string
        this.getHttpOptions('application/x-www-form-urlencoded') // Asegúrate de que el Content-Type es correcto
      ),
      false
    );
  }

  generateMarcacionesObrerosPDF(
    data: any[],
    usuario: string,
    fechaDesde: string,
    fechaHasta: string,
    base64Logo: string
  ) {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    // Reducir márgenes laterales ligeramente para ganar espacio horizontal
    const margins = { top: 15, bottom: 15, left: 12, right: 12 };

    // Encabezado con logo, título, fechas y usuario (mismo estilo general que exportarPDF2)
    const paginasConEncabezado = new Set<number>();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const mesesAbreviados = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEPT', 'OCT', 'NOV', 'DIC'];

    const formatearFechaCab = (yyyy_mm_dd: string) => {
      const [y, m, d] = yyyy_mm_dd.split('-');
      const nombreMes = mesesAbreviados[parseInt(m, 10) - 1];
      return `${pad(parseInt(d, 10))}/${nombreMes}/${y}`;
    };

    const drawEncabezado = () => {
      const currentPage = (doc as any).getCurrentPageInfo()?.pageNumber || 1;
      if (paginasConEncabezado.has(currentPage)) return;
      paginasConEncabezado.add(currentPage);

      const now = new Date();
      const hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      const fechaHora = `${pad(now.getDate())}/${mesesAbreviados[now.getMonth()]}/${now.getFullYear()}, ${pad(hour12)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${ampm}`;

      const yBase = margins.top;
      const rightX = pageWidth - margins.right; // alineación consistente al margen derecho

      if (base64Logo) {
        doc.addImage(base64Logo, 'PNG', margins.left, yBase, 40, 15);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('GAD Municipal del Cantón La Libertad', pageWidth / 2, yBase + 4, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Marcaciones de Obreros', pageWidth / 2, yBase + 10, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Desde: ${formatearFechaCab(fechaDesde)} - Hasta: ${formatearFechaCab(fechaHasta)}`, pageWidth / 2, yBase + 16, { align: 'center' });

      doc.setFontSize(8);
      // En el encabezado dibujamos Usuario y Fecha/Hora; la paginación se dibuja en una segunda pasada
      doc.text(`Usuario: ${usuario}`, rightX, yBase + 10, { align: 'right' });
      doc.text(fechaHora, rightX, yBase + 16, { align: 'right' });

      doc.setDrawColor(150);
      doc.line(margins.left, yBase + 20, pageWidth - margins.right, yBase + 20);
    };

    // Preparar columnas y estilos (sin Departamento; se mostrará como encabezado por grupo)
    const columns: ColumnInput[] = [
      { header: 'Fecha', dataKey: 'FECHA' },
      { header: 'Empleado', dataKey: 'NOM_EMPLEADO' },
      { header: 'Cédula', dataKey: 'CEDULA' },
      { header: 'Marcación 1', dataKey: 'MARCACION1' },
      { header: 'Marcación 2', dataKey: 'MARCACION2' },
      { header: 'Marcación 3', dataKey: 'MARCACION3' },
      { header: 'Marcación 4', dataKey: 'MARCACION4' },
      { header: 'Hora Mín', dataKey: 'HORA_MINIMA' },
      { header: 'Hora Máx', dataKey: 'HORA_MAXIMA' },
      { header: 'Cargo', dataKey: 'DES_CARGO' },
      { header: 'Tipo de Rol', dataKey: 'DES_TIPO_ROL' },
    ];

    const columnStyles: { [key: string]: Partial<Styles> } = {
      FECHA: { halign: 'center', cellWidth: 18 },
      NOM_EMPLEADO: { halign: 'left', cellWidth: 50, overflow: 'linebreak' as any },
      CEDULA: { halign: 'right', cellWidth: 19 },
      MARCACION1: { halign: 'center', cellWidth: 20 },
      MARCACION2: { halign: 'center', cellWidth: 20 },
      MARCACION3: { halign: 'center', cellWidth: 20 },
      MARCACION4: { halign: 'center', cellWidth: 20 },
      HORA_MINIMA: { halign: 'center', cellWidth: 20 },
      HORA_MAXIMA: { halign: 'center', cellWidth: 20 },
      DES_CARGO: { halign: 'left', cellWidth: 38, overflow: 'linebreak' as any },
      DES_TIPO_ROL: { halign: 'left', cellWidth: 28, overflow: 'linebreak' as any },
    };

    const formatearFechaBody = (fechaStr: string) => {
      const fecha = new Date(fechaStr);
      const d = pad(fecha.getDate());
      const m = pad(fecha.getMonth() + 1);
      const y = fecha.getFullYear();
      return `${d}/${m}/${y}`;
    };

    // Agrupar datos por departamento
    const gruposPorDepartamento = new Map<string, any[]>();
    (data || []).forEach(row => {
      const dep = row.DES_DEPARTAMENTO || 'SIN DEPARTAMENTO';
      if (!gruposPorDepartamento.has(dep)) gruposPorDepartamento.set(dep, []);
      gruposPorDepartamento.get(dep)!.push(row);
    });

    // Dibujar encabezado de la página
    drawEncabezado();

    // Iterar por cada departamento y generar una tabla por grupo
    let currentY = margins.top + 25; // debajo del encabezado general
    let totalRegistros = 0;

    const sortedDeps = Array.from(gruposPorDepartamento.keys()).sort((a, b) => a.localeCompare(b));
    sortedDeps.forEach((dep, idx) => {
      const filasGrupo = gruposPorDepartamento.get(dep) || [];
      totalRegistros += filasGrupo.length;

      // Si no hay espacio suficiente en la página actual, crear una nueva
      if (currentY + 30 > pageHeight - margins.bottom) {
        doc.addPage();
        drawEncabezado();
        currentY = margins.top + 25;
      }

      // Título del grupo: Departamento
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Departamento: ${dep}`, margins.left, currentY);
      currentY += 4;

      // Preparar cuerpo del grupo sin el campo Departamento
      const bodyGrupo = filasGrupo.map(row => ({
        FECHA: formatearFechaBody(row.FECHA),
        NOM_EMPLEADO: row.NOM_EMPLEADO,
        CEDULA: row.CEDULA,
        MARCACION1: row.MARCACION1 || 'Sin registro',
        MARCACION2: row.MARCACION2 || 'Sin registro',
        MARCACION3: row.MARCACION3 || 'Sin registro',
        MARCACION4: row.MARCACION4 || 'Sin registro',
        HORA_MINIMA: row.HORA_MINIMA || '',
        HORA_MAXIMA: row.HORA_MAXIMA || '',
        DES_CARGO: row.DES_CARGO || '',
        DES_TIPO_ROL: row.DES_TIPO_ROL || ''
      }));

      autoTable(doc, {
        columns,
        body: bodyGrupo,
        startY: currentY + 2,
        theme: 'grid',
        headStyles: { fillColor: [0, 35, 115], halign: 'center', textColor: 255, fontSize: 7.5 },
        bodyStyles: { fontSize: 6.5 },
        columnStyles,
        margin: { top: 35, left: margins.left, right: margins.right, bottom: margins.bottom },
        didDrawPage: () => {
          drawEncabezado();
        }
      });

      currentY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 8 : currentY + 8;
    });

    // Página/resumen: colocar inmediatamente después de la última tabla si hay espacio
    const resumenTitleYCandidate = ((doc as any).lastAutoTable?.finalY || (margins.top + 25)) + 8;
    let yPosResumen: number;
    const neededForTitleAndOneRow = 22; // título + header + 1 fila aprox
    let startingOnNewPageForResumen = false;
    if (resumenTitleYCandidate + neededForTitleAndOneRow <= pageHeight - margins.bottom) {
      // Cabe en la página actual
      yPosResumen = resumenTitleYCandidate;
    } else {
      // No cabe, crear nueva página
      doc.addPage();
      drawEncabezado();
      yPosResumen = margins.top + 25;
      startingOnNewPageForResumen = true;
    }

    // Título del resumen
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    // Añadir un espacio adicional si inicia en nueva página
    yPosResumen += startingOnNewPageForResumen ? 8 : 4;
    doc.text('TOTAL DE REGISTROS POR DEPARTAMENTO:', margins.left, yPosResumen);

    // Construir datos de resumen
    const resumenRows = sortedDeps.map(dep => ({
      DEPARTAMENTO: dep,
      CANTIDAD: (gruposPorDepartamento.get(dep) || []).length
    }));
    const totalGeneral = resumenRows.reduce((acc, r) => acc + r.CANTIDAD, 0);

    // Tabla del resumen (autopaginada por autoTable si fuera necesario)
    autoTable(doc, {
      columns: [
        { header: 'Departamento', dataKey: 'DEPARTAMENTO' },
        { header: 'Cantidad', dataKey: 'CANTIDAD' },
      ],
      body: resumenRows,
      startY: yPosResumen + 4,
      theme: 'grid',
      headStyles: { fillColor: [0, 35, 115], halign: 'center', textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        DEPARTAMENTO: { cellWidth: 120 },
        CANTIDAD: { halign: 'right', cellWidth: 25 },
      },
      // Importante: aumentar el margen superior para evitar chocar con la línea gris (y=35)
      // En páginas nuevas, autoTable usa este margen para posicionar el encabezado de la tabla
      margin: { top: 43, left: margins.left, right: margins.right, bottom: margins.bottom },
      didDrawPage: () => {
        drawEncabezado();
      }
    });

    // Dibujar TOTAL GENERAL justo después de la tabla de resumen
    const afterResumenY = (doc as any).lastAutoTable?.finalY || (yPosResumen + 20);
    const totalHeight = 10;
    if (afterResumenY + totalHeight > pageHeight - margins.bottom) {
      doc.addPage();
      drawEncabezado();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      const resumenTop = margins.top + 25 + 8; // más espacio cuando comienza en nueva página
      doc.text('TOTAL DE REGISTROS POR DEPARTAMENTO:', margins.left, resumenTop);
    }
    autoTable(doc, {
      columns: [
        { header: 'Departamento', dataKey: 'DEPARTAMENTO' },
        { header: 'Cantidad', dataKey: 'CANTIDAD' },
      ],
      body: [ { DEPARTAMENTO: 'TOTAL GENERAL:', CANTIDAD: totalGeneral } ],
      startY: ((doc as any).lastAutoTable?.finalY || (margins.top + 25 + 4)) + 4,
      theme: 'grid',
      headStyles: { fillColor: [255, 255, 255], textColor: 0, lineWidth: 0 },
      showHead: 'never',
      bodyStyles: { fontSize: 8, fontStyle: 'bold' },
      columnStyles: {
        DEPARTAMENTO: { cellWidth: 120 },
        CANTIDAD: { halign: 'right', cellWidth: 25 },
      },
      margin: { top: 35, left: margins.left, right: margins.right, bottom: margins.bottom },
      didDrawPage: () => {
        drawEncabezado();
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
      const x = rightX - labelWidth; // dibujar alineando el borde derecho exactamente al margen
      doc.text(pageLabel, x, yBase + 4);
    }
    doc.save(`MARCACIONES_OBREROS_${fechaDesde}_${fechaHasta}.pdf`);
  }
}
