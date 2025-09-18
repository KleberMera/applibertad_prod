import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RolesService } from '@data/services/admin/roles.service';
import { UsersService } from '@data/services/admin/users.service';
import { Table } from 'primeng/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tramite-interno',
  templateUrl: './tramite-interno.component.html',
  styleUrl: './tramite-interno.component.scss',
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
export class TramiteInternoComponent {
  @ViewChild('tbUsuarios') tbusuarios!: Table; // Añade @ViewChild para obtener la referencia a la tabla
      //@ViewChild('usernameInput') usernameInput!: ElementRef;

      // Para que funcione el Object.entries en el template
    Object = Object;
        
      usuarios: any[] = [];
      roles: any[] = [];
      errorMessage = '';
    
      cedulaSearchValue: string = '';
      
      formularioUsuarios!: FormGroup; // Propiedad para el formulario
      formularioVisible: boolean = false;
      formularioVisible2 : boolean = false;
    
      clienteIdEditando: number | null = null; // Propiedad para almacenar el ID del estado en edición
  
      fechaActual: Date = new Date();
  
      tiposFijos = [
        { label: 'ALCALDIA', value: 'ALCALDIA' },
        { label: 'COORDINACIÓN DE RECURSOS Y SISTEMAS TECNOLÓGICOS', value: 'COORDINACIÓN DE RECURSOS Y SISTEMAS TECNOLÓGICOS' }
      ];
     
      tiposFijosJefes = [
        { label: 'JEAN CASTILLO', value: 'JEAN_CASTILLO' },
        { label: 'JOHN REYES', value: 'JOHN_REYES' }
      ];

      // Agregar propiedades para almacenar los archivos
      imagenesSeleccionadas: { [key: number]: File } = {};
     
      constructor(
        private fb: FormBuilder,
        private rolesService: RolesService,
        private usersService: UsersService,
        private http: HttpClient
        //private renderer: Renderer2
        //private clienteService: ClientesService,
        // private departamentosService: DepartamentosService
        //private insertEstadoService : InsertEstadosService
      ) { }
    
    
      ngOnInit(): void {
    
            
        this.formularioUsuarios = this.fb.group({
          cedula_search: [''],
          personId : ['', Validators.required],  // Campo de id de persona MAEPER
          cedula: ['', Validators.required],  // Campo de cedula requerido
          nombre: ['', Validators.required],  // Campo de nombre requerido
          cargo: ['', Validators.required],  // Campo de cargo requerido
          departamento: ['', Validators.required],  // Campo de departamento requerido
          username: ['', Validators.required],  // Campo de usuario requerido
          // roleid: ['', Validators.required], // Campo de roleid requerido
          password: ['', Validators.required],  // Campo de contraseña requerido
          tipo: [null],
          tipo_jefe: [null],
          tipo2: [null],          // Segundo dropdown "Departamento"
          tipo_jefe2: [null], 
        });
        // this.obtenerUsuarios();
        
        //Carga los roles desde el servicio
         this.rolesService.getRolesShort().subscribe(
          response => {
            if (!response.error) {
              this.roles = response.data;
            } else {
              this.errorMessage = response.msg;
            }
          },
          error => {
            this.errorMessage = 'Error en la solicitud: ' + error.message;
          }
        );
        
        this.formularioUsuarios.get('asunto')?.setValue(this.fechaActual);

        this.formularioUsuarios.get('tipo')?.valueChanges.subscribe((nuevoValor) => {
          this.formularioUsuarios.patchValue({
            tipo2: nuevoValor
          });
        });
      
        this.formularioUsuarios.get('tipo_jefe')?.valueChanges.subscribe((nuevoValor) => {
          this.formularioUsuarios.patchValue({
            tipo_jefe2: nuevoValor
          });
        });
      }
    
    
      obtenerClientes(): void {
        // this.clienteService.getClientes().subscribe(r => {
        //   if (!r.error) {
        //     this.clientes = r.data.clientes;
        //     //console.log(r.data.clientes);
        //   }
        // });
      }
   
    
      mostrarFormulario(): void {
        this.formularioVisible = true;
        this.formularioVisible2 = false;
        this.usuarios = [];
      }
    
