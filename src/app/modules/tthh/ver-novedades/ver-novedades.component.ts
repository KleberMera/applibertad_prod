import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FinancieroService } from '@data/services/financiero/financiero.service';
import { API_ROUTES } from '@data/constants/routes';
import { UsersService } from '@data/services/admin/users.service';
import { AuthService } from '@data/services/api/auth.service';
import { Table } from 'primeng/table';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import Swal from 'sweetalert2';

import jsPDF from 'jspdf';
import autoTable, { ColumnInput, UserOptions, Styles, HAlignType } from 'jspdf-autotable';

import { saveAs } from 'file-saver';
import { firstValueFrom } from 'rxjs';

interface Tipo {
  CODIGO: string;
  DESCRIPCION: string;
  FECHA_CONSULTA: string;
}

interface TipoConceptos {
  CODIGO: string;
  DESCRIPCION: string;
  FECHA_CONSULTA: string;
}

@Component({
  selector: 'app-ver-novedades',
  templateUrl: './ver-novedades.component.html',
  styleUrl: './ver-novedades.component.scss',
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
export class VerNovedadesComponent {
  @ViewChild('tbHistorial') tbhistorial!: Table; // Añade @ViewChild para obtener la referencia a la tabla
  dataHistorial: any[] = [];
    
      tipos: Tipo[] = [];
      selectedTipo: string = '';
      fechaOptions: { label: string, value: string, disabled?: boolean }[] = [];
      selectedFecha: string = '';
      tipos_conceptos: TipoConceptos[] = [];
      selectedTipoConcepto: string = '';
      habilitarBoton: boolean = true; //cambiar
      parteRecibida: string = '';

      errorMessage = '';
      
      formularioVerNovedades!: FormGroup; // Propiedad para el formulario
      formularioVisible: boolean = false;
      formularioVisible2 : boolean = false;
     
      constructor(
        private fb: FormBuilder,
        private financieroService: FinancieroService, // Inyecta el servicio aquí
        private authService: AuthService,
        private http: HttpClient
      ) { 
        this.formularioVerNovedades = this.fb.group({
          periodo: ['', Validators.required],
          tipos_conceptos: ['', Validators.required]
        });
      }
    
      ngOnInit(): void {
        this.mostrarFormulario2();
        this.generarFechasPermitidas();
        this.cargarTipos();
        this.cargarTiposConceptos();
      }

      generarFechasPermitidas() {
        const hoy = new Date();
        const currentYear = hoy.getFullYear();
        const currentMonth = hoy.getMonth() + 1;

        this.fechaOptions = [
          { label: 'Seleccione periodo', value: '', disabled: false }
        ];

        for (let i = 0; i < 6; i++) {
          const date = new Date(currentYear, currentMonth - 1 - i, 1);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const value = `${year}${month.toString().padStart(2, '0')}`;

          const isSelectable =
            (year === currentYear && month === currentMonth) ||
            (year === currentYear && month === currentMonth - 1) ||
            (currentMonth === 1 && year === currentYear - 1 && month === 12);

          this.fechaOptions.push({
            label: value,
            value: value,
            disabled: !isSelectable
          });
        }

        this.selectedFecha = ''; // <-- Esto permite que se muestre "Seleccione periodo"
      }

    onFechaChange(event: any): void {
      this.selectedFecha = event.value;
    }
  
    // Cargar tipos desde la API
    cargarTipos(): void {
      this.http.get(API_ROUTES.TTHH.TIPOEMPLEADO)
        .subscribe({
          next: (response: any) => {
            if (!response.error && response.data) {
              this.tipos = response.data;
            } else {
              console.error('Error al cargar tipos:', response.msg);
            }
          },
          error: (error) => {
            console.error('Error en la petición de tipos:', error);
          }
        });
    }

    cargarTiposConceptos(): void {
      this.http.get(API_ROUTES.TTHH.ROLESCONCEPTOS)
        .subscribe({
          next: (response: any) => {
            if (!response.error && response.data) {
              this.tipos_conceptos = response.data;
            } else {
              console.error('Error al cargar tipos:', response.msg);
            }
          },
          error: (error) => {
            console.error('Error en la petición de tipos:', error);
          }
        });
    }
  
      mostrarFormulario(): void {
        this.formularioVisible = true;
        // this.formularioVisible2 = false;
        // this.recaudaciones = [];
      }
  
      mostrarFormulario2(): void {
        this.formularioVisible2 = true;
        this.formularioVisible = false;
        this.formularioVerNovedades.reset();
    
      }
    
      ocultarFormulario(): void {
        this.formularioVisible = false;
        this.formularioVerNovedades.reset();
      }
  
      ocultarFormulario2(): void {
        this.dataHistorial = [];
        this.formularioVerNovedades.reset();
        if (this.tbhistorial) {
          this.tbhistorial.reset();
          this.tbhistorial.clear();
        }
      }
    
      applyFilterGlobal(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement) {
          const filterValue = inputElement.value;
          this.tbhistorial.filterGlobal(filterValue, 'contains');
        }
      }
    
      loadDataCM(): void {
        const formData = this.formularioVerNovedades.value;

        if (formData.periodo && formData.tipos_conceptos) {
          let params = new HttpParams()
            .set('periodo', formData.periodo)
            .set('idConcepto', formData.tipos_conceptos);

          const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

          Swal.fire({
            title: 'Consultando datos...',
            text: 'Por favor, espere un momento.',
            icon: 'info',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
          });

          this.http.post(API_ROUTES.TTHH.VERNOVEDADES, params.toString(), { headers })
            .subscribe({
              next: (response: any) => {
                Swal.close();

                if (!response.error && response.data && response.data.length > 0) {
                  this.dataHistorial = response.data;
                  this.mostrarFormulario();
                  if (this.tbhistorial) {
                    this.tbhistorial.reset();
                  }
                  console.log(this.dataHistorial);
                  // this.parteRecibida =  
                } else {
                  this.dataHistorial = [];
                  
                  Swal.fire({
                    title: 'Datos no encontrados',
                    text: 'No se encontraron datos para la consulta realizada.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Ok',
                  }).then((result) => {
                    this.ocultarFormulario2();
                  });
                }
              },
              error: (error) => {
                // Limpiar datos en caso de error
                this.dataHistorial = [];
                
                this.ocultarFormulario2();
                Swal.close();
                console.error('Error en la consulta:', error);
                Swal.fire({
                  title: 'Datos no encontrados',
                  text: 'No se encontraron conceptos subidos para la consulta realizada.',
                  icon: 'warning',
                  confirmButtonText: 'Ok'
                });
              }
            });
        } else {
          Swal.fire('Error', 'Debe ingresar ambos campos para la consulta', 'error');
          this.ocultarFormulario2();
        }
      }

      editarCampo(persona: any): void {
        const usuarioActual = this.authService.getUser;
        const username = usuarioActual?.username;

        Swal.fire({
          title: 'Editar Valor',
          html: `
            <p><strong>Empleado:</strong> ${persona.EMPLEADO}</p>
            <p><strong>Cédula:</strong> ${persona.CEDULA}</p>
            <label><strong>Nuevo Valor:</strong></label><br/>
            <input id="nuevoValor" type="number" class="swal2-input" value="${persona.VALOR}">
          `,
          icon: 'info',
          confirmButtonText: 'Guardar',
          showCancelButton: true
        }).then((result) => {
          if (result.isConfirmed) {
            const nuevoValor = (document.getElementById('nuevoValor') as HTMLInputElement).value;
            
            if (!nuevoValor || isNaN(+nuevoValor)) {
              Swal.fire('Error', 'Debes ingresar un número válido', 'error');
              return;
            }

            // Modal de confirmación
            Swal.fire({
              title: '¿Está seguro?',
              html: `
                <p>¿Confirma el cambio del valor?</p>
                <p><strong>Valor anterior:</strong> ${persona.VALOR}</p>
                <p><strong>Valor nuevo:</strong> ${nuevoValor}</p>
              `,
              icon: 'question',
              showCancelButton: true,
              confirmButtonText: 'Sí, cambiar',
              cancelButtonText: 'Cancelar',
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33'
            }).then((confirmResult) => {
              if (confirmResult.isConfirmed) {
                // Mostrar loading
                Swal.fire({
                  title: 'Actualizando...',
                  allowOutsideClick: false,
                  didOpen: () => {
                    Swal.showLoading();
                  }
                });

                // Hacer la petición
                const params = new HttpParams()
                  .set('periodo', persona.PERIODO)
                  .set('parte', persona.PARTE)
                  .set('idPer', persona.ID_PER)
                  .set('tipCpt', persona.TIPCPT)
                  .set('concepto', persona.CONCEPTO)
                  .set('valor', nuevoValor)
                  .set('numero', persona.NUMERO);

                const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

                this.http.post(API_ROUTES.TTHH.EDITARROL, params.toString(), { headers })
                  .subscribe({
                    next: (response) => {
                      Swal.fire('Actualizado', 'El valor ha sido actualizado con éxito.', 'success')
                        .then(() => {
                          this.loadDataCM();
                        });
                    },
                    error: (error) => {
                      Swal.fire('Error', 'No se pudo actualizar el valor.', 'error');
                    }
                  });
              }
            });
          }
        });
      }
}
