import { Component } from '@angular/core';
import { IngresoEmpleadosService } from '@data/services/api/insert/employees.service';
import { Papa } from 'ngx-papaparse';

@Component({
  selector: 'app-ingreso-empleados',
  templateUrl: './ingreso-empleados.component.html',
  styleUrl: './ingreso-empleados.component.scss'
})
export class IngresoEmpleadosComponent {

  
  data: any[] = [];
  cols: any[] = [];
  uploadedFiles: any[] = [];

  constructor(private papa: Papa,
              private ingresoEmpleadosService: IngresoEmpleadosService
            ) {}

  onFileChange(event: any) {
    this.uploadedFiles = event.files;
    if (this.uploadedFiles && this.uploadedFiles.length > 0) {
      const file = this.uploadedFiles[0];
      this.parseCSV(file);
    }
  }

  parseCSV(file: File) {
    this.papa.parse(file, {
      header: true,
      complete: (result) => {
        this.data = result.data.map((row: any) => {
          // Agregar espacios en blanco a la columna 'ID' para completar 10 caracteres
          const id = row['ID'].toString().padStart(10, ' ');
  
          // Función para formatear la fecha al formato YYYY-MM-DD
          const formatDate = (dateString: string | undefined | null): string | null => {
            if (!dateString || dateString.trim() === '') {
                return null; // Si la fecha está vacía, retornar null
            }
            const parts = dateString.split('/');
            if (parts.length !== 3 || isNaN(parseInt(parts[0])) || isNaN(parseInt(parts[1])) || isNaN(parseInt(parts[2]))) {
                return null; // Si el formato de la fecha no es válido, retornar null
            }
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
          };

          // Aplicar la función formatDate a los campos de fecha
          const fechaNacFormatted = formatDate(row['FECHA_NAC']);
          const desdeFormatted = formatDate(row['DESDE']);
          const hastaFormatted = formatDate(row['HASTA']);
          const bajaFormatted = formatDate(row['BAJA']);
  
          return { 
            ...row, 
            ID: id, 
            FECHA_NAC: fechaNacFormatted, 
            DESDE: desdeFormatted, 
            HASTA: hastaFormatted, 
            BAJA: bajaFormatted 
          };
        });
  
        // Definir las columnas de la tabla
        this.cols = [
          { header: 'ID', field: 'ID' },
          { header: 'Cédula', field: 'CEDULA' },
          { header: 'Nombres', field: 'NOMBRES' },
          { header: 'Código', field: 'CODIGO' },
          { header: 'Rol', field: 'ROL' },
          { header: 'Cargo', field: 'CARGO' },
          { header: 'Departamento', field: 'DEPARTAMENTO' },
          { header: 'Sexo', field: 'SEXO' },
          { header: 'Fecha de Nacimiento', field: 'FECHA_NAC' },
          { header: 'Edad', field: 'EDAD' },
          { header: 'Desde', field: 'DESDE' },
          { header: 'Hasta', field: 'HASTA' },
          { header: 'Baja', field: 'BAJA' },
          { header: 'Estado', field: 'ESTADO' },
          { header: 'Teléfonos', field: 'TELEFONOS' },
          { header: 'Correo', field: 'CORREO' },
          { header: 'Dirección', field: 'DIRECCION' },
          { header: 'Estado Civil', field: 'DES_ESTADO_CIVIL' },
          { header: 'Título', field: 'DES_TITULO' }
        ];
      }
    });
  }
  

  // uploadDataToServer() {
    
  //   // Aquí llamamos al método del servicio para enviar los datos al servidor
  //   // Debes implementar este método en tu servicio IngresoEmpleadosService
  //   this.ingresoEmpleadosService.uploadData(data).subscribe(response => {
  //     // Aquí puedes manejar la respuesta del servidor si es necesario
  //     console.log(response);
  //   });
  // }

  
  


  saveDataAsJson() {
    // Convierte los datos a JSON antes de enviarlos al servicio
    const jsonData = JSON.stringify(this.data);
    //console.log(jsonData); // Muestra los datos en formato JSON en la consola
  
    // Llama al método uploadData del servicio para enviar los datos
    this.ingresoEmpleadosService.uploadData(jsonData).subscribe(response => {
      // Maneja la respuesta del servicio si es necesario
      //console.log(response);
    });
  }
  
}