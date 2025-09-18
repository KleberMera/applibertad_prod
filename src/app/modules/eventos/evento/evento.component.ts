import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Evento } from '@data/interfaces/forms/evento.meadata';
import { EventsService } from '@data/services/api/insert/events.service';


@Component({
  selector: 'app-evento',
  templateUrl: './evento.component.html',
  styleUrl: './evento.component.scss'
})
export class EventoComponent implements OnInit {

  formularioEvento!: FormGroup; // Propiedad para el formulario

  constructor(private fb: FormBuilder, private eventsService: EventsService) { }

  ngOnInit(): void {
    // Inicialización del formulario utilizando FormBuilder
    this.formularioEvento = this.fb.group({
      descripcion: ['', Validators.required], // Campo de texto requerido
      fecha_evento: ['', Validators.required],  // Campo de fecha requerido
      estado: [null] // Campo de estado inicializado como null
    });
  }

   // Método para enviar el formulario
   saveEvent() {
    if (this.formularioEvento.valid) {
      const formData = this.formularioEvento.value;
      
      // Obtener la fecha del formulario
      const fechaEvento = new Date(formData.fecha_evento);
      
      // Formatear la fecha en el formato deseado (yyyy-mm-dd)
      const fechaFormateada = this.formatDate(fechaEvento);
      
      // Establecer la fecha formateada de vuelta en el formulario
      formData.fecha_evento = fechaFormateada;
  
      // Llamar al método insertEvents() del servicio y pasar los datos del formulario
      this.eventsService.insertEvents(formData).subscribe(response => {
        if (!response.error) {
          //console.log('¡Datos guardados exitosamente!');
          // Puedes realizar otras acciones después de guardar los datos, como navegar a otra página
        } else {
          console.error('Error al insertar los datos:', response.msg);
          // Puedes mostrar un mensaje de error o realizar otras acciones en caso de error
        }
      });
    } else {
      // Manejo de errores o validaciones adicionales
      //console.log('Formulario inválido');
    }
  }
  
  // Función para formatear la fecha a yyyy-mm-dd
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Agregar un cero al principio si el mes tiene un solo dígito
    const day = ('0' + date.getDate()).slice(-2); // Agregar un cero al principio si el día tiene un solo dígito
    return `${year}-${month}-${day}`;
  }
  
}