import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sol-inspeccion',
  templateUrl: './sol-inspeccion.component.html',
  styleUrls: ['./sol-inspeccion.component.scss']
})
export class SolInspeccionComponent implements OnInit {
  inspeccionForm: FormGroup;
  inspecciones: any[] = []; // Para mostrar los datos en la tabla
  datos: any[] = [];
  globalFilter: string = ''; 

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.inspeccionForm = this.fb.group({
      date_start: [''],
      inspector: [''],
      arrendatario: ['']
    });
  }

  ngOnInit(): void {}

  ocultarFormulario2(): void {
    // this.formularioVisible2 = false;
    // this.formularioVisible = false;
    this.inspeccionForm.reset();
    this.inspecciones = [];
    //this.tbhistorial.clearGlobalFilter()
  }

  buscar() {
    const formData = this.inspeccionForm.value;

    // Limpiar los datos antes de la búsqueda
    this.inspecciones = [];
    this.datos = [];
  
    // Formatear la fecha a yyyy-mm-dd
    const fecha = formData.date_start ? new Date(formData.date_start).toISOString().split('T')[0] : '';
    const inspector = formData.inspector ? formData.inspector : '';
    const arrendatario = formData.arrendatario ? formData.arrendatario : '';
  
    // Convertimos los datos a formato x-www-form-urlencoded
    const body = new HttpParams()
      .set('fecha', fecha)  // Usamos la fecha ya formateada
      .set('inspector', formData.inspector)
      .set('arrendatario', formData.arrendatario);

    // Si no se proporciona fecha, inspector o arrendatario, no los enviamos
    const isAnyFilterSet = fecha || inspector || arrendatario;
    
    // Si no hay filtros establecidos, no enviamos esos parámetros
    let requestBody = body;
    if (!isAnyFilterSet) {
      requestBody = new HttpParams(); // Realizamos la consulta sin filtros
    }
  
    // Definir headers adecuados para x-www-form-urlencoded
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
  
    // Realizar la petición POST
    this.http.post('https://www.lalibertad.gob.ec/wsLibertad_v2/api/rentas/solicitudRecorrido/', body.toString(), { headers })
    // this.http.post('http://120.40.73.73:8080/wsLibertad_v2/api/rentas/solicitudRecorrido/', body.toString(), { headers })
    .subscribe((response: any) => {
      if (response.data && response.data.length > 0) {
        this.inspecciones = response.data; // Guardamos los resultados en la tabla
        this.datos = response.data;
      } else {
        // Si no hay datos, mostramos el mensaje con Swal.fire
        Swal.fire({
          icon: 'warning',
          title: 'Sin resultados',
          text: 'No se encontraron registros con los valores proporcionados.',
        });
      }
    }, error => {
      console.error('Error en la petición:', error);
      // En caso de error también mostramos un mensaje
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al realizar la consulta.',
      });
    });
  }

  generarPDF() {
    const doc = new jsPDF('landscape', 'mm', 'a4');

    // Obtener inspector del primer dato (si hay datos)
    let inspector: string = this.datos.length > 0 ? this.datos[0].INSPECTOR : 'inspector';
    const fechaHoy = new Date().toISOString().slice(0, 10);

    // Opcional: limpiar espacios o caracteres no válidos en nombres de archivo
    inspector = inspector.trim().replace(/\s+/g, '_').replace(/[^\w\-]/g, '');

    autoTable(doc, {
      head: [['Dirección', 'Estado', 'Inspector', 'Arrendatario', 'Fecha', 'Razón', 'Cédula', 'Obs.', 'Código Catastral', 'Asigna']],
      body: this.datos.map(d => [
        d.DIRECCION, d.ESTADO, d.INSPECTOR, d.ARRENDATARIO, d.FECHA,
        d.RAZON, d.CEDULA, d.OBSERVACION, d.CODIGO_CATASTRAL, d.ASIGNA
      ]),
      columnStyles: {
        1: { cellWidth: 20 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
        8: { cellWidth: 30 }
      }
    });

    doc.save(`Reporte_Solicitudes_de_${inspector}_al_${fechaHoy}.pdf`);
  }

  // generarExcel() {
  //   const ws = XLSX.utils.json_to_sheet(this.datos);
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

  //   const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  //   const data = new Blob([excelBuffer], { type: 'application/octet-stream' });

  //   saveAs(data, 'Reporte_Solicitudes.xlsx');
  // }

  // Función que se llama para aplicar el filtro global
  applyFilterGlobal(event: any) {
    const filterValue = event.target.value.toLowerCase();
    
    // Filtrar las inspecciones según el valor ingresado en el campo de búsqueda
    this.inspecciones = this.inspecciones.filter(inspeccion => {
      // Revisar si alguna de las propiedades del objeto inspección contiene el valor del filtro
      return Object.keys(inspeccion).some(key =>
        inspeccion[key] && inspeccion[key].toString().toLowerCase().includes(filterValue)
      );
    });
  }
}