      mostrarFormulario2(): void {
        this.formularioVisible2 = true;
        this.formularioVisible = false;
        this.formularioUsuarios.reset();
        this.usuarios = [];
        this.loadUsuarios();
      }
    
    
      loadUsuarios(): void {
        this.usersService.getUsersRoles().subscribe({
          next: (response) => {
            if (response.error) {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: response.msg,
                confirmButtonText: 'Ok'
              });
            } else {
              this.usuarios = response.data;
              //console.log(this.usuarios);
            }
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error de red',
              text: 'No se pudo conectar con el servidor.',
              confirmButtonText: 'Ok'
            });
            console.error('Error en la solicitud HTTP:', err);
          }
        });
      }
      // loadUsuarios(): void {
      //   this.usersService.getAllUsers().subscribe({
      //     next: (response) => {
      //       if (response.error) {
      //         Swal.fire({
      //           icon: 'error',
      //           title: 'Error!',
      //           text: response.msg,
      //           confirmButtonText: 'Ok'
      //         });
      //       } else {
      //         this.usuarios = response.data;
      //         console.log(this.usuarios);
      //       }
      //     },
      //     error: (err) => {
      //       Swal.fire({
      //         icon: 'error',
      //         title: 'Error de red',
      //         text: 'No se pudo conectar con el servidor.',
      //         confirmButtonText: 'Ok'
      //       });
      //       console.error('Error en la solicitud HTTP:', err);
      //     }
      //   });
      // }
    
      ocultarFormulario(): void {
        this.formularioVisible = false;
        this.formularioUsuarios.reset();
        this.clienteIdEditando = null;
      }
    
      ocultarFormulario2(): void {
        this.formularioVisible2 = false;
        this.formularioVisible = false;
        this.formularioUsuarios.reset();
        this.clienteIdEditando = null;
      }
    
    
      applyFilterGlobal(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement) {
          const filterValue = inputElement.value;
          this.tbusuarios.filterGlobal(filterValue, 'contains');
        }
      }
    
    
    
      usuarioByCed(): void {
        const cedula = this.formularioUsuarios.get('cedula_search')?.value;
    
        if (cedula) {
          Swal.fire({
            title: 'Consultando datos...',
            text: 'Por favor, espere un momento.',
            icon: 'info',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });
    
          this.usersService.getUserDataByCedula(cedula).subscribe(r => {
            Swal.close();
            //console.log("datos recibidos", r.data);
            if (!r.error && r.data) {
    
              const nombreCompleto = r.data[0].NOMBRE.trim();
              const nombres = nombreCompleto.split(' ');
              const primerNombre = nombres[nombres.length - 2]; // Último nombre
              const segundoNombre = nombres[nombres.length - 1]; // Segundo nombre
              const primerApellido = nombres[0]; // Primer apellido
              const segundoApellido = nombres[1]; // Segundo apellido
    
              //console.log(nombreCompleto);
              //console.log(nombres);
              //console.log(primerNombre);
              //console.log(segundoNombre);
              //console.log(primerApellido);
              //console.log(segundoApellido);
              
              const sugerenciaUsername = `${primerNombre[0].toLowerCase()}${segundoNombre[0].toLowerCase()}${primerApellido.toLowerCase()}${segundoApellido[0].toLowerCase()}`;
      
         
              // Asume que los datos recibidos son del tipo { nombre: string, departamento: string, cargo: string }
              this.formularioUsuarios.patchValue({
                personId: r.data[0].ID,
                cedula: r.data[0].CEDULA,
                nombre: r.data[0].NOMBRE,
                departamento: r.data[0].DEPARTAMENTO,
                cargo: r.data[0].CARGO,
                username : sugerenciaUsername
              });
              //this.usernameInput.nativeElement.focus();
              //Swal.fire('Datos cargados', 'Datos cargados correctamente', 'success');
            } else {
              Swal.fire('Error', r.msg || 'No se encontraron datos para la cédula ingresada', 'error');
            }
          });

        } else {
          Swal.fire('Error', 'Debe ingresar la cédula para realizar la búsqueda', 'error');
        }
      
      }
    
    
      // Método principal para guardar archivos (con progreso visual)
      async guardarUsuario(): Promise<void> {
        const totalArchivos = Object.keys(this.imagenesSeleccionadas).length;
        
        if (totalArchivos === 0) {
          Swal.fire('Info', 'No hay archivos para subir', 'info');
          return;
        }

        // Mostrar SweetAlert con progreso personalizado
        Swal.fire({
          title: 'Subiendo archivos',
          html: this.generarHTMLProgreso(totalArchivos),
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Subir los archivos
        const archivosSubidos = await this.subirImagenesConProgreso();
        
        if (archivosSubidos) {
          Swal.fire('¡Éxito!', 'Todos los archivos se subieron correctamente', 'success').then(() => {
            this.formularioUsuarios.reset();
            this.imagenesSeleccionadas = {};
          });
        }
      }
      
      // Generar HTML de progreso actualizado para archivos
      private generarHTMLProgreso(totalArchivos: number): string {
        let html = '<div style="text-align: left; margin: 20px 0;">';
        
        for (const [numeroImagen, archivo] of Object.entries(this.imagenesSeleccionadas)) {
          const nombreArchivo = (archivo as File).name;
          const labelImagen = this.obtenerLabelArchivo(parseInt(numeroImagen));
          
          html += `
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="font-weight: bold;">${labelImagen}</span>
                <span id="status-${numeroImagen}" style="color: #666;">Esperando...</span>
              </div>
              <div style="font-size: 12px; color: #888; margin-bottom: 5px;">${nombreArchivo}</div>
              <div style="background-color: #f0f0f0; border-radius: 10px; overflow: hidden; height: 20px;">
                <div id="progress-${numeroImagen}" style="background-color: #3085d6; height: 100%; width: 0%; transition: width 0.3s; border-radius: 10px;"></div>
              </div>
              <div style="text-align: center; font-size: 12px; margin-top: 2px;">
                <span id="percent-${numeroImagen}">0%</span>
              </div>
            </div>
          `;
        }
        
        html += '</div>';
        return html;
      }

      // Labels actualizados para manejar diferentes tipos de archivo
      private obtenerLabelArchivo(numeroImagen: number): string {
        const labels: { [key: string]: string } = {
          '1': '📄 Cédula',
          '2': '📋 Oficio (PDF)', 
          '3': '📸 Evidencia',
          '4': '📎 Otros'
        };
        return labels[numeroImagen.toString()] || `Archivo ${numeroImagen}`;
      }

      // 7. Método para limpiar un archivo específico
      limpiarArchivo(numeroImagen: number): void {
        if (this.imagenesSeleccionadas[numeroImagen]) {
          delete this.imagenesSeleccionadas[numeroImagen];
          //console.log(`Archivo ${numeroImagen} eliminado`);
          
          // Resetear el input file correspondiente si es necesario
          const fileInput = document.querySelector(`input[name="imagen${numeroImagen}"]`) as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        }
      }

      // 8. Método para obtener información de archivos seleccionados
      obtenerResumenArchivos(): string {
        const archivos = Object.entries(this.imagenesSeleccionadas);
        if (archivos.length === 0) {
          return 'No hay archivos seleccionados';
        }
        
        return archivos.map(([numero, archivo]) => {
          const file = archivo as File;
          const label = this.obtenerLabelArchivo(parseInt(numero));
          const size = (file.size / 1024 / 1024).toFixed(2);
          return `${label}: ${file.name} (${size}MB)`;
        }).join('\n');
      }

      private validarTipoArchivo(file: File, numeroImagen: number): boolean {
        const tiposPermitidos: { [key: number]: string[] } = {
          1: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], // Cédula - solo imágenes
          2: ['application/pdf'], // Oficio - solo PDF
          3: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], // Evidencia - solo imágenes
          4: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'] // Otros - imágenes y PDF
        };
      
        const tiposValidos = tiposPermitidos[numeroImagen] || [];
        const esValido = tiposValidos.includes(file.type);
      
        // Validación adicional por extensión como fallback
        if (!esValido) {
          const extension = file.name.split('.').pop()?.toLowerCase();
          const extensionesValidas: { [key: number]: string[] } = {
            1: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            2: ['pdf'],
            3: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            4: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf']
          };
          
          const extensionesPermitidas = extensionesValidas[numeroImagen] || [];
          return extensionesPermitidas.includes(extension || '');
        }
      
        return esValido;
      }

      // 3. Validar tamaño de archivo
      private validarTamanoArchivo(file: File, numeroImagen: number): boolean {
        // Límites de tamaño en bytes (10MB para PDFs, 5MB para imágenes)
        const limitesSize: { [key: number]: number } = {
          1: 5 * 1024 * 1024,  // 5MB para imágenes
          2: 10 * 1024 * 1024, // 10MB para PDFs
          3: 5 * 1024 * 1024,  // 5MB para imágenes
          4: 10 * 1024 * 1024  // 10MB para archivos mixtos
        };

        const limiteSize = limitesSize[numeroImagen] || 5 * 1024 * 1024;
        return file.size <= limiteSize;
      }

      private async subirImagenesConProgreso(): Promise<boolean> {
        const promesasSubida = [];
        
        // Iterar sobre todas las imágenes seleccionadas
        for (const [numeroImagen, archivo] of Object.entries(this.imagenesSeleccionadas)) {
          if (archivo) {
            // Actualizar status a "Subiendo..."
            this.actualizarEstadoImagen(parseInt(numeroImagen), 'Subiendo...', '#ff9800');
            
            const promesa = this.subirImagenConProgreso(archivo as File, parseInt(numeroImagen));
            promesasSubida.push(promesa);
          }
        }
      
        try {
          await Promise.all(promesasSubida);
          return true;
        } catch (error) {
          console.error('Error subiendo imágenes:', error);
          Swal.fire('Error', 'Error al subir las imágenes', 'error');
          return false;
        }
      }

      private subirImagenConProgreso(file: File, numeroImagen: number): Promise<any> {
        return new Promise((resolve, reject) => {
          const formData = new FormData();
          
          // Determinar la carpeta según el tipo de archivo
          const extension = file.name.split('.').pop()?.toLowerCase();
          const carpeta = extension === 'pdf' ? 'Documents' : 'Photos';
          const path = `${carpeta}/${numeroImagen}_${file.name}`;
          
          formData.append('file', file);
          formData.append('path', path);
      
          this.http.post('http://120.40.73.66:3000/api/upload', formData, {
            reportProgress: true,
            observe: 'events'
          }).subscribe({
            next: (event) => {
              if (event.type === HttpEventType.UploadProgress) {
                const percentDone = Math.round(100 * event.loaded / (event.total ?? 1));
                this.actualizarProgresoImagen(numeroImagen, percentDone);
              } else if (event.type === HttpEventType.Response) {
                this.actualizarEstadoImagen(numeroImagen, '✅ Completado', '#4caf50');
                resolve(event.body);
              }
            },
            error: (error) => {
              this.actualizarEstadoImagen(numeroImagen, '❌ Error', '#f44336');
              reject(error);
            }
          });
        });
      }

      private actualizarProgresoImagen(numeroImagen: number, porcentaje: number): void {
        const progressBar = document.getElementById(`progress-${numeroImagen}`);
        const percentText = document.getElementById(`percent-${numeroImagen}`);
        
        if (progressBar) {
          progressBar.style.width = `${porcentaje}%`;
        }
        if (percentText) {
          percentText.textContent = `${porcentaje}%`;
        }
      }
      
      private actualizarEstadoImagen(numeroImagen: number, estado: string, color: string): void {
        const statusElement = document.getElementById(`status-${numeroImagen}`);
        if (statusElement) {
          statusElement.textContent = estado;
          statusElement.style.color = color;
        }
      }

      onFileSelect(event: any, numeroImagen: number): void {
        //console.log('🔥 onFileSelect EJECUTADO - Archivo:', numeroImagen);
        //console.log('Evento recibido:', event);
        
        const file = event.files[0];
        //console.log('Archivo extraído:', file);
        
        // Validar tipo de archivo
        if (!this.validarTipoArchivo(file, numeroImagen)) {
          const tipoEsperado = numeroImagen === 2 ? 'PDF' : 
                              numeroImagen === 4 ? 'imagen o PDF' : 'imagen';
          Swal.fire('Error', `Por favor selecciona un archivo de tipo ${tipoEsperado} válido`, 'error');
          return;
        }
        
        // Validar tamaño de archivo
        if (!this.validarTamanoArchivo(file, numeroImagen)) {
          const limite = numeroImagen === 2 || numeroImagen === 4 ? '10MB' : '5MB';
          Swal.fire('Error', `El archivo excede el tamaño máximo permitido de ${limite}`, 'error');
          return;
        }
        
        // Almacenar el archivo
        this.imagenesSeleccionadas[numeroImagen] = file;
        //console.log('Estado después de almacenar:', this.imagenesSeleccionadas);
        //console.log(`Archivo ${numeroImagen} almacenado:`, file.name);
        
        // Mostrar confirmación visual
        this.mostrarArchivoSeleccionado(numeroImagen, file);
      }

      // 5. Método para mostrar confirmación de archivo seleccionado
      private mostrarArchivoSeleccionado(numeroImagen: number, file: File): void {
        const toast = {
          severity: 'success',
          summary: 'Archivo seleccionado',
          detail: `${this.obtenerLabelArchivo(numeroImagen)}: ${file.name}`,
          life: 3000
        };
        
        // Si usas PrimeNG MessageService
        // this.messageService.add(toast);
        
        // O usar console para debugging
        //console.log(`✅ ${this.obtenerLabelArchivo(numeroImagen)} seleccionado: ${file.name}`);
      }
    
      // Función para transformar los datos del formulario
      private transformFormData(formData: any): any {
        const { selectedDepart, ...rest } = formData;
        return {
          ...rest,
          clienteid: selectedDepart.clienteid
        };
      }

      // Método de subida simple (también actualizado para PDFs)
      private subirImagen(file: File, numeroImagen: number): Promise<any> {
        //console.log(`=== SUBIENDO ARCHIVO ${numeroImagen} ===`);
        //console.log('Archivo:', file.name, 'Tamaño:', file.size, 'Tipo:', file.type);
        
        return new Promise((resolve, reject) => {
          const formData = new FormData();
          
          // Determinar la carpeta según el tipo de archivo
          const extension = file.name.split('.').pop()?.toLowerCase();
          const carpeta = extension === 'pdf' ? 'Documents' : 'Photos';
          const path = `${carpeta}/${numeroImagen}_${file.name}`;
          
          //console.log(`Path de destino: ${path}`);
          
          formData.append('file', file);
          formData.append('path', path);

          //console.log('FormData creado, enviando petición...');

          this.http.post('http://120.40.73.66:3000/api/upload', formData, {
            reportProgress: true,
            observe: 'events'
          }).subscribe({
            next: (event) => {
              if (event.type === HttpEventType.UploadProgress) {
                const percentDone = Math.round(100 * event.loaded / (event.total ?? 1));
                //console.log(`Progreso archivo ${numeroImagen}: ${percentDone}%`);
              } else if (event.type === HttpEventType.Response) {
                //console.log(`✅ Archivo ${numeroImagen} subido exitosamente:`, event.body);
                resolve(event.body);
              }
            },
            error: (error) => {
              console.error(`❌ Error subiendo archivo ${numeroImagen}:`, error);
              reject(error);
            }
          });
        });
      }

      private async subirImagenes(): Promise<boolean> {
        // console.log('=== INICIANDO SUBIDA DE IMÁGENES ===');
        // console.log('Imágenes seleccionadas:', this.imagenesSeleccionadas);
        
        const promesasSubida = [];
        
        // Iterar sobre todas las imágenes seleccionadas
        for (const [numeroImagen, archivo] of Object.entries(this.imagenesSeleccionadas)) {
          if (archivo) {
            // console.log(`Preparando subida de imagen ${numeroImagen}:`, archivo.name);
            const promesa = this.subirImagen(archivo, parseInt(numeroImagen));
            promesasSubida.push(promesa);
          }
        }
      
        // console.log(`Total de promesas de subida: ${promesasSubida.length}`);
      
        if (promesasSubida.length === 0) {
          // console.log('No hay imágenes para subir');
          return true; // No hay imágenes, consideramos como éxito
        }
      
        try {
          // Esperar a que todas las imágenes se suban
          const resultados = await Promise.all(promesasSubida);
          // console.log('Todas las imágenes se subieron correctamente:', resultados);
          return true;
        } catch (error) {
          console.error('Error subiendo imágenes:', error);
          Swal.fire('Error', 'Error al subir las imágenes', 'error');
          return false;
        }
      }
    
      editarUsuario(usuario: any): void {
        //console.log('Cliente editado:', cliente);
    
        // Convertir el departamentoid del usuario a un número
        const clienteId = parseInt(usuario.clienteid, 10);
    
        // Busca el departamento correspondiente al usuario editado
        const clienteSeleccionado = this.usuarios.find(usuario => usuario.clienteid === clienteId);
        //console.log('Cliente seleccionado:', clienteSeleccionado);
        // Asigna el departamento seleccionado al formulario
        this.formularioUsuarios.patchValue({
            //selectedDepart: departamentoSeleccionado,
            //cedula_search : '',
            cedula: usuario.cedula,
            nombre: usuario.nombre,
            direccion: usuario.direccion,
            telefono: usuario.telefono,
            email: usuario.email
        });
    
    
        // Muestra el formulario de edición
        this.clienteIdEditando = usuario.clienteid;
        this.formularioVisible = true;
          // this.formularioUsuario.patchValue({
          //   selectedDepart: usuario.departamentoid,
          //   cedula: usuario.cedula,
          //   nombre: usuario.nombre,
          //   apellido: usuario.apellido
          // });
          // this.usuarioIdEditando = usuario.usuarioid;
          // this.mostrarFormulario();
      }
    
      eliminarUsuario(usuario: any): void {
        // Lógica para eliminar el estado
      }
  
      mostrarMensaje() {
        Swal.fire({
          icon: 'info',
          title: 'Estamos trabajando',
          text: 'Esta funcionalidad estará disponible pronto.',
          confirmButtonText: 'Entendido'
        });
      }
}
