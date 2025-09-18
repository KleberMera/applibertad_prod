import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventsService } from '@data/services/api/consult/events.service';
import { SearchEmployeeService } from '@data/services/api/consult/search-empoyee.service';
import { AsistenciaService } from '@data/services/api/insert/asistencia.service';

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.component.html',
  styleUrl: './asistencia.component.scss'
})
export class AsistenciaComponent implements OnInit {

  formularioAsistencia!: FormGroup; // Propiedad para el formulario
  events: any[] = [];
  errorMessage = '';

  cedula: string = ''; // Variable para almacenar el valor del campo de entrada
  botonBuscarHabilitado: boolean = false; // Bandera para indicar si el botón de búsqueda debe estar habilitado
  mostrarCampos: boolean = false; 

  constructor(
    private fb: FormBuilder,
    private eventsService: EventsService,
    private asistenciaService : AsistenciaService,
    private searchEmployeeService: SearchEmployeeService // Inyecta el servicio SearchEmployeeService
  ) { 
    // Inicializa el formulario
    this.formularioAsistencia = this.fb.group({
      selectedEvent: [null],
      cedula: [''],
      nombre: [''],
      departamento : [''],
      cargo : ['']
    });
  }


  ngOnInit(): void {
     // Carga los eventos desde el servicio
     this.eventsService.getEvents().subscribe(
      response => {
        if (!response.error) {
          this.events = response.data;
          if (this.events.length > 0) {
            // Selecciona el primer evento por defecto
            this.formularioAsistencia.patchValue({ selectedEvent: this.events[0] });
            //console.log('dato ', this.events[0]);
            // Habilita el campo después de establecer el valor por defecto
            const selectedEventControl = this.formularioAsistencia.get('selectedEvent');
            // if (selectedEventControl) {
            //   selectedEventControl.disable();
            // } 
          }
        } else {
          this.errorMessage = response.msg;
        }
      },
      error => {
        this.errorMessage = 'Error en la solicitud: ' + error.message;
      }
    );
    
  }

  validarCedula(): void {
    const cedulaControl = this.formularioAsistencia.get('cedula');
    if (cedulaControl) { // Verificamos si cedulaControl existe
      this.botonBuscarHabilitado = cedulaControl.valid && cedulaControl.value.length === 10; // Actualizamos la variable solo si cedulaControl existe
    }
  }

  //Usa el servicio para cargar los datos del empleado
  buscarEmpleado(): void {
    const cedula = this.formularioAsistencia.get('cedula')?.value;
    const data = { cedula: cedula };

    this.searchEmployeeService.searchEmployee(data).subscribe(r => {
      if (!r.error) {
        this.formularioAsistencia.patchValue({
          nombre: r.data.nombres,
          departamento: r.data.departamento,
          cargo: r.data.cargo
        });
        this.mostrarCampos = true;  // Mostrar los campos
      }
    });
  }

  insertarAsistencia(): void {
    const eventoId = this.formularioAsistencia.get('selectedEvent')?.value.eventos_id;
    const cedula = this.formularioAsistencia.get('cedula')?.value;
    const cedulaControl = this.formularioAsistencia.get('cedula');
    
    // Obtén el nombre del usuario directamente del local storage
    const storedUser = localStorage.getItem('currentUserHADev');
    const user = storedUser ? JSON.parse(storedUser).usuario : null;

    // Incluye el nombre del usuario en el objeto data
    const data = { eventoId: eventoId, cedula: cedula, user: user };

    //console.log(data);
    this.asistenciaService.registrarAsistencia(data).subscribe(response => {
      if (response.error) {
        // Manejar el error
        console.error('Error al registrar la asistencia:', response.msg);
      } else {
        // Manejar el éxito
        // Manejar el éxito
        //console.log('Asistencia registrada con éxito:', response.data);
        // Limpiar el contenido de la cédula
        cedulaControl?.setValue('');
        // Ocultar los campos nuevamente
        this.mostrarCampos = false;
      }
    });
  }
  
}