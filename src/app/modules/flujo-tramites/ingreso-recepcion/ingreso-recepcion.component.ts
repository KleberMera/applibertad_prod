import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpClient, HttpEventType, HttpEvent  } from '@angular/common/http';
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { API_ROUTES } from '@data/constants/routes';
import { RolesService } from '@data/services/admin/roles.service';
import { UsersService } from '@data/services/admin/users.service';
import { FileUpload } from 'primeng/fileupload';
import { Table } from 'primeng/table';
import { FilesService } from '@data/services/alcaldia/files.service';
import { XMLParser } from 'fast-xml-parser';
import Swal from 'sweetalert2';
import { text } from '@fortawesome/fontawesome-svg-core';


@Component({
  selector: 'app-ingreso-recepcion',
  templateUrl: './ingreso-recepcion.component.html',
  styleUrl: './ingreso-recepcion.component.scss',
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
export class IngresoRecepcionComponent {
  //@ViewChild('usernameInput') usernameInput!: ElementRef;
  @ViewChild('tbUsuarios') tbusuarios!: Table; // Añade @ViewChild para obtener la referencia a la tabla
  @ViewChild('fileUpload1') fileUpload1!: FileUpload;
  @ViewChild('fileUpload2') fileUpload2!: FileUpload;
  @ViewChild('fileUpload3') fileUpload3!: FileUpload;
  @ViewChild('fileUpload4') fileUpload4!: FileUpload;
  
    usuarios: any[] = [];
    roles: any[] = [];
    errorMessage = '';
  
    cedulaSearchValue: string = '';
    
    formularioUsuarios!: FormGroup; // Propiedad para el formulario
    formularioNuevoContribuyente!: FormGroup;
    formularioVisible: boolean = false;
    formularioVisible2 : boolean = true;
  
    clienteIdEditando: number | null = null; // Propiedad para almacenar el ID del estado en edición

    fechaActual: Date = new Date();

    tiposFijos: { label: string, value: string }[] = [];
    tiposGenero = [
      { label: 'Masculino', value: 'M' },
      { label: 'Femenino', value: 'F' },
      { label: 'Prefiero no decir', value: 'N' }
    ];
    tiposEstado = [
      { label: 'Soltero/a', value: 'SL' },
      { label: 'Casado/a', value: 'CS' },
      { label: 'Unión libre o de hecho', value: 'UL' },
      { label: 'Separado/a', value: 'SP' },
      { label: 'Divorciado/a', value: 'DC' },
      { label: 'Viudo/a', value: 'VD' },
    ];
    imagenesSeleccionadas: { [key: number]: File } = {};

    /**
     * Variables pa las cosas importantes hequimio 3-06-2025
     */
    num_tramite: string = '';
    cedula: string  = '';
    idDepartamento: string = '';
    id_contribu: string = '';
    solicitante: string = '';
    beneficiario: string = '';
    numOficio: string = '';
    asunto: string = '';
    infoAdicional: string = '';
    username: string = '';
    urlPath: string = '';
    tipoTramite: string = 'LLTRE';

    url_path_detalle: string = '';

    mostrarFormularioNuevoContribuyente: boolean = false;
   
    constructor(
      private fb: FormBuilder,
      private rolesService: RolesService,
      private usersService: UsersService,
      private http: HttpClient,
      private filesService: FilesService
      //private renderer: Renderer2
      //private clienteService: ClientesService,
      // private departamentosService: DepartamentosService
      //private insertEstadoService : InsertEstadosService
    ) {
      
      const userDataString = sessionStorage.getItem('currentUserGADMLL');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        this.username = userData.username;
        // console.log(userData); // Muestra los datos obtenidos del usuario
      }
    }
    
    ngOnInit(): void {
      
      this.formularioUsuarios = this.fb.group({
        cedula_search: [''],
        personId : ['', Validators.required],  // Campo de id de persona MAEPER
        cedula: ['', Validators.required],  // Campo de cedula requerido
        nombre_solicitante: ['', Validators.required],  // Campo de nombre requerido
        nombre_beneficiario: ['', Validators.required],  // Campo de nombre requerido
        fecha_ingreso: [this.fechaActual, Validators.required],
        no_oficio: ['', Validators.required],
        tipo: ['', Validators.required],
        asunto: ['', Validators.required],
        referencia: ['', Validators.required]

      });

      setTimeout(() => {
        const event = new Event('input', { bubbles: true });
        document.getElementById('nombre')?.dispatchEvent(event);
      }, 50);
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

      this.obtenerDepartamentos();    
      
      // this.formularioUsuarios.get('fecha_ingreso')?.setValue(this.fechaActual);
      // this.formularioUsuarios.get('fecha_ingreso')?.disable();

      this.obtenerNumeroTramite();

      this.formularioNuevoContribuyente = this.fb.group({
        cedula_nueva: ['', Validators.required],
        nombre_nuevo: ['', Validators.required],
        segundo_nombre_nuevo: ['', Validators.required],
        primer_apellido_nuevo: ['', Validators.required],
        segundo_apellido_nuevo: ['', Validators.required],
        // Agrega más si necesitas
      });

      this.loadUsuarios();

    }

    guardarNuevoContribuyente() {
      if (this.formularioNuevoContribuyente.valid) {
        const nuevoContribuyente = this.formularioNuevoContribuyente.value;
        // Llama al servicio para guardar
        // console.log('Guardar:', nuevoContribuyente); //Consulta para mostrar los datos que se van a guardar del nuevo contribuyente
        // Luego de guardar:
        this.mostrarFormularioNuevoContribuyente = false;
        this.formularioUsuarios.patchValue({
          cedula: nuevoContribuyente.cedula,
          nombre_solicitante: nuevoContribuyente.nombre,
          nombre_beneficiario: nuevoContribuyente.nombre
        });
      }
    }
    
    cancelarNuevoContribuyente() {
      this.mostrarFormularioNuevoContribuyente = false;
      this.formularioNuevoContribuyente.reset();
    }

    obtenerDepartamentos(){
      this.usersService.getDepartamentos().subscribe(response => {
        if (!response.error && response.data) {
          // Transforma la data al formato del dropdown
          this.tiposFijos = response.data.map((item: any) => ({
            label: item.DESCRIPCION,
            value: item.COD_DPTO
          }));
        }
      });  
    }

    obtenerNumeroTramite(actualizarVisualmente: boolean = false) {
      this.usersService.getNumTramite().subscribe(response => {
        if (!response.error && response.data) {
          this.num_tramite = response.data[0].NUMERO_TRAMITE;
    
          // Si se necesita actualizar el campo en el formulario
          if (actualizarVisualmente) {
            this.formularioUsuarios.get('num_tramite')?.setValue(this.num_tramite);
          }
    
          // También actualizamos el urlPath
          const partes = this.num_tramite.split('-');
          if (partes.length === 3) {
            this.urlPath = `/${partes[0]}/${partes[1]}/${partes[2]}/`;
          }
        }
      });
    }    

    refrescar(){
      this.obtenerNumeroTramite();
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
      this.mostrarFormularioNuevoContribuyente = false;
    }
  
    mostrarFormulario2(): void {
      this.formularioVisible2 = true;
      this.formularioVisible = false;
      this.formularioUsuarios.reset();
      this.usuarios = [];
      this.loadUsuarios();
      this.mostrarFormularioNuevoContribuyente = false;
    }
    
    mostrarFormulario3(): void {
      this.formularioVisible2 = false;
      this.formularioVisible = false;
      this.formularioUsuarios.reset();
      this.usuarios = [];
      // this.loadUsuarios();
    }
  
  
    loadUsuarios(): void {
      this.usersService.getListaTramites().subscribe({
        next: (response) => {
          if (response.error) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.msg,
              confirmButtonText: 'Ok'
            });
          } else {
            this.usuarios = response.data;
            Swal.fire({
              icon: 'success',
              title: 'Trámites obtenidos',
              text: `Se cargaron ${this.usuarios.length} registros.`,
              confirmButtonText: 'Ok'
            });
            // console.log(this.usuarios); //Consulta que muestra los registros obtenidos del endpoint
          }
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error de red',
            text: 'No se pudo conectar con el servidor.',
            confirmButtonText: 'Ok'
          });
          // console.error('Error en la solicitud HTTP:', err); //Muestra el error en la solicitud HTTP
        }
      });
    }    
  
    ocultarFormulario(): void {
      this.formularioVisible = false;
      this.formularioUsuarios.reset();
      this.clienteIdEditando = null;
      this.mostrarFormularioNuevoContribuyente = false;
    }
  
    ocultarFormulario2(): void {
      this.formularioVisible2 = false;
      this.formularioVisible = false;
      this.formularioUsuarios.reset();
      this.clienteIdEditando = null;
      this.mostrarFormularioNuevoContribuyente = false;
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
    
      if (!cedula) {
        Swal.fire('Error', 'Debe ingresar la cédula para realizar la búsqueda', 'error');
        return;
      }
    
      Swal.fire({
        title: 'Consultando datos...',
        text: 'Por favor, espere un momento.',
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
    
      this.usersService.getContribuDataByCedula(cedula).subscribe(r => {
        Swal.close();
        // console.log("datos recibidos", r.data); //Datos recibidos del contibuyente buscado por cédula
    
        if (!r.error && r.data && r.data.length > 0) {
          if (r.data.length === 1) {
            // Solo uno, autocompleta directamente
            const contribuyente = r.data[0].CONTRIBUYENTE;
            this.id_contribu = r.data[0].ID;
    
            this.formularioUsuarios.patchValue({
              personId: r.data[0].ID,
              cedula: r.data[0].CEDULA,
              nombre_solicitante: contribuyente,
              nombre_beneficiario: contribuyente,
            });
          } else {
            // Varios resultados, paginación local con búsqueda global
            const pageSize = 10;
            let currentPage = 1;
            let filteredData = r.data; // Array filtrado por búsqueda
            let currentFilter = ''; // Filtro actual
    
            const renderTable = (page: number, dataToRender: any[]) => {
              const totalPages = Math.ceil(dataToRender.length / pageSize);
              const start = (page - 1) * pageSize;
              const end = start + pageSize;
              const pageData = dataToRender.slice(start, end);
            
              const rows = pageData.map((item: any, i: number) => `
                <tr data-id="${item.ID}" style="cursor:pointer;">
                  <td>${item.CEDULA}</td>
                  <td>${item.CONTRIBUYENTE}</td>
                </tr>
              `).join('');
            
              return `
                <style>
                  /* Input PrimeNG style */
                  #filtro {
                    width: 100%;
                    padding: 0.5rem;
                    font-size: 1rem;
                    line-height: 1.5;
                    color: #495057;
                    background-color: #fff;
                    background-clip: padding-box;
                    border: 1px solid #ced4da;
                    border-radius: 0.25rem;
                    box-shadow: inset 0 1px 1px rgb(0 0 0 / 0.075);
                    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                  }
                  #filtro:focus {
                    border-color: #80bdff;
                    outline: 0;
                    box-shadow: 0 0 0 0.2rem rgb(0 123 255 / 0.25);
                  }
            
                  /* Tabla PrimeNG estilo simplificado */
                  table {
                    width: 100%;
                    border-collapse: collapse;
                    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 0.875rem;
                  }
                  thead tr {
                    background-color: #f4f4f4;
                    color: #495057;
                    font-weight: 600;
                  }
                  th, td {
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid #dee2e6;
                  }
                  tbody tr:hover {
                    background-color: #e0e0e0;
                  }
                  .p-button {
                    padding: 0.5rem 1rem;
                    border: 1px solid #007ad9;
                    background: #007ad9;
                    color: #ffffff;
                    border-radius: 0.25rem;
                    cursor: pointer;
                  }
                  .p-button:disabled {
                    background: #dee2e6;
                    border-color: #dee2e6;
                    cursor: not-allowed;
                  }
                </style>
            
                <input type="text" id="filtro" placeholder="Buscar por cédula o nombre..." value="${currentFilter}" class="p-inputtext p-component" style="margin-bottom: 10px;">
                <div style="max-height:300px; overflow-y:auto;">
                  <table id="tabla-contribuyentes" class="p-datatable p-component">
                    <thead>
                      <tr>
                        <th>Cédula</th>
                        <th>Contribuyente</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rows}
                    </tbody>
                  </table>
                </div>
                <div style="margin-top: 10px; text-align: center;">
                  <button id="prevPage" class="p-button p-component" ${page === 1 ? 'disabled' : ''} style="margin-right: 10px;">Anterior</button>
                  <span style="margin: 0 15px;">Página ${page} de ${totalPages} (${dataToRender.length} registros)</span>
                  <button id="nextPage" class="p-button p-component" ${page === totalPages ? 'disabled' : ''}>Siguiente</button>
                </div>
              `;
            };
    
            const actualizarTabla = (page: number, dataToRender: any[]) => {
              currentPage = page;
              Swal.getHtmlContainer()!.innerHTML = renderTable(page, dataToRender);
              asignarEventos();
            };
    
            const filtrarDatos = (filtro: string) => {
              if (!filtro.trim()) {
                return r.data;
              }
              
              const filtroLower = filtro.toLowerCase();
              return r.data.filter((item: any) => 
                item.CEDULA.toLowerCase().includes(filtroLower) || 
                item.CONTRIBUYENTE.toLowerCase().includes(filtroLower)
              );
            };
    
            const asignarEventos = () => {
              const filtro = document.getElementById("filtro") as HTMLInputElement;
              
              // Evento de búsqueda con debounce
              let timeoutId: any;
              filtro.addEventListener("input", () => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                  currentFilter = filtro.value;
                  filteredData = filtrarDatos(currentFilter);
                  currentPage = 1; // Resetear a la primera página
                  actualizarTabla(currentPage, filteredData);
                }, 300); // Debounce de 300ms
              });
    
              // Click en filas para seleccionar contribuyente
              document.querySelectorAll("#tabla-contribuyentes tbody tr").forEach(tr => {
                tr.addEventListener("click", () => {
                  const id = tr.getAttribute("data-id");
                  const seleccionado = r.data.find((item: any) => item.ID == id);
                  
                  if (seleccionado) {
                    this.id_contribu = seleccionado.ID;
                    this.formularioUsuarios.patchValue({
                      personId: seleccionado.ID,
                      cedula: seleccionado.CEDULA,
                      nombre_solicitante: seleccionado.CONTRIBUYENTE,
                      nombre_beneficiario: seleccionado.CONTRIBUYENTE,
                    });
                    Swal.close();
                  }
                });
              });
    
              // Botones paginación
              const btnPrev = document.getElementById("prevPage")!;
              const btnNext = document.getElementById("nextPage")!;
    
              btnPrev.onclick = () => {
                if (currentPage > 1) {
                  actualizarTabla(currentPage - 1, filteredData);
                }
              };
              
              btnNext.onclick = () => {
                const totalPages = Math.ceil(filteredData.length / pageSize);
                if (currentPage < totalPages) {
                  actualizarTabla(currentPage + 1, filteredData);
                }
              };
            };
    
            Swal.fire({
              title: 'Contribuyentes Encontrados',
              html: renderTable(currentPage, filteredData),
              showConfirmButton: false,
              width: '60%',
              didOpen: () => {
                asignarEventos();
              }
            });
          }
        } else {
          // No se encontraron datos
          Swal.fire({
            title: 'No se encontraron datos',
            text: '¿Deseas ingresar un nuevo contribuyente?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, ingresar',
            cancelButtonText: 'No',
          }).then((result) => {
            if (result.isConfirmed) {
              this.mostrarFormularioNuevoContribuyente = true;
              this.mostrarFormulario3();
            }
          });
        }
      });
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

    // Variables para manejar el estado de los modales
    private currentModalData: any = null; // Cambiar a array
    private currentUrlPath: string = '';

    mostrarMensaje(usuario: any): void {
      const numeroTramite = usuario.NUMERO_TRAMITE;

      this.usersService.getDetalleTramite(numeroTramite).subscribe(response => {
        if (response.error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.msg,
            confirmButtonText: 'Ok'
          });
        } else {
          const data = response.data[0];
          const urlPath = data.URL_PATH;

          if (!urlPath) {
            Swal.fire('Error', 'No se encontró la ruta de archivos para este trámite', 'error');
            return;
          }

          // Guardamos los datos como array para poder volver
          this.currentModalData = response.data; // Guardar todo el array
          this.currentUrlPath = urlPath;

          this.mostrarDetalleTramite(response.data, response.data[0].URL_PATH);
        }
      });
    }

    // Función principal que muestra la línea de tiempo
    private mostrarLineaTiempo(dataArray: any[], urlPath: string): void {
      setTimeout(() => {
        // Agrupar datos por departamento para crear la línea de tiempo
        const departamentosTramite = this.agruparPorDepartamento(dataArray);
        
        const timelineHtml = this.generarHtmlLineaTiempo(departamentosTramite, dataArray, urlPath);

        Swal.fire({
          title: 'Línea de Tiempo del Trámite',
          html: timelineHtml,
          showConfirmButton: false,
          showCancelButton: true,
          cancelButtonText: 'Cerrar',
          width: '90vw',
          customClass: {
            popup: 'swal-timeline',
            htmlContainer: 'swal-timeline-container'
          },
          didOpen: () => {
            this.configurarEventosLineaTiempo(dataArray, urlPath);
          }
        });
      }, 100);
    }

    // Función auxiliar para agrupar datos por departamento
    private agruparPorDepartamento(dataArray: any[]): any[] {
      const departamentosUnicos = new Map();
      
      dataArray.forEach((item, index) => {
        const key = item.DEPARTAMENTO;
        if (!departamentosUnicos.has(key)) {
          departamentosUnicos.set(key, {
            departamento: item.DEPARTAMENTO,
            fechaIngreso: item.FECHA_INGRESO,
            fechaEnvio: item.FECHA_ENVIO,
            indices: [index],
            count: 1
          });
        } else {
          const existing = departamentosUnicos.get(key);
          existing.indices.push(index);
          existing.count++;
          // Actualizar fechas si es necesario
          if (!existing.fechaEnvio && item.FECHA_ENVIO) {
            existing.fechaEnvio = item.FECHA_ENVIO;
          }
        }
      });
      
      return Array.from(departamentosUnicos.values()).sort((a, b) => 
        new Date(a.fechaIngreso).getTime() - new Date(b.fechaIngreso).getTime()
      );
    }

    // Función para generar el HTML de la línea de tiempo
    private generarHtmlLineaTiempo(departamentos: any[], dataArray: any[], urlPath: string): string {
      const total = departamentos.length;
      const timelineRows = [...departamentos].reverse().map((dept, index) => {
        const realIndex = total - index - 1;
        return `
          <tr class="timeline-row ${realIndex === total - 1 ? 'current-row' : ''}">
            <td class="timeline-number">
              <div class="timeline-circle ${realIndex === total - 1 ? 'current' : 'completed'}">
                ${realIndex + 1}
              </div>
            </td>
            <td class="timeline-department">${dept.departamento}</td>
            <td class="timeline-date">${dept.fechaIngreso}</td>
            <td class="timeline-date">${dept.fechaEnvio || 'Sin fecha de envío'}</td>
            <td class="timeline-actions">
              <div style="text-align: center;">
                <button class="btn-ver-detalle" data-indices="${dept.indices.join(',')}" 
                        style="background: transparent; color: #6c757d; border: none; border-radius: 50%; cursor: pointer; font-size: 16px; transition: color 0.2s, transform 0.2s;">
                  <i class="fa fa-eye"></i>
                </button>
              </div>
            </td>

          </tr>
        `;
      }).join('');


      return `
        <style>
          .swal-timeline {
            max-width: 90vw !important;
            width: 90vw !important;
          }
          
          .timeline-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
          }
          
          .timeline-table th {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            color: #495057;
          }
          
          .timeline-table td {
            border: 1px solid #dee2e6;
            padding: 10px;
            text-align: left;
            vertical-align: middle;
          }
          
          .timeline-row {
            transition: background-color 0.2s;
          }
          
          .timeline-row:hover {
            background-color: #f8f9fa;
          }
          
          .current-row {
            background-color: #e3f2fd;
          }
          
          .timeline-number {
            text-align: center;
            width: 60px;
          }
          
          .timeline-circle {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: 14px;
            margin: 0 auto;
          }
          
          .timeline-circle.completed {
            background:rgb(142, 142, 142);
          }
          
          .timeline-circle.current {
            background: #007bff;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
          }
          
          .timeline-department {
            font-weight: 500;
            color: #495057;
          }
          
          .timeline-date {
            color: #6c757d;
            font-size: 12px;
          }
          
          .timeline-actions {
            text-align: center;
            width: 120px;
          }
          
          .btn-mostrar-todos {
            background: #28a745;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            margin-top: 20px;
            width: 100%;
          }
          
          .btn-mostrar-todos:hover {
            background: #218838;
          }
          
          .btn-ver-detalle:hover {
            background: #0056b3;
          }
        </style>
        
        <div style="max-height: 60vh; overflow-y: auto;">
          <table class="timeline-table">
            <thead>
              <tr>
                <th style="text-align: center;">#</th>
                <th>Departamento</th>
                <th>Fecha Ingreso</th>
                <th>Fecha Envío</th>
                <th style="text-align: center;">Ver Detalle</th>
              </tr>
            </thead>
            <tbody>
              ${timelineRows}
            </tbody>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 20px; border-top: 1px solid #dee2e6; padding-top: 20px;">
          <button class="btn-mostrar-todos" id="btn-mostrar-todos">
            📊 Mostrar Todos los Detalles
          </button>
        </div>
      `;
    }

    // Función para configurar eventos de la línea de tiempo
    private configurarEventosLineaTiempo(dataArray: any[], urlPath: string): void {
      // Event listeners para botones "Ver Detalle"
      document.querySelectorAll('.btn-ver-detalle').forEach(btn => {
        btn.addEventListener('click', () => {
          const indices = (btn as HTMLElement).getAttribute('data-indices')!
            .split(',').map(i => parseInt(i, 10));
          
          const datosSeleccionados = indices.map(i => dataArray[i]);
          Swal.close();
          this.mostrarModalDetalle(datosSeleccionados, urlPath);
        });
      });

      // Event listener para "Mostrar Todos"
      const btnMostrarTodos = document.getElementById('btn-mostrar-todos');
      if (btnMostrarTodos) {
        btnMostrarTodos.addEventListener('click', () => {
          Swal.close();
          this.mostrarModalDetalle(dataArray, urlPath);
        });
      }
    }

    // Función modificada para llamar primero a la línea de tiempo
    public mostrarDetalleTramite(dataArray: any[], urlPath: string): void {
      // Ahora primero muestra la línea de tiempo
      this.mostrarLineaTiempo(dataArray, urlPath);
    }

    // Modificación en mostrarModalDetalle - cambiar la llamada al botón Ver Archivos
    private mostrarModalDetalle(dataArray: any[], urlPath: string): void {     
      setTimeout(() => {
        const optionsHtml = this.tiposFijos.map(dept => 
          `<option value="${dept.value}">${dept.label}</option>`
        ).join('');

        const filasHtml = dataArray.map((data, index) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 6px;">${data.NUMERO_TRAMITE || 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 6px;">${data.DEPARTAMENTO || 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 6px;">${data.USUARIO_INGRESO || 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 6px;">${data.FECHA_INGRESO || 'N/A'}</td>
            
            <td style="border: 1px solid #ddd; padding: 6px; max-width: 200px; word-wrap: break-word;">
              ${
                data.OBSERVACIONES?.trim()
                  ? `<span style="font-size: 11px;">${data.OBSERVACIONES}</span>`
                  : `<input type="text" id="nueva_observacion_${index}" placeholder="Agregar observación"
                      style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 3px; font-size: 11px;">`
              }
            </td>

            <td style="border: 1px solid #ddd; padding: 6px;">
              ${data.FECHA_ENVIO ? data.FECHA_ENVIO : 'Sin fecha de envío'}
            </td>

            <td style="border: 1px solid #ddd; padding: 6px;">
              ${
                data.FECHA_ENVIO?.trim()
                  ? `<span style="font-size: 12px;">${data.DEPARTAMENTO}</span>`
                  : `<select id="departamento-select-${index}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px;">
                      <option value="">Seleccionar departamento...</option>
                      ${optionsHtml}
                    </select>`
              }
            </td>

            <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">
              ${
                data.FECHA_ENVIO?.trim()
                ?`<button class="btn-archivos" data-url="${data.URL_PATH || ''}" data-id-departamento="${data.ID_DEPARTAMENTO || ''}"
                          title="Ver archivos"
                          style="font-size: 11px; padding: 4px 8px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; margin-right: 2px;">
                    <i class="fa-solid fa-folder-open"></i>
                  </button>`

                :`<button class="btn-archivos-upload" data-url="${data.URL_PATH || ''}" data-index="${index}"
                          title="Añadir archivos"
                          style="font-size: 11px; padding: 4px 8px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; margin-right: 2px;">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                  </button>
                  <input type="file" id="file-input-${index}" multiple style="display: none;" accept="*/*">`
              }
              ${
                data.FECHA_ENVIO?.trim()
                  ? ''
                  : `<button class="btn-enviar" data-index="${index}" 
                            title="Enviar Asignación"
                            style="font-size: 11px; padding: 4px 8px; background:rgb(6, 203, 183); color: white; border: none; border-radius: 3px; cursor: pointer;">
                      <i class="fa-solid fa-user-plus"></i>
                    </button>`
              }
            </td>
        `).join('');

        const tablaHtml = `
          <style>
            .swal-extra-wide {
              max-width: 95vw !important;
              width: 95vw !important;
              max-height: 90vh !important;
              height: auto !important;
            }

            .swal-container-wide {
              padding: 10px !important;
            }

            .swal-extra-wide table {
              font-size: 12px;
              width: 100%;
              table-layout: fixed;
            }

            .swal-extra-wide td, 
            .swal-extra-wide th {
              padding: 6px !important;
              word-wrap: break-word;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .swal-extra-wide .swal2-html-container {
              overflow-x: auto;
              max-height: 70vh;
              overflow-y: auto;
            }

            .upload-progress {
              margin-top: 5px;
              font-size: 10px;
            }

            .upload-progress-bar {
              width: 100%;
              height: 4px;
              background-color: #f0f0f0;
              border-radius: 2px;
              overflow: hidden;
            }

            .upload-progress-fill {
              height: 100%;
              background-color: #4CAF50;
              transition: width 0.3s ease;
            }
          </style>
          <div style="overflow-x: auto; max-height: 70vh; overflow-y: auto;">
            <table style="width: 100%; min-width: 1000px; border-collapse: collapse; font-size: 12px;">
              <thead style="position: sticky; top: 0; background: white; z-index: 10;">
                <tr style="background-color: #f2f2f2;">
                  <th style="border: 1px solid #ddd; padding: 6px; text-align: left; min-width: 100px;">Trámite</th>
                  <th style="border: 1px solid #ddd; padding: 6px; text-align: left; min-width: 120px;">Departamento Actual</th>
                  <th style="border: 1px solid #ddd; padding: 6px; text-align: left; min-width: 120px;">Usuario Ingreso</th>
                  <th style="border: 1px solid #ddd; padding: 6px; text-align: left; min-width: 100px;">Fecha Ingreso</th>
                  <th style="border: 1px solid #ddd; padding: 6px; text-align: left; min-width: 150px;">Observaciones</th>
                  <th style="border: 1px solid #ddd; padding: 6px; text-align: left; min-width: 100px;">Fecha Envío</th>
                  <th style="border: 1px solid #ddd; padding: 6px; text-align: left; min-width: 180px;">Nuevo Departamento</th>
                  <th style="border: 1px solid #ddd; padding: 6px; text-align: center; min-width: 100px;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${filasHtml}
              </tbody>
            </table>
          </div>
        `;

        Swal.fire({
          title: `Detalle del Trámite`,
          html: tablaHtml,
          showConfirmButton: true,
          confirmButtonText: 'Cerrar',
          width: '95vw',
          customClass: {
            popup: 'swal-extra-wide',
            htmlContainer: 'swal-html-wide'
          },
          didOpen: () => {
            // Botón Ver Archivos (para cuando ya tienen fecha de envío) - MODIFICADO
            document.querySelectorAll('.btn-archivos').forEach(btn => {
              btn.addEventListener('click', () => {
                const path = (btn as HTMLElement).getAttribute('data-url')!;
                const idDepartamento = (btn as HTMLElement).getAttribute('data-id-departamento')!;
                Swal.close();
                this.mostrarTodosLosArchivos(path, idDepartamento, dataArray);
              });
            });

            // ... resto del código sin cambios ...
            // Botón Subir Archivos (para cuando no tienen fecha de envío)
            document.querySelectorAll('.btn-archivos-upload').forEach(btn => {
              btn.addEventListener('click', () => {
                const index = parseInt((btn as HTMLElement).getAttribute('data-index')!, 10);
                const fileInput = document.getElementById(`file-input-${index}`) as HTMLInputElement;
                fileInput.click();
              });
            });

            // Manejar selección de archivos
            document.querySelectorAll('input[type="file"]').forEach(fileInput => {
              fileInput.addEventListener('change', (event) => {
                const input = event.target as HTMLInputElement;
                const index = parseInt(input.id.split('-')[2], 10);
                
                if (input.files && input.files.length > 0) {
                  const departamentoSelect = document.getElementById(`departamento-select-${index}`) as HTMLSelectElement;
                  const idDepartamento = departamentoSelect?.value || '';
                  
                  if (!idDepartamento) {
                    Swal.fire({
                      icon: 'warning',
                      title: 'Atención',
                      text: 'Por favor selecciona un departamento antes de subir archivos.',
                    });
                    input.value = ''; // Limpiar la selección
                    return;
                  }

                  const tramite = dataArray[index];
                  const basePath = tramite.URL_PATH || urlPath;
                  
                  this.subirArchivosMultiples(input.files, basePath, idDepartamento, index);
                }
              });
            });
          
            // Botón Enviar con validaciones mejoradas
            document.querySelectorAll('.btn-enviar').forEach(btn => {
              btn.addEventListener('click', () => {
                const index = parseInt((btn as HTMLElement).getAttribute('data-index')!, 10);
                const departamentoSelect = document.getElementById(`departamento-select-${index}`) as HTMLSelectElement;
                const observacionInput = document.getElementById(`nueva_observacion_${index}`) as HTMLInputElement;
          
                const idDepartamento = departamentoSelect?.value || '';
                const nombreDepartamento = departamentoSelect?.selectedOptions[0]?.text || '';
                const observacion = observacionInput?.value || '';
                const tramite = dataArray[index];

                // DEBUG: Mostrar datos antes de validar
                //console.log('Datos del trámite a enviar:');
                //console.log('Index:', index);
                //console.log('ID Departamento (value):', idDepartamento);
                //console.log('Nombre Departamento (text):', nombreDepartamento);
                //console.log('Observación:', observacion);
                //console.log('Trámite completo:', tramite);
          
                if (!idDepartamento) {
                  Swal.fire({
                    icon: 'warning',
                    title: 'Atención',
                    text: 'Por favor selecciona un departamento antes de enviar.',
                  });
                  return;
                }

                // Validar que el trámite tenga datos necesarios
                if (!tramite.NUMERO_TRAMITE) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'El trámite no tiene número válido.',
                  });
                  return;
                }

                // Obtener el ID del departamento anterior
                // Buscar el ID correspondiente al departamento actual
                // Puede venir como código (COD_DPTO) o descripción (DESCRIPCION)
                let departamentoActualObj = this.tiposFijos.find(dept => dept.label === tramite.DEPARTAMENTO);
                
                // Si no lo encuentra por label, buscar por value (por si viene el código)
                if (!departamentoActualObj) {
                  departamentoActualObj = this.tiposFijos.find(dept => dept.value === tramite.DEPARTAMENTO);
                }
                
                const idDepartamentoAnterior = departamentoActualObj ? departamentoActualObj.value : tramite.DEPARTAMENTO;

                //console.log('Departamento actual del trámite:', tramite.DEPARTAMENTO);
                //console.log('Departamentos disponibles:', this.tiposFijos);
                //console.log('Objeto departamento encontrado:', departamentoActualObj);
                //console.log('ID Departamento Anterior a enviar:', idDepartamentoAnterior);
          
                Swal.fire({
                  title: '¿Estás seguro?',
                  text: `¿Estás seguro de enviar el trámite ${tramite.NUMERO_TRAMITE} al departamento ${nombreDepartamento}?`,
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonColor: '#3085d6',
                  cancelButtonColor: '#d33',
                  confirmButtonText: 'Sí, enviar',
                  cancelButtonText: 'Cancelar'
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.enviarTramiteExterno(
                      tramite.NUMERO_TRAMITE,
                      idDepartamento, // ID del nuevo departamento
                      tramite.USUARIO_INGRESO || '',
                      observacion,
                      idDepartamentoAnterior // ID del departamento anterior (no el nombre)
                    );
                  }
                });
              });
            });
          }          
        });
      }, 100);
    }

    // Función mostrarTodosLosArchivos modificada para recibir el idDepartamento
    mostrarTodosLosArchivos(urlPath: string, idDepartamento?: string, dataArray?: any[]): void {
      //console.log('Mostrando archivos para path:', urlPath);
      //console.log('ID Departamento:', idDepartamento);
      
      if (!urlPath) {
        Swal.fire('Error', 'Ruta de archivos no válida', 'error');
        return;
      }
      
      let cleanPath = urlPath.replace(/^\/+|\/+$/g, '');
      
      // Si se proporciona idDepartamento, construir la ruta específica
      if (idDepartamento) {
        cleanPath = `${cleanPath}/${idDepartamento}`;
      }
      
      // console.log('Path limpio para archivos:', cleanPath); //Muestra el path en donde están los archivos
      
      this.filesService.getFiles(cleanPath).subscribe({
        next: (response) => {
          // console.log('Respuesta archivos:', response); //Muestra los archivos que se recuperan del endpoint
          if (response.success) {
            const rootFiles = this.parseWebDAVResponse(response.data);
            
            if (idDepartamento) {
              // Si estamos filtrando por departamento, mostrar directamente los archivos
              const files = rootFiles.filter(f => !f.isDirectory);
              
              if (files.length === 0) {
                // No se encontraron archivos, mostrar mensaje amigable con opción de regresar
                Swal.fire({
                  title: 'Sin archivos',
                  html: `
                    <div style="text-align: center; padding: 20px;">
                      <i class="fa-solid fa-folder-open" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                      <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
                        No se encontraron archivos en el departamento <strong>${idDepartamento}</strong>
                      </p>
                      <p style="font-size: 14px; color: #888;">
                        Es posible que aún no se hayan subido archivos a esta ubicación.
                      </p>
                    </div>
                  `,
                  showCancelButton: true,
                  confirmButtonText: 'Regresar al detalle',
                  cancelButtonText: 'Cerrar',
                  confirmButtonColor: '#3085d6',
                  cancelButtonColor: '#6c757d',
                  icon: 'info'
                }).then((result) => {
                  if (result.isConfirmed && dataArray) {
                    // Regresar al modal de detalle del trámite
                    this.mostrarModalDetalle(dataArray, urlPath);
                  }
                });
                return;
              }
              
              this.mostrarArchivos(`Archivos del Departamento ${idDepartamento}`, files, 'files');
            } else {
              // Lógica original para mostrar todos los archivos
              const subfolderPaths = rootFiles.filter(f => f.isDirectory).map(f => f.path);
            
              const allFiles: any[] = [];
            
              let pending = subfolderPaths.length;
              if (pending === 0) {
                // No hay subcarpetas, verificar si hay archivos en la raíz
                const rootOnlyFiles = rootFiles.filter(f => !f.isDirectory);
                if (rootOnlyFiles.length === 0) {
                  // No se encontraron archivos
                  Swal.fire({
                    title: 'Sin archivos',
                    html: `
                      <div style="text-align: center; padding: 20px;">
                        <i class="fa-solid fa-folder-open" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                        <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
                          No se encontraron archivos en este trámite
                        </p>
                        <p style="font-size: 14px; color: #888;">
                          Es posible que aún no se hayan subido archivos a esta ubicación.
                        </p>
                      </div>
                    `,
                    showCancelButton: dataArray ? true : false,
                    confirmButtonText: dataArray ? 'Regresar al detalle' : 'Cerrar',
                    cancelButtonText: 'Cerrar',
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#6c757d',
                    icon: 'info'
                  }).then((result) => {
                    if (result.isConfirmed && dataArray) {
                      // Regresar al modal de detalle del trámite
                      this.mostrarModalDetalle(dataArray, urlPath);
                    }
                  });
                  return;
                } else {
                  this.mostrarArchivos('Archivos del Trámite', rootOnlyFiles, 'files');
                  return;
                }
              }
            
              subfolderPaths.forEach(subPath => {
                this.filesService.getFiles(subPath).subscribe({
                  next: (subRes) => {
                    if (subRes.success) {
                      const subFiles = this.parseWebDAVResponse(subRes.data);
                      allFiles.push(...subFiles.filter(f => !f.isDirectory));
                    }
                    pending--;
                    if (pending === 0) {
                      if (allFiles.length === 0) {
                        // No se encontraron archivos en ninguna subcarpeta
                        Swal.fire({
                          title: 'Sin archivos',
                          html: `
                            <div style="text-align: center; padding: 20px;">
                              <i class="fa-solid fa-folder-open" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                              <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
                                No se encontraron archivos en este trámite
                              </p>
                              <p style="font-size: 14px; color: #888;">
                                Es posible que aún no se hayan subido archivos a esta ubicación.
                              </p>
                            </div>
                          `,
                          showCancelButton: dataArray ? true : false,
                          confirmButtonText: dataArray ? 'Regresar al detalle' : 'Cerrar',
                          cancelButtonText: 'Cerrar',
                          confirmButtonColor: '#3085d6',
                          cancelButtonColor: '#6c757d',
                          icon: 'info'
                        }).then((result) => {
                          if (result.isConfirmed && dataArray) {
                            // Regresar al modal de detalle del trámite
                            this.mostrarModalDetalle(dataArray, urlPath);
                          }
                        });
                      } else {
                        this.mostrarArchivos('Archivos del Trámite', allFiles, 'files');
                      }
                    }
                  },
                  error: () => {
                    pending--;
                    if (pending === 0) {
                      if (allFiles.length === 0) {
                        // Error al cargar archivos de subcarpetas y no hay archivos
                        Swal.fire({
                          title: 'Sin archivos',
                          html: `
                            <div style="text-align: center; padding: 20px;">
                              <i class="fa-solid fa-folder-open" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                              <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
                                No se encontraron archivos en este trámite
                              </p>
                              <p style="font-size: 14px; color: #888;">
                                Puede haber ocurrido un error al acceder a algunas carpetas.
                              </p>
                            </div>
                          `,
                          showCancelButton: dataArray ? true : false,
                          confirmButtonText: dataArray ? 'Regresar al detalle' : 'Cerrar',
                          cancelButtonText: 'Cerrar',
                          confirmButtonColor: '#3085d6',
                          cancelButtonColor: '#6c757d',
                          icon: 'info'
                        }).then((result) => {
                          if (result.isConfirmed && dataArray) {
                            // Regresar al modal de detalle del trámite
                            this.mostrarModalDetalle(dataArray, urlPath);
                          }
                        });
                      } else {
                        this.mostrarArchivos('Archivos del Trámite', allFiles, 'files');
                      }
                    }
                  }
                });
              });
            }
          } else {
            // Error en la respuesta del servicio
            Swal.fire({
              title: 'Sin archivos',
              html: `
                <div style="text-align: center; padding: 20px;">
                  <i class="fa-solid fa-exclamation-triangle" style="font-size: 48px; color: #ffc107; margin-bottom: 20px;"></i>
                  <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
                    No se pudieron cargar los archivos
                  </p>
                  <p style="font-size: 14px; color: #888;">
                    ${idDepartamento ? `Error al acceder a la carpeta del departamento ${idDepartamento}.` : 'Error al acceder a los archivos del trámite.'}
                  </p>
                </div>
              `,
              showCancelButton: dataArray ? true : false,
              confirmButtonText: dataArray ? 'Regresar al detalle' : 'Cerrar',
              cancelButtonText: 'Cerrar',
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#6c757d',
              icon: 'warning'
            }).then((result) => {
              if (result.isConfirmed && dataArray) {
                // Regresar al modal de detalle del trámite
                this.mostrarModalDetalle(dataArray, urlPath);
              }
            });
          }          
        },
        error: (err) => {
          console.error('Error al cargar archivos:', err);
          // Error de conexión al servidor
          Swal.fire({
            title: 'No se encontraron Archivos',
            html: `
              <div style="text-align: center; padding: 20px;">
                <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
                  Este Departamento no generó archivos
                </p>
              </div>
            `,
            showCancelButton: dataArray ? true : false,
            confirmButtonText: dataArray ? 'Regresar al detalle' : 'Cerrar',
            cancelButtonText: 'Cerrar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#6c757d',
            icon: 'info'
          }).then((result) => {
            if (result.isConfirmed && dataArray) {
              // Regresar al modal de detalle del trámite
              this.mostrarModalDetalle(dataArray, urlPath);
            }
          });
        }
      });
    }

    // Nueva función para subir archivos múltiples
    private subirArchivosMultiples(files: FileList, basePath: string, idDepartamento: string, index: number): void {
      if (!files || files.length === 0) return;

      // Construir la ruta final con el ID del departamento
      const rutaFinal = `${basePath}${idDepartamento}`;

      // console.log(rutaFinal); //Muestra la ruta final a donde se enviarán los archivos

      const formData = new FormData();
      
      // Agregar todos los archivos al FormData
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      
      // Agregar la ruta
      formData.append('path', rutaFinal);

      // Crear indicador de progreso
      const progressContainer = document.createElement('div');
      progressContainer.className = 'upload-progress';
      progressContainer.innerHTML = `
        <div style="font-size: 10px; margin-bottom: 2px;">Subiendo ${files.length} archivo(s)...</div>
        <div class="upload-progress-bar">
          <div class="upload-progress-fill" style="width: 0%;"></div>
        </div>
      `;

      // Insertar el indicador después del botón de subir archivos
      const uploadBtn = document.querySelector(`[data-index="${index}"].btn-archivos-upload`);
      if (uploadBtn && uploadBtn.parentNode) {
        uploadBtn.parentNode.insertBefore(progressContainer, uploadBtn.nextSibling);
      }

      // Realizar la petición
      this.http.post<any>('http://localhost:3000/api/upload-multiple', formData).subscribe({
        next: (response) => {
          // console.log('Respuesta del servidor:', response); //Muestra la respuesta del endpoint
          
          // Actualizar progreso al 100%
          const progressFill = progressContainer.querySelector('.upload-progress-fill') as HTMLElement;
          if (progressFill) {
            progressFill.style.width = '100%';
          }

          if (response.success) {
            // Mostrar resultado exitoso
            setTimeout(() => {
              progressContainer.innerHTML = `
                <div style="font-size: 10px; color: #4CAF50;">
                  ✓ ${response.message}
                </div>
              `;
            }, 500);

            // Limpiar el input
            const fileInput = document.getElementById(`file-input-${index}`) as HTMLInputElement;
            if (fileInput) {
              fileInput.value = '';
            }

            // Opcional: Mostrar detalles de los archivos subidos
            if (response.results) {
              const successFiles = response.results.filter((r: any) => r.success);
              const failedFiles = response.results.filter((r: any) => !r.success);
              
              if (failedFiles.length > 0) {
                // console.warn('Archivos que fallaron:', failedFiles); //Muestr los archivos que fallaron
                setTimeout(() => {
                  progressContainer.innerHTML += `
                    <div style="font-size: 9px; color: #ff9800; margin-top: 2px;">
                      ${failedFiles.length} archivo(s) fallaron
                    </div>
                  `;
                }, 1000);
              }
            }

            // Limpiar el indicador después de 3 segundos
            setTimeout(() => {
              if (progressContainer.parentNode) {
                progressContainer.parentNode.removeChild(progressContainer);
              }
            }, 3000);

          } else {
            // Mostrar error
            progressContainer.innerHTML = `
              <div style="font-size: 10px; color: #f44336;">
                ✗ Error: ${response.message || 'Error al subir archivos'}
              </div>
            `;
          }
        },
        error: (error) => {
          // console.error('Error al subir archivos:', error); //Muestra el error de la subida de archivos
          
          // Mostrar error en el indicador
          progressContainer.innerHTML = `
            <div style="font-size: 10px; color: #f44336;">
              ✗ Error al subir archivos
            </div>
          `;

          // Limpiar después de 3 segundos
          setTimeout(() => {
            if (progressContainer.parentNode) {
              progressContainer.parentNode.removeChild(progressContainer);
            }
          }, 3000);
        }
      });
    }

    // Método mejorado para enviar el trámite con debugging
    private async enviarTramiteExterno(numeroTramite: string, idDepartamento: string, username: string, observacion: string, idDepartamentoAnterior: string): Promise<void> {
      try {
        // Mostrar loading
        Swal.fire({
          title: 'Enviando...',
          text: 'Por favor espera mientras se procesa el envío.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Validar datos antes de enviar
        if (!numeroTramite || !idDepartamento || !username) {
          throw new Error('Datos requeridos faltantes');
        }

        // Preparar datos para x-www-form-urlencoded
        const formData = new URLSearchParams();
        formData.append('numeroTramite', numeroTramite.toString());
        formData.append('idDepartamento', idDepartamento.toString());
        formData.append('username', username.toString());
        formData.append('observacion', observacion || ''); // Manejar observación vacía
        formData.append('idDepartamentoAnterior', idDepartamentoAnterior.toString());

        // DEBUG: Mostrar datos que se envían
        // console.log('Datos a enviar:');
        // console.log('numeroTramite:', numeroTramite);
        // console.log('idDepartamento:', idDepartamento);
        // console.log('username:', username);
        // console.log('observacion:', observacion);
        // console.log('idDepartamentoAnterior:', idDepartamentoAnterior);
        // console.log('FormData:', formData.toString());
        // console.log('URL:', API_ROUTES.ALCALDIA.GUARDAR_TRAMITE_EXT);

        // Realizar petición HTTP
        const response = await fetch(API_ROUTES.ALCALDIA.GUARDAR_TRAMITE_EXT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString()
        });

        // DEBUG: Mostrar respuesta completa
        // console.log('Status de respuesta:', response.status);
        // console.log('Headers de respuesta:', response.headers);

        // Leer el contenido de la respuesta para debugging
        const responseText = await response.text();
        // console.log('Respuesta del servidor:', responseText);

        if (response.ok) {
          let result;
          try {
            result = JSON.parse(responseText);
          } catch (e) {
            // Si no es JSON válido, usar el texto directamente
            result = { message: responseText };
          }
          
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'El trámite ha sido enviado correctamente.',
          });
          
          // Aquí puedes agregar lógica adicional como refrescar datos, etc.
          
        } else {
          // Mostrar error específico del servidor
          let errorMessage = `Error HTTP: ${response.status}`;
          
          try {
            const errorData = JSON.parse(responseText);
            if (errorData.message || errorData.error) {
              errorMessage += ` - ${errorData.message || errorData.error}`;
            }
          } catch (e) {
            if (responseText) {
              errorMessage += ` - ${responseText}`;
            }
          }
          
          throw new Error(errorMessage);
        }
        
      } catch (error) {
        // console.error('Error completo al enviar el trámite:', error);
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Ocurrió un error al enviar el trámite: ${error}`,
        });
      }
    }

    parseWebDAVResponse(xml: string): any[] {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        removeNSPrefix: true,
      });

      const jsonObj = parser.parse(xml);
      const responses = jsonObj.multistatus?.response;
      if (!responses) return [];

      const basePath = '/remote.php/dav/files/administrador/';

      return (Array.isArray(responses) ? responses : [responses])
        .map((resp: any) => {
          try {
            const href = resp.href || '';
            const propstat = Array.isArray(resp.propstat) ? resp.propstat[0] : resp.propstat;
            const props = propstat?.prop;

            if (!props) {
              // console.warn('Respuesta sin props:', resp);
              return null;
            }

            const name = decodeURIComponent(href.split('/').filter(Boolean).pop() || '');
            const isDirectory = props.resourcetype?.collection !== undefined;

            // ✨ Aquí limpiamos el path:
            let cleanPath = href;
            if (cleanPath.startsWith(basePath)) {
              cleanPath = cleanPath.replace(basePath, '');
            }
            cleanPath = cleanPath.replace(/^\/+|\/+$/g, ''); // sin slashes al inicio/final

            return {
              name,
              path: cleanPath,
              isDirectory,
              size: parseInt(props.getcontentlength || '0', 10),
              lastModified: props.getlastmodified ? new Date(props.getlastmodified).toISOString() : null,
              icon: isDirectory ? '📁' : '📄',
            };
          } catch (error) {
            // console.error('Error al procesar response:', resp, error);
            return null;
          }
        })
        .filter((item) => item !== null);
    }     

    mostrarArchivos(titulo: string, data: any, tipo: string): void {
      let files: any[] = [];

      try {
        if (typeof data === 'string') {
          files = this.parseWebDAVResponse(data);
        } else {
          files = data;
        }

        const documentos = files.filter(file =>
          !file.isDirectory &&
          /\.(pdf|doc|docx|xls|xlsx|txt|rtf)$/i.test(file.name)
        ).slice(0, 5);
        
        const imagenes = files.filter(file =>
          !file.isDirectory &&
          /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(file.name)
        ).slice(0, 10);               

        const archivosRelevantes = [...documentos, ...imagenes];

        if (archivosRelevantes.length === 0) {
          Swal.fire({
            icon: 'info',
            title: titulo,
            text: 'No se encontraron documentos o imágenes',
            showConfirmButton: true,
            confirmButtonText: 'Volver al Detalle',
            showCancelButton: true,
            cancelButtonText: 'Cerrar'
          }).then((result) => {
            if (result.isConfirmed && this.currentModalData) {
              this.mostrarModalDetalle(this.currentModalData, this.currentUrlPath);
            }
          });
          return;
        }

        let contenidoHtml = `
          <div style="max-height: 400px; overflow-y: auto; text-align: left;">
            <div style="display: grid; gap: 12px;">
        `;

        archivosRelevantes.forEach((file, index) => {
          const sizeFormatted = this.formatFileSize(file.size);
          const dateFormatted = file.lastModified ?
            new Date(file.lastModified).toLocaleDateString('es-ES') : 'N/D';

          const tipoArchivo = /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(file.name) ? 'Imagen' : 'Documento';
          const fileUrl = `/api/preview?path=${encodeURIComponent(file.path)}`;

          contenidoHtml += `
            <div id="file-item-${index}" style="
              display: flex; 
              align-items: center; 
              padding: 15px; 
              border: 1px solid #e0e0e0; 
              border-radius: 8px;
              background: #ffffff;
              cursor: pointer;
              transition: background-color 0.2s;
            ">
              <span style="font-size: 28px; margin-right: 15px;">${file.icon}</span>
              <div style="flex: 1;">
                <div style="font-weight: bold; color: #333; font-size: 14px;">
                  ${file.name}
                </div>
                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                  ${tipoArchivo} • ${sizeFormatted} • ${dateFormatted}
                </div>
              </div>
              <button id="btn-open-${index}" style="
                padding: 8px 16px; 
                background: #007bff; 
                color: white; 
                border: none; 
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
                transition: background-color 0.2s;
              ">
                Abrir
              </button>
            </div>
          `;
        });

        contenidoHtml += `
            </div>
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
              Total: ${archivosRelevantes.length} archivo${archivosRelevantes.length === 1 ? '' : 's'} 
              (${documentos.length} documento${documentos.length === 1 ? '' : 's'}, ${imagenes.length} imagen${imagenes.length === 1 ? '' : 'es'})
            </div>
          </div>
        `;

        Swal.fire({
          title: titulo,
          html: contenidoHtml,
          width: 700,
          showConfirmButton: true,
          confirmButtonText: '← Volver al Detalle',
          showCancelButton: true,
          cancelButtonText: 'Cerrar',
          customClass: {
            htmlContainer: 'swal-no-padding'
          },
          didOpen: () => {
            archivosRelevantes.forEach((file, index) => {
              const fileUrl = `http://120.40.73.66:3000/api/preview?path=${encodeURIComponent(file.path)}`;
              const divItem = document.getElementById(`file-item-${index}`);
              const btnOpen = document.getElementById(`btn-open-${index}`);
          
              if (divItem) {
                divItem.style.cursor = 'pointer';
                divItem.onmouseover = () => { divItem.style.backgroundColor = '#f8f9fa'; };
                divItem.onmouseout = () => { divItem.style.backgroundColor = '#ffffff'; };
                divItem.onclick = () => window.open(fileUrl, '_blank');
              }
          
              if (btnOpen) {
                btnOpen.onmouseover = () => { btnOpen.style.backgroundColor = '#0056b3'; };
                btnOpen.onmouseout = () => { btnOpen.style.backgroundColor = '#007bff'; };
                btnOpen.onclick = (ev) => {
                  ev.stopPropagation();
                  window.open(fileUrl, '_blank');
                };
              }
            });
          }          
        }).then((result) => {
          // Si el usuario hace clic en "Volver al Detalle"
          if (result.isConfirmed && this.currentModalData) {
            this.mostrarDetalleTramite(this.currentModalData, this.currentUrlPath);
          }
        });

      } catch (error) {
        console.error('Error al parsear archivos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron procesar los archivos',
          showConfirmButton: true,
          confirmButtonText: 'Volver al Detalle',
          showCancelButton: true,
          cancelButtonText: 'Cerrar'
        }).then((result) => {
          if (result.isConfirmed && this.currentModalData) {
            this.mostrarDetalleTramite(this.currentModalData, this.currentUrlPath);
          }
        });
      }
    }
    
    // Función para obtener icono según tipo de archivo (sin cambios)
    getFileIcon(fileName: string): string {
      if (!fileName) return '📄';
      
      const extension = fileName.split('.').pop()?.toLowerCase();
      
      const iconMap: { [key: string]: string } = {
        // Documentos
        'pdf': '📄',
        'doc': '📝',
        'docx': '📝',
        'xls': '📊',
        'xlsx': '📊',
        'ppt': '📊',
        'pptx': '📊',
        'txt': '📃',
        'rtf': '📝',
        
        // Imágenes
        'jpg': '🖼️',
        'jpeg': '🖼️',
        'png': '🖼️',
        'gif': '🖼️',
        'bmp': '🖼️',
        'svg': '🖼️',
        'webp': '🖼️',
        
        // Archivos comprimidos
        'zip': '🗜️',
        'rar': '🗜️',
        '7z': '🗜️',
        'tar': '🗜️',
        'gz': '🗜️',
        
        // Audio
        'mp3': '🎵',
        'wav': '🎵',
        'flac': '🎵',
        'aac': '🎵',
        
        // Video
        'mp4': '🎬',
        'avi': '🎬',
        'mkv': '🎬',
        'mov': '🎬',
        
        // Código
        'js': '💻',
        'ts': '💻',
        'html': '🌐',
        'css': '🎨',
        'json': '📋'
      };
      
      return iconMap[extension || ''] || '📄';
    }
    
    // Función para formatear tamaño de archivo (sin cambios)
    formatFileSize(bytes: number): string {
      if (!bytes || bytes === 0) return '0 B';
      
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let size = bytes;
      let unitIndex = 0;
      
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      
      return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
    }

    // Método principal para guardar archivos (con progreso visual)
    async guardarUsuario(): Promise<void> {
      const totalArchivos = Object.keys(this.imagenesSeleccionadas).length;

      if (this.num_tramite) {
        const partes = this.num_tramite.split('-');
        if (partes.length === 3) {
          this.urlPath = `/${partes[0]}/${partes[1]}/${partes[2]}/`;
        }
      }

      const form = this.formularioUsuarios.value;
      const payload = new URLSearchParams();

      payload.set('numeroTramite', this.num_tramite); 
      payload.set('cedula', form.cedula);
      payload.set('idDepartamento', form.tipo); 
      payload.set('idContribu', this.id_contribu); 
      payload.set('solicitante', form.nombre_solicitante);
      payload.set('beneficiario', form.nombre_beneficiario); 
      payload.set('numOficio', form.no_oficio);
      payload.set('asunto', form.asunto);
      payload.set('infoAdicional', form.referencia);
      payload.set('username', this.username); 
      payload.set('urlPath', this.urlPath);
      payload.set('tipoTramite', this.tipoTramite);

      this.http.post(
        API_ROUTES.ALCALDIA.CREAR_TRAMITE,
        payload.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      ).subscribe({
        next: async (res: any) => {
          //console.log(res);
          if (res.motivo_error === 'DUPLICIDAD') {
            Swal.fire({
              icon: 'warning',
              title: 'Número de trámite duplicado',
              text: 'Se detectó que el número de trámite ya existe. Se generará uno nuevo, intenta nuevamente.'
            }).then(() => {
              this.obtenerNumeroTramite();
              this.limpiarInputsDeArchivo();
            });
            return;
          }
          const totalArchivos = Object.keys(this.imagenesSeleccionadas).length;
      
          if (totalArchivos === 0) {
            Swal.fire('Info', 'No hay archivos para subir', 'info');
            return;
          }
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
            Swal.fire('¡Éxito!', 'El trámite fue registrado correctamente', 'success').then(() => {
              this.formularioUsuarios.reset();
              this.imagenesSeleccionadas = {};
              this.limpiarInputsDeArchivo();
            });
          }
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo guardar el trámite', 'error');
        }
      });
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

    // ✅ MÉTODO MEJORADO: Subida secuencial (uno por uno)
    private async subirImagenesConProgreso(): Promise<boolean> {
      const archivos = Object.entries(this.imagenesSeleccionadas);
      let archivosExitosos = 0;
      let archivosConError = 0;
      
      // Obtener el valor de form.tipo
      const form = this.formularioUsuarios.value;
      const tipoFormulario = form.tipo || 'default'; // Usar 'default' si no hay tipo
      
      //console.log(`Iniciando subida secuencial de ${archivos.length} archivos con tipo: ${tipoFormulario}`);
      
      for (const [numeroImagen, archivo] of archivos) {
        const numeroImg = parseInt(numeroImagen);
        
        try {
          this.actualizarEstadoImagen(numeroImg, 'Subiendo...', '#ff9800');
          
          if (archivosExitosos > 0) {
            await this.delay(800);
          }
          
          // Pasar el tipoFormulario como parámetro
          const resultado = await this.subirImagenConProgreso(archivo as File, numeroImg, tipoFormulario);
          
          archivosExitosos++;
          //console.log(`✅ Archivo ${numeroImg} subido exitosamente a tipo: ${tipoFormulario}`);
          
        } catch (error) {
          archivosConError++;
          console.error(`❌ Error subiendo archivo ${numeroImg}:`, error);
          
          // Actualizar estado visual del error
          this.actualizarEstadoImagen(numeroImg, '❌ Error', '#f44336');
        }
      }
      
      // Mostrar resumen final
      //console.log(`Subida completada: ${archivosExitosos} exitosos, ${archivosConError} con error`);
      
      if (archivosConError > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Subida parcial',
          text: `${archivosExitosos} archivos subidos correctamente, ${archivosConError} con errores.`,
          confirmButtonText: 'Continuar'
        });
      }
      
      // Retornar true si al menos un archivo se subió exitosamente
      return archivosExitosos > 0;
    }

    // ✅ MÉTODO MEJORADO: Subida individual con reintentos
    private subirImagenConProgreso(file: File, numeroImagen: number, tipoFormulario: string): Promise<any> {
      return new Promise(async (resolve, reject) => {
        const maxReintentos = 3;
        
        for (let intento = 1; intento <= maxReintentos; intento++) {
          try {
            // Si es un reintento, mostrar en el estado
            if (intento > 1) {
              this.actualizarEstadoImagen(numeroImagen, `Reintento ${intento}/${maxReintentos}...`, '#ff9800');
              await this.delay(1000 * intento); // Pausa progresiva
            }
            
            const formData = new FormData();
            
            // Determinar el tipo de archivo
            const extension = file.name.split('.').pop()?.toLowerCase();
            const tipoArchivo = extension === 'pdf' ? 'Documents' : 'Photos';
            
            // Construir el path jerárquico basado en el número de trámite + form.tipo
            const pathBase = this.construirPathJerarquico(this.num_tramite, tipoArchivo, tipoFormulario);
            const path = `${pathBase}/${numeroImagen}_${file.name}`;
            
            formData.append('file', file);
            formData.append('path', path);
    
            //console.log(`Intento ${intento} - Subiendo archivo ${numeroImagen} a: ${path}`);
    
            // Realizar la petición HTTP
            const resultado = await this.realizarPeticionSubida(formData, numeroImagen);
            
            // Si llegamos aquí, la subida fue exitosa
            this.actualizarEstadoImagen(numeroImagen, '✅ Completado', '#4caf50');
            resolve(resultado);
            return; // Salir del bucle de reintentos
            
          } catch (error: any) {
            console.error(`Error en intento ${intento} para archivo ${numeroImagen}:`, error);
            
            // Si es el último intento, rechazar
            if (intento === maxReintentos) {
              this.actualizarEstadoImagen(numeroImagen, '❌ Error final', '#f44336');
              reject(error);
              return;
            }
            
            // Si es error 423 (Locked), reintentar
            if (error.status === 423) {
              //console.log(`Archivo ${numeroImagen} bloqueado, reintentando...`);
              continue;
            }
            
            // Para otros errores, también reintentar
            //console.log(`Error ${error.status} en archivo ${numeroImagen}, reintentando...`);
          }
        }
      });
    }

    // ✅ MÉTODO AUXILIAR: Realizar petición HTTP como Promise (versión tipada)
    private realizarPeticionSubida(formData: FormData, numeroImagen: number): Promise<any> {
      return new Promise((resolve, reject) => {
        this.http.post('http://120.40.73.66:3000/api/upload', formData, {
          reportProgress: true,
          observe: 'events'
        }).subscribe({
          next: (event: HttpEvent<any>) => {
            switch (event.type) {
              case HttpEventType.UploadProgress:
                if (event.total) {
                  const percentDone = Math.round(100 * event.loaded / event.total);
                  this.actualizarProgresoImagen(numeroImagen, percentDone);
                }
                break;
                
              case HttpEventType.Response:
                resolve(event.body);
                break;
            }
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    }

    // ✅ MÉTODO AUXILIAR: Pausa/delay
    private delay(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    private construirPathJerarquico(numTramite: string, tipoArchivo: string, tipoFormulario: string): string {
      if (!numTramite) {
        console.warn('Número de trámite no disponible, usando estructura por defecto');
        return `${tipoFormulario}/${tipoArchivo}`;
      }
      
      // Dividir el número de trámite: LLTRE-2025-00002
      const partes = numTramite.split('-');
      
      if (partes.length >= 3) {
        const prefijo = partes[0];        // LLTRE
        const año = partes[1];            // 2025
        const numero = partes[2];         // 00002
        
        // Construir path: LLTRE/2025/00002/form.tipo/Photos (o Documents)
        return `${prefijo}/${año}/${numero}/${tipoFormulario}/${tipoArchivo}`;
      } else {
        // Si el formato no es el esperado, usar el número completo como carpeta
        console.warn('Formato de número de trámite inesperado:', numTramite);
        return `${numTramite}/${tipoFormulario}/${tipoArchivo}`;
      }
    }

    private obtenerPathBaseTramite(): string {
      if (!this.num_tramite) {
        return '';
      }
      
      const numTramiteStr = String(this.num_tramite);
      const partes = numTramiteStr.split('-');
      if (partes.length >= 3) {
        return `${partes[0]}/${partes[1]}/${partes[2]}`;
      }
      return numTramiteStr;
    }

    // ✅ MÉTODO MEJORADO: Actualizar estado con mejor manejo de errores
    private actualizarEstadoImagen(numeroImagen: number, estado: string, color: string): void {
      try {
        const statusElement = document.getElementById(`status-${numeroImagen}`);
        if (statusElement) {
          statusElement.textContent = estado;
          statusElement.style.color = color;
        }
      } catch (error) {
        console.warn(`No se pudo actualizar el estado visual del archivo ${numeroImagen}`);
      }
    }

    // ✅ MÉTODO MEJORADO: Actualizar progreso con mejor manejo de errores
    private actualizarProgresoImagen(numeroImagen: number, porcentaje: number): void {
      try {
        const progressBar = document.getElementById(`progress-${numeroImagen}`);
        const percentText = document.getElementById(`percent-${numeroImagen}`);
        
        if (progressBar) {
          progressBar.style.width = `${porcentaje}%`;
        }
        if (percentText) {
          percentText.textContent = `${porcentaje}%`;
        }
      } catch (error) {
        console.warn(`No se pudo actualizar el progreso visual del archivo ${numeroImagen}`);
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
        
        // Limpiar el input después del error
        this.limpiarFileUpload(event);
        return;
      }
      
      // Validar tamaño de archivo
      if (!this.validarTamanoArchivo(file, numeroImagen)) {
        const limite = numeroImagen === 2 || numeroImagen === 4 ? '10MB' : '5MB';
        Swal.fire('Error', `El archivo excede el tamaño máximo permitido de ${limite}`, 'error');
        
        // Limpiar el input después del error
        this.limpiarFileUpload(event);
        return;
      }
      
      // Almacenar el archivo
      this.imagenesSeleccionadas[numeroImagen] = file;
      //console.log('Estado después de almacenar:', this.imagenesSeleccionadas);
      //console.log(`Archivo ${numeroImagen} almacenado:`, file.name);
      
      // Mostrar confirmación visual
      this.mostrarArchivoSeleccionado(numeroImagen, file);
      
      // Limpiar el input para permitir nueva selección
      this.limpiarFileUpload(event);
      
      // Al final, limpiar el FileUpload específico
      this.limpiarFileUploadEspecifico(numeroImagen);
    }

    limpiarFileUploadEspecifico(numeroImagen: number): void {
      let fileUpload: FileUpload;
      
      switch(numeroImagen) {
        case 1: fileUpload = this.fileUpload1; break;
        case 2: fileUpload = this.fileUpload2; break;
        case 3: fileUpload = this.fileUpload3; break;
        case 4: fileUpload = this.fileUpload4; break;
        default: return;
      }
      
      if (fileUpload) {
        fileUpload.clear();
      }
    }
    
    // Método auxiliar para limpiar el FileUpload
    limpiarFileUpload(event: any): void {
      // Limpiar el array de archivos
      if (event.files) {
        event.files.length = 0;
      }
      
      // Limpiar el input HTML subyacente
      const input = event.target || event.currentTarget;
      if (input && input.value) {
        input.value = '';
      }
    }

    cambiarArchivo(numeroImagen: number): void {
      // Limpiar el archivo almacenado
      delete this.imagenesSeleccionadas[numeroImagen];
      
      // Limpiar el FileUpload
      this.limpiarFileUploadEspecifico(numeroImagen);
      
      // Opcional: trigger del click en el input
      setTimeout(() => {
        const fileUpload = this.getFileUploadByNumber(numeroImagen);
        if (fileUpload && fileUpload.basicFileInput) {
          fileUpload.basicFileInput.nativeElement.click();
        }
      }, 100);
    }
    
    getFileUploadByNumber(numeroImagen: number): FileUpload | null {
      switch(numeroImagen) {
        case 1: return this.fileUpload1;
        case 2: return this.fileUpload2;
        case 3: return this.fileUpload3;
        case 4: return this.fileUpload4;
        default: return null;
      }
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

    ngAfterViewInit() {
      this.initFloatingLabels();
    }

    initFloatingLabels() {
      // Para inputs normales y textareas
      const inputs = document.querySelectorAll('.floating-input, .floating-textarea');
      inputs.forEach(input => {
        const label = input.nextElementSibling as HTMLElement;
        
        // Verificar si ya tiene valor al cargar
        this.checkInputValue(input as HTMLInputElement, label);
        
        // Eventos de focus y blur
        input.addEventListener('focus', () => {
          if (label) label.classList.add('active');
        });
        
        input.addEventListener('blur', () => {
          this.checkInputValue(input as HTMLInputElement, label);
        });
        
        // Evento de input para detectar cambios
        input.addEventListener('input', () => {
          this.checkInputValue(input as HTMLInputElement, label);
        });
      });

      // Para dropdowns de PrimeNG
      const dropdowns = document.querySelectorAll('.floating-label-container .p-dropdown');
      dropdowns.forEach(dropdown => {
        const label = dropdown.nextElementSibling as HTMLElement;
        
        dropdown.addEventListener('click', () => {
          if (label) label.classList.add('active');
        });
      });

      // Para calendarios de PrimeNG
      const calendars = document.querySelectorAll('.floating-label-container .p-calendar');
      calendars.forEach(calendar => {
        const label = calendar.nextElementSibling as HTMLElement;
        
        calendar.addEventListener('click', () => {
          if (label) label.classList.add('active');
        });
      });
    }

    checkInputValue(input: HTMLInputElement, label: HTMLElement) {
      if (input.value.trim() !== '') {
        if (label) label.classList.add('active');
      } else {
        if (label) label.classList.remove('active');
      }
    }

    // Método para detectar cambios en FormControl (si usas Reactive Forms)
    onFormControlChange(controlName: string) {
      setTimeout(() => {
        const input = document.querySelector(`[formControlName="${controlName}"]`) as HTMLInputElement;
        const container = input?.closest('.floating-label-container');
        const label = container?.querySelector('.floating-label') as HTMLElement;
        
        if (input && label) {
          this.checkInputValue(input, label);
        }
      }, 100);
    }

    limpiarInputsDeArchivo() {
      this.fileUpload1?.clear();
      this.fileUpload2?.clear();
      this.fileUpload3?.clear();
      this.fileUpload4?.clear();
      this.imagenesSeleccionadas = {}; // Limpiar también el objeto
    }
    
}
