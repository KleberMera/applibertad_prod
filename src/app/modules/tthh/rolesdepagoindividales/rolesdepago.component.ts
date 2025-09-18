import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Table } from 'primeng/table';
import { API_ROUTES } from '@data/constants/routes';
import Swal from 'sweetalert2';
import { AuthService } from '@data/services/api/auth.service';
import { ComponenteService } from '@data/services/api/componentes/componente.service';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-rolesdepago',
  templateUrl: './rolesdepago.component.html',
  styleUrls: ['./rolesdepago.component.scss']
})
export class RolesdepagoComponent implements OnInit {
  formularioRolPago: FormGroup;
  rolPagos: any[] = [];
  formularioVisible = true;

  cedula: string = '';
  
  currentYear: number = new Date().getFullYear();

  @ViewChild('tbRolPago') tbRolPago!: Table;

  constructor(private componentsService: ComponenteService, private authService: AuthService, private fb: FormBuilder, private http: HttpClient) {
    this.formularioRolPago = this.fb.group({
      periodo: [this.currentYear, [Validators.required, Validators.maxLength(4)]],
    });
    const userDataString = sessionStorage.getItem('currentUserGADMLL');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.cedula = userData.CEDULA;
    }
  }

  ngOnInit(): void {
    // No es necesario llamar a obtenerDatosUsuario ya que la cédula está fija
  }

  loadDataRolPago() {
    const periodo = this.formularioRolPago.get('periodo')?.value;

    if (!periodo) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Debe ingresar un período para consultar el rol de pago.',
        confirmButtonText: 'Aceptar'
      });
      this.ocultarFormulario2();
      return;
    }

    Swal.fire({
      title: 'Consultando datos...',
      text: 'Por favor, espere un momento.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const body = new HttpParams()
      .set('cedula', this.cedula)
      .set('periodo', periodo);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    this.http.post<any>(API_ROUTES.TTHH.ROLES, body.toString(), { headers }).subscribe({
      next: (res) => {
        Swal.close();

        if (!res.error && res.data?.length > 0) {
          this.rolPagos = res.data;
          //console.log('Datos de rol de pago:', this.rolPagos);
        } else {
          this.rolPagos = [];
          this.ocultarFormulario2();
          Swal.fire({
            icon: 'info',
            title: 'Sin resultados',
            text: 'No se encontraron registros para el período seleccionado.',
            confirmButtonText: 'Aceptar'
          });
        }
      },
      error: (err) => {
        Swal.close();
        console.error('Error al consultar rol de pago:', err);
        this.rolPagos = [];
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No existen roles de pago para el periodo indicado',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  verDetalle(rol: any) {
    const urlCabecera = API_ROUTES.TTHH.ROLESCABECERA;
    const urlDetalle = API_ROUTES.TTHH.ROLESDETALLE;
    const codigo = `${rol.PERIODO}${rol.CODIGO.trim()}`;
  
    const body = new HttpParams().set('codigo', codigo);
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    this.componentsService.showLoading('Cargando rol de pago...');
  
    this.http.post<any>(urlCabecera, body.toString(), { headers }).subscribe({
      next: (resCabecera) => {
        let agrupados: any = {};
        let tablaDetalleHTML = '';
        if (!resCabecera.error && resCabecera.data?.length > 0) {
          const item = resCabecera.data[0];
  
          this.http.post<any>(urlDetalle, body.toString(), { headers }).subscribe({
            next: (resDetalle) => {
              Swal.close();
              // let tablaDetalleHTML = '';
              if (!resDetalle.error && resDetalle.data?.length > 0) {
                // Agrupar y sumar valores por DES_CONCEPTO
                agrupados = resDetalle.data.reduce((acc: any, item: any) => {
                  const concepto = item.DES_CONCEPTO.trim();
                  // Procesar: remover comas para el cálculo
                  const valor = parseFloat(item.VALOR.trim().replace(/,/g, ''));
                  if (!acc[concepto]) {
                    acc[concepto] = 0;
                  }
                  acc[concepto] += valor;
                  return acc;
                }, {});
                
                // Generar las filas con formato de comas
                const filas = Object.entries(agrupados).map(([concepto, valor]) => {
                  const numValor = Number(valor);
                  const isTotal = concepto.toUpperCase().includes('TOTAL');
                  // Formatear el número con comas para mostrar
                  const valorFormateado = numValor.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  });
                  
                  return `
                    <tr>
                      <td style="
                        border: 1px solid #000;
                        padding: 4px 8px;
                        text-align: ${isTotal ? 'right' : 'left'};
                        ${isTotal ? 'font-weight: bold;' : ''}
                      ">${concepto}</td>
                      <td style="
                        border: 1px solid #000;
                        padding: 4px 8px;
                        text-align: right;
                        ${isTotal ? 'font-weight: bold;' : ''}
                      ">${valorFormateado}</td>
                    </tr>
                  `;
                }).join('');                          
                
                tablaDetalleHTML = `
                  <table style="
                    width: 80%;
                    margin: 20px auto;
                    border-collapse: collapse;
                    font-size: 13px;
                  ">
                    <thead>
                      <tr>
                        <th style="border: 1px solid #000; padding: 6px 10px; text-align: center;">RUBRO</th>
                        <th style="border: 1px solid #000; padding: 6px 10px; text-align: center;">VALOR</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${filas}
                    </tbody>
                  </table>
                `;

              }
  
              const html = `
                <style>
                  .swal-btn {
                    min-width: 120px;
                    display: inline-flex !important;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    font-size: 14px;
                  }

                  .swal-btn-confirm {
                    background-color: #3085d6 !important; /* azul estándar */
                  }

                  .swal-btn-cancel {
                    background-color: #d33 !important;    /* rojo */
                    color: white !important;
                  }

                  .documento-container {
                    position: relative;
                    overflow: hidden;
                  }

                  .marca-agua {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    font-size: 32px;
                    color: rgba(200, 0, 0, 0.15);
                    transform: translate(-50%, -50%) rotate(-30deg);
                    pointer-events: none;
                    z-index: 1;
                    user-select: none;
                    white-space: nowrap;
                    font-weight: bold;
                  }

                  .contenido-documento {
                    position: relative;
                    z-index: 2;
                  }

                  @media screen and (max-width: 750px) {
                    table {
                      width: 100% !important;
                      font-size: 12px !important;
                    }

                    table td, table th {
                      padding: 4px !important;
                    }

                    h4 {
                      font-size: 14px !important;
                    }

                    .swal2-html-container {
                      padding: 0 !important;
                    }

                    .marca-agua {
                      font-size: 24px !important;
                    }
                  }

                </style>
                <div class="documento-container" style="font-family: 'Arial', sans-serif; font-size: 13px;">
                  <div class="marca-agua">DOCUMENTO NO CERTIFICADO</div>
                  <div class="contenido-documento">
                    <h4 style="text-align: center; margin-bottom: 0;"><strong>DIRECCIÓN DE TALENTO HUMANO</strong></h4>
                    <h4 style="text-align: center; margin-top: 4px;"><strong>ROL DE PAGO INDIVIDUAL</strong></h4>
    
                    <div style="text-align: center">
                      <table style="width: 80%; border-collapse: collapse; margin: 15px auto 0 auto;">
                        <tr>
                          <td style="text-align: left; border: 1px solid #000; padding: 6px;"><strong>PERÍODO</strong></td>
                          <td style="text-align: left; border: 1px solid #000; padding: 6px;">${item.MES}</td>
                          <td style="text-align: left; border: 1px solid #000; padding: 6px;"><strong>CEDULA</strong></td>
                          <td style="text-align: left; border: 1px solid #000; padding: 6px;">${item.CEDULA}</td>
                        </tr>
                        <tr>
                          <td style="text-align: left; border: 1px solid #000; padding: 6px;"><strong>DEPARTAMENTO</strong></td>
                          <td colspan="3" style="text-align: left; border: 1px solid #000; padding: 6px;">${item.DEPARTAMENTO}</td>
                        </tr>
                        <tr>
                          <td style="text-align: left; border: 1px solid #000; padding: 6px;"><strong>FUNCIONARIO</strong></td>
                          <td colspan="3" style="text-align: left; border: 1px solid #000; padding: 6px;">${item.EMPLEADO}</td>
                        </tr>
                      </table>
                    </div>

                    <div style="text-align: center">
                      ${tablaDetalleHTML}
                      <p><strong>Le recordamos que puede obtener su rol certificado acercándose a la Dirección de Talento Humano.</strong></p>
                    </div>
                  </div>
                </div>
              `;
  
              Swal.fire({
                title: '',
                html,
                width: '700px',
                showCloseButton: true,
                showCancelButton: false,
                showConfirmButton: true,
                confirmButtonText: '<i class="fas fa-times"></i> Cerrar',
                // cancelButtonText: '<i class="fas fa-file-pdf"></i> Imprimir',
                reverseButtons: true,
                customClass: {
                  confirmButton: 'swal-btn swal-btn-confirm',
                  // cancelButton: 'swal-btn swal-btn-cancel'
                },
                scrollbarPadding: false,
              }).then((result) => {
                if (result.dismiss === Swal.DismissReason.cancel) {
                  this.generarPDF(item, agrupados);
                }
              });              
              
            },
            error: () => {
              Swal.fire('Error', 'No se pudo obtener el detalle del rol.', 'error');
            }
          });
        } else {
          Swal.fire('Sin datos', 'No se encontró cabecera del rol.', 'info');
        }
      },
      error: () => {
        Swal.fire('Error', 'No se pudo obtener la cabecera del rol.', 'error');
      }
    });
  }

  generarPDF(item: any, data: Record<string, number>) {
      const doc = new jsPDF();
    
      // Configuración de página
      const pageWidth = doc.internal.pageSize.width;
      const margin = 15;
      const tableWidth = pageWidth - (margin * 2);
    
      // Agregar logo
      try {
        const logoWidth = 60;
        const logoHeight = 20;
        const logoX = margin;
        const logoY = 10;
        
        doc.addImage('assets/img/logo2.png', 'PNG', logoX, logoY, logoWidth, logoHeight);
      } catch (error) {
        console.warn('No se pudo cargar el logo:', error);
      }
    
      // Título principal centrado (posicionado después del logo)
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DIRECCIÓN DE TALENTO HUMANO', pageWidth / 2, 35, { align: 'center' });
      doc.text('ROL DE PAGO INDIVIDUAL', pageWidth / 2, 43, { align: 'center' });
    
      // Tabla de información del encabezado
      const headerData = [
        ['PERÍODO', item.MES || '', 'CEDULA', item.CEDULA || ''],
        [
          { content: 'DEPARTAMENTO', styles: { fontStyle: 'bold' as const, fillColor: [240, 240, 240] as [number, number, number] } },
          { content: item.DEPARTAMENTO || '', colSpan: 3 },
        ],
        [
          { content: 'FUNCIONARIO', styles: { fontStyle: 'bold' as const, fillColor: [240, 240, 240] as [number, number, number] } },
          { content: item.EMPLEADO || '', colSpan: 3 }
        ],
      ];
    
      autoTable(doc, {
        startY: 50,
        body: headerData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.5
        },
        columnStyles: {
          0: { //PERIODO
            fontStyle: 'bold',
            fillColor: [240, 240, 240],
            cellWidth: tableWidth * 0.22
          },
          1: { //DATO PERIODO
            cellWidth: tableWidth * 0.25
          },
          2: { //CEDULA
            fontStyle: 'bold',
            fillColor: [240, 240, 240],
            cellWidth: tableWidth * 0.23
          },
          3: { //DATO CEDULA
            cellWidth: tableWidth * 0.30
          },
          4: { //DPTO
            fontStyle: 'bold',
            fillColor: [240, 240, 240],
            cellWidth: tableWidth * 0.22
          },
          5: { // DATO DPTO
            cellWidth: tableWidth * 0.18
          },
          6: { // FUNCIONARIO
            fontStyle: 'bold',
            fillColor: [240, 240, 240],
            cellWidth: tableWidth * 0.22
          },
          7: { //DATO FUNCIONARIO
            cellWidth: tableWidth * 0.18
          },
  
        },
        didParseCell: function(data) {
          // Ocultar celdas vacías en la segunda fila
          if (data.row.index === 1 && (data.column.index === 2 || data.column.index === 3)) {
            data.cell.styles.lineColor = [255, 255, 255];
            data.cell.text = [];
          }
        }
      });
    
      // Preparar datos de la tabla principal dinámicamente
      const tableData: (string | { content: string; colSpan?: number; styles?: any })[][] = [];
      let currentY = (doc as any).lastAutoTable.finalY + 10;
    
      // Convertir los datos agrupados en filas de tabla
      Object.entries(data).forEach(([concepto, valor]) => {
        const numValor = Number(valor);
        const isTotal = concepto.toUpperCase().includes('TOTAL');
        const isLiquidoRecibir = concepto.toUpperCase().includes('LIQUIDO') && concepto.toUpperCase().includes('RECIBIR');
        
        if (isTotal) {
          // Filas de totales con formato especial
          tableData.push([
            { 
              content: concepto, 
              styles: { 
                fontStyle: 'bold' as const, 
                halign: 'right' as const,
                fillColor: [240, 240, 240] as [number, number, number]
              } 
            },
            { 
              content: numValor.toFixed(2), 
              styles: { 
                fontStyle: 'bold' as const, 
                halign: 'right' as const,
                fillColor: [240, 240, 240] as [number, number, number]
              } 
            }
          ]);
        } else if (isLiquidoRecibir) {
          // Líquido a recibir con fondo especial
          tableData.push([
            { 
              content: concepto, 
              styles: { 
                fontStyle: 'bold' as const,
                fillColor: [220, 220, 220] as [number, number, number]
              } 
            },
            { 
              content: numValor.toFixed(2), 
              styles: { 
                fontStyle: 'bold' as const, 
                halign: 'right' as const,
                fillColor: [220, 220, 220] as [number, number, number]
              } 
            }
          ]);
        } else {
          // Filas normales
          tableData.push([concepto, numValor.toFixed(2)]);
        }
      });
    
      // Crear la tabla principal
      autoTable(doc, {
        startY: currentY,
        head: [['RUBRO', 'VALOR']],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: { top: 2, right: 4, bottom: 2, left: 4 },
          lineColor: [0, 0, 0],
          lineWidth: 0.5
        },
        headStyles: {
          fillColor: [200, 200, 200],
          textColor: [0, 0, 0],
          cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { 
            cellWidth: tableWidth * 0.70,
            halign: 'left',
          },
          1: { 
            cellWidth: tableWidth * 0.30,
            halign: 'right',
          }
        }
      });
    
      // Guardar PDF
      const nombreArchivo = `rol_${item.MES}_${item.EMPLEADO ? item.EMPLEADO.replace(/\s+/g, '_') : 'empleado'}.pdf`;
      doc.save(nombreArchivo);
    }

  ocultarFormulario2() {
    this.tbRolPago.reset() ;
    this.rolPagos = [];
  }

  resetearConsulta() {
    this.formularioRolPago.reset();
    this.rolPagos = [];
  }
}
