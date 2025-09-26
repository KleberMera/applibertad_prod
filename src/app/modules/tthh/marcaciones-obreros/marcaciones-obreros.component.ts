import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TthhService } from '@data/services/tthh/tthh.service';
import { Table } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { formatDate } from '@angular/common';
import Swal from 'sweetalert2';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { AuthService } from '@data/services/api/auth.service';

interface EmpleadoFiltro {
  nombre: string;
  cedula: string;
  departamento?: string;
  seleccionado: boolean;
}

@Component({
  selector: 'app-marcaciones-obreros',
  templateUrl: './marcaciones-obreros.component.html',
  styleUrls: ['./marcaciones-obreros.component.scss']
})
export class MarcacionesObrerosComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild('dtEmpleados') dtEmpleados!: Table;
  @ViewChild('buscarInput') buscarInput: any;
  @ViewChild('dialogEmpleados') dialogEmpleados!: Dialog;
  
  marcaciones: any[] = [];
  marcacionesFiltradas: any[] = [];
  empleadosFiltro: EmpleadoFiltro[] = [];
  empleadosFiltroSeleccionados: EmpleadoFiltro[] = [];
  mostrarDialogEmpleados = false;
  private empleadosFiltroOriginal: EmpleadoFiltro[] = [];
  formulario: FormGroup;
  formularioVisible = false;
  loading = false;
  cargandoEmpleados = false;
  filtroAplicado = false;

  constructor(
    private fb: FormBuilder,
    private tthhService: TthhService,
    private authService: AuthService
  ) {
    this.formulario = this.fb.group({
      fecha_desde: [null],
      fecha_hasta: [null]
    });
  }

  // Helper para cargar imagen en base64
  private loadImageBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      fetch(url)
        .then(res => res.blob())
        .then(blob => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    });
  }

  exportarPDFObreros(): void {
    const datos = this.marcacionesFiltradas.length > 0 ? this.marcacionesFiltradas : this.marcaciones;
    if (!datos || datos.length === 0) {
      Swal.fire('Info', 'No hay datos para exportar.', 'info');
      return;
    }

    const formData = this.formulario.value;
    const fechaDesde = formatDate(formData.fecha_desde, 'yyyy-MM-dd', 'en-US');
    const fechaHasta = formatDate(formData.fecha_hasta, 'yyyy-MM-dd', 'en-US');

    const usuarioData = this.authService.getUserFromLocalStorage();
    const usuarioNombre = usuarioData?.username || 'Usuario desconocido';

    this.loadImageBase64('assets/img/logo2.png')
      .then(logo => {
        this.tthhService.generateMarcacionesObrerosPDF(
          datos,
          usuarioNombre,
          fechaDesde,
          fechaHasta,
          logo
        );
      })
      .catch(err => {
        console.error('Error cargando el logo:', err);
        // Si falla el logo, continuar sin él
        this.tthhService.generateMarcacionesObrerosPDF(
          datos,
          usuarioNombre,
          fechaDesde,
          fechaHasta,
          ''
        );
      });
  }

  ngOnInit(): void {
    this.mostrarFormulario();
    // Set default date range to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    this.formulario.patchValue({
      fecha_desde: firstDay,
      fecha_hasta: lastDay
    });
  }

  mostrarFormulario(): void {
    this.formularioVisible = true;
  }

  limpiarFiltros(): void {
    this.formulario.reset();
    this.mostrarDialogEmpleados = false;
    // Limpiar datos de la tabla y estado de filtros
    this.marcaciones = [];
    this.marcacionesFiltradas = [];
    this.filtroAplicado = false;
    // Limpiar filtros de la tabla y paginación
    if (this.dt) {
      if (typeof (this.dt as any).clear === 'function') {
        (this.dt as any).clear();
      }
      this.dt.first = 0;
    }
    // Limpiar cuadro de búsqueda si existe
    if (this.buscarInput && this.buscarInput.nativeElement) {
      this.buscarInput.nativeElement.value = '';
    }
  }

  get todosSeleccionados(): boolean {
    return this.empleadosFiltro.length > 0 && this.empleadosFiltro.every(e => e.seleccionado);
  }

  seleccionarTodos(seleccionar: boolean): void {
    if (seleccionar) {
      // Seleccionar todos los empleados visibles en la página actual
      this.empleadosFiltroSeleccionados = [...this.empleadosFiltro];
      
      // Forzar la actualización de la vista
      if (this.dtEmpleados) {
        this.dtEmpleados.selection = [...this.empleadosFiltroSeleccionados];
      }
    } else {
      // Deseleccionar todos
      this.empleadosFiltroSeleccionados = [];
      if (this.dtEmpleados) {
        this.dtEmpleados.selection = [];
      }
    }
  }

  // Este método ya no es necesario con el binding bidireccional
  // pero lo mantenemos por si hay lógica adicional que dependa de él
  private actualizarSeleccionados(): void {
    // El binding bidireccional se encarga de actualizar empleadosFiltroSeleccionados
  }

  cargarDatos(): void {
    if (this.formulario.invalid) {
      Swal.fire('Error', 'Por favor complete los campos requeridos', 'error');
      return;
    }

    this.loading = true;
    const formData = this.formulario.value;
    
    // Format dates to YYYY-MM-DD
    const fechaDesde = formatDate(formData.fecha_desde, 'yyyy-MM-dd', 'en-US');
    const fechaHasta = formatDate(formData.fecha_hasta, 'yyyy-MM-dd', 'en-US');

    const params = new URLSearchParams();
    params.set('fechaDesde', fechaDesde);
    params.set('fechaHasta', fechaHasta);

    this.tthhService.getResumenMarcaciones(params.toString()).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response && response.data) {
          this.marcaciones = response.data;
          // Reiniciar filtro aplicado al cargar nuevos datos
          this.marcacionesFiltradas = [];
          this.filtroAplicado = false;
          this.cargarListaEmpleados();
          if (this.marcaciones.length === 0) {
            Swal.fire('Información', 'No se encontraron registros para los filtros seleccionados', 'info');
          }
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al cargar las marcaciones:', error);
        Swal.fire('Error', 'Ocurrió un error al cargar las marcaciones', 'error');
      }
    });
  }

  exportarExcel(): void {
    const datosAExportar = this.marcacionesFiltradas.length > 0 ? this.marcacionesFiltradas : this.marcaciones;
    
    if (datosAExportar.length === 0) {
      Swal.fire('Advertencia', 'No hay datos para exportar', 'warning');
      return;
    }

    import('xlsx').then((xlsx) => {
      // Mapear los datos para incluir solo las columnas necesarias en el orden correcto
      const datosParaExportar = datosAExportar.map(marcacion => {
        // Formatear la fecha manualmente para evitar problemas de localización
        const fecha = new Date(marcacion.FECHA);
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        const fechaFormateada = `${dia}/${mes}/${anio}`;
        
        return {
          'FECHA': fechaFormateada,
          'EMPLEADO': marcacion.NOM_EMPLEADO,
          'CÉDULA': marcacion.CEDULA,
          'MARCACIÓN 1': marcacion.MARCACION1 || 'Sin registro',
          'MARCACIÓN 2': marcacion.MARCACION2 || 'Sin registro',
          'MARCACIÓN 3': marcacion.MARCACION3 || 'Sin registro',
          'MARCACIÓN 4': marcacion.MARCACION4 || 'Sin registro',
          'HORA MÍNIMA': marcacion.HORA_MINIMA,
          'HORA MÁXIMA': marcacion.HORA_MAXIMA,
          'DEPARTAMENTO': marcacion.DES_DEPARTAMENTO,
          'CARGO': marcacion.DES_CARGO,
          'TIPO DE ROL': marcacion.DES_TIPO_ROL
        };
      });

      // Crear la hoja de cálculo
      const worksheet = xlsx.utils.json_to_sheet(datosParaExportar, {
        header: [
          'FECHA', 'EMPLEADO', 'CÉDULA', 
          'MARCACIÓN 1', 'MARCACIÓN 2', 'MARCACIÓN 3', 'MARCACIÓN 4',
          'HORA MÍNIMA', 'HORA MÁXIMA', 'DEPARTAMENTO', 'CARGO', 'TIPO DE ROL'
        ]
      });

      // Ajustar el ancho de las columnas
      const columnWidths = [
        { wch: 12 }, // FECHA
        { wch: 30 }, // EMPLEADO
        { wch: 12 }, // CÉDULA
        { wch: 12 }, // MARCACIÓN 1
        { wch: 12 }, // MARCACIÓN 2
        { wch: 12 }, // MARCACIÓN 3
        { wch: 12 }, // MARCACIÓN 4
        { wch: 12 }, // HORA MÍNIMA
        { wch: 12 }, // HORA MÁXIMA
        { wch: 25 }, // DEPARTAMENTO
        { wch: 25 }, // CARGO
        { wch: 20 }  // TIPO DE ROL
      ];
      worksheet['!cols'] = columnWidths;

      // Crear el libro de trabajo
      const workbook = { 
        Sheets: { 'Marcaciones': worksheet }, 
        SheetNames: ['Marcaciones'] 
      };

      // Generar el archivo Excel
      const excelBuffer: any = xlsx.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array',
        bookSST: false,
        cellDates: true,
        cellStyles: true,
      });

      // Generar nombre de archivo con fecha actual
      const ahora = new Date();
      const fechaArchivo = `${ahora.getFullYear()}${String(ahora.getMonth() + 1).padStart(2, '0')}${String(ahora.getDate()).padStart(2, '0')}_${String(ahora.getHours()).padStart(2, '0')}${String(ahora.getMinutes()).padStart(2, '0')}${String(ahora.getSeconds()).padStart(2, '0')}`;
      
      // Guardar el archivo
      this.guardarArchivoExcel(excelBuffer, `marcaciones_obreros_${fechaArchivo}`);
    });
  }

  // Método para filtrar la tabla de manera segura
  filtrarTabla(event: Event): void {
    if (event && event.target) {
      const inputElement = event.target as HTMLInputElement;
      if (inputElement && this.dt) {
        this.dt.filterGlobal(inputElement.value, 'contains');
      }
    }
  }

  cargarListaEmpleados(): void {
    this.cargandoEmpleados = true;
    this.tthhService.getListaEmpleadosFiltro().subscribe({
      next: (resp: any) => {
        this.cargandoEmpleados = false;
        const lista = Array.isArray(resp?.data) ? resp.data : [];
        this.empleadosFiltro = lista.map((e: any) => ({
          nombre: e.NOM_EMPLEADO,
          cedula: e.CEDULA,
          departamento: e.DES_DEPARTAMENTO,
          seleccionado: true,
        })).sort((a: EmpleadoFiltro, b: EmpleadoFiltro) => a.nombre.localeCompare(b.nombre));

        // Guardar copia original para el filtrado
        this.empleadosFiltroOriginal = [...this.empleadosFiltro];

        // Inicializar la selección
        this.empleadosFiltroSeleccionados = [];

        // Seleccionar todos por defecto
        this.seleccionarTodos(true);
      },
      error: (err) => {
        this.cargandoEmpleados = false;
        console.error('Error al cargar lista de empleados:', err);
        Swal.fire('Error', 'No se pudo cargar la lista de empleados para el filtro', 'error');
        // Asegurar estados consistentes
        this.empleadosFiltro = [];
        this.empleadosFiltroOriginal = [];
        this.empleadosFiltroSeleccionados = [];
      }
    });
  }

  abrirDialogoEmpleados(): void {
    this.mostrarDialogEmpleados = true;
  }

  aplicarFiltroEmpleados(): void {
    if (this.empleadosFiltroSeleccionados.length > 0) {
      const cedulasSeleccionadas = this.empleadosFiltroSeleccionados.map(e => e.cedula);
      this.marcacionesFiltradas = this.marcaciones.filter(m =>
        cedulasSeleccionadas.includes(m.CEDULA)
      );
      // Aplicar el estado de filtro incluso si el resultado es vacío
      this.filtroAplicado = true;
    } else {
      // Si no hay empleados seleccionados, quitamos el filtro
      this.marcacionesFiltradas = [];
      this.filtroAplicado = false;
    }

    // Resetear paginación a la primera página para reflejar cambios
    if (this.dt) {
      this.dt.first = 0;
    }

    this.mostrarDialogEmpleados = false;
  }

  filtrarEmpleados(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorBusqueda = input.value.toLowerCase().trim();
    
    if (!valorBusqueda) {
      this.empleadosFiltro = [...this.empleadosFiltroOriginal];
      return;
    }
    
    this.empleadosFiltro = this.empleadosFiltroOriginal.filter(empleado => 
      empleado.nombre.toLowerCase().includes(valorBusqueda) ||
      empleado.cedula.includes(valorBusqueda) ||
      (empleado.departamento && empleado.departamento.toLowerCase().includes(valorBusqueda))
    );
  }

  private guardarArchivoExcel(buffer: any, fileName: string): void {
    import('file-saver').then((FileSaver) => {
      const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
      FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    });
  }

  // Limpiar el filtro aplicado a la tabla
  limpiarFiltroTabla(): void {
    this.marcacionesFiltradas = [];
    this.filtroAplicado = false;
    if (this.dt) {
      this.dt.first = 0;
    }
  }
}
