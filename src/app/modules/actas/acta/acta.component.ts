import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActaService } from '@data/services/api/actas/acta.service';
import { ComponenteService } from '@data/services/api/componentes/componente.service';
import { UsuariosService } from '@data/services/api/usaurios/usuarios.service';
import { Table } from 'primeng/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-acta',
  templateUrl: './acta.component.html',
  styleUrl: './acta.component.scss'
})
export class ActaComponent {

  @ViewChild('tbComponentes') tbComponentes!: Table; // Añade @ViewChild para obtener la referencia a la tabla

  usuarioEntrega : string | undefined;; //
  formularioActas! : FormGroup;
  componentes: any[] = [];
  componenteResponse : any[] = [];
  agregados : any[] = [];
  //porAgregar : any[] = [];

  fecEntrega: Date | undefined;
  fecRecepcion: Date | undefined;

  //VARIABLES PARA GUARDAR EL ID DE LOS USUARIOS
  usuarioIDEntrega : any;
  usuarioIDRecibe : any;

  nombreEntrega : string | undefined;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private componentesService: ComponenteService,
    private actasService : ActaService
  ) { }

  ngOnInit(): void {

        
    this.formularioActas = this.fb.group({
      usuarioEntrega: ['', Validators.required],
      usuarioEntregaNombre: ['', Validators.required], // Campo de texto requerido
      usuarioEntregaDepart: ['', Validators.required], // Campo de texto requerido
      usuarioRecibe: ['', Validators.required],
      usuarioRecibeNombre: ['', Validators.required], // Campo de texto requerido
      usuarioRecibeDepart: ['', Validators.required], // Campo de texto requerido
      codComponente: ['', Validators.required], // Campo de texto requerido
      tipoComponente: ['', Validators.required],
      estadoComponente: ['', Validators.required], 
      marca: ['', Validators.required],  // Campo de fecha requerido
      modelo: ['', Validators.required],  // Campo de fecha requerido
      numeroserie: ['', Validators.required],  // Campo de fecha requerido
      //selectedEstado: ['', Validators.required], //
      fechaEntrega : ['', Validators.required],
      fechaRecepcion: ['', Validators.required],
      observaciones: ['', Validators.required]

    });
    // this.obtenerComponentes();
    
    // Carga los tipos de componentes desde el servicio
    
  
  }
  

  restablecerActa(){
    this.formularioActas.reset();   
    this.componentes = []; 
    this.agregados = []; 
  }


  applyFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      const filterValue = inputElement.value;
      this.tbComponentes.filterGlobal(filterValue, 'contains');
    }
  }

 
  validateNumber(event: any) {
    const keyCode = event.keyCode;
    const isNumber = /^\d$/.test(event.key); // Verifica si el valor ingresado es un número

    // Permite las teclas de retroceso (Backspace), tabulación (Tab), flechas de navegación (flecha izquierda y flecha derecha), inicio (Inicio) y fin (Fin)
    const validKeys = [8, 9, 37, 39, 36, 35];

    if (!isNumber && !validKeys.includes(keyCode)) {
        event.preventDefault();
    }
  }

  buscaUsuario(flag : number) {
    if(flag == 1){
      const cedula = this.formularioActas.get('usuarioEntrega')!.value; // Obtener la cédula del formulario

      if (cedula != null && cedula != '') {
        const data = { cedula }; // Crear el objeto data con la cédula
      
        // Llamar al servicio para cargar el usuario por cédula
        this.usuariosService.loadUsuarioCed(data).subscribe(response => {
          if (!response.error) {
            ////console.log(response.data.length);
            if (response.data.length === 0) {
              Swal.fire({
                icon: 'warning',
                title: 'Atención!',
                text: response.msg,
                confirmButtonText: 'Ok'
              });
            }else{
              // Si no hay error en la respuesta, asignar los datos al componente
              //this.componentes = response.data;
              //console.log(response.data.data[0]);
              this.usuarioIDEntrega = response.data.data[0].usuarioid;
              this.formularioActas.get('usuarioEntregaNombre')?.setValue(response.data.data[0].nombre  + ' ' + response.data.data[0].apellido);
              this.formularioActas.get('usuarioEntregaDepart')?.setValue(response.data.data[0].departamento);
              //this.nombreEntrega = response.data.data[0].nombre;
            }
          } else {
            // Si hay un error en la respuesta, mostrar un mensaje de error
            console.error('Error al cargar el usuario:', response.msg);
            // Aquí puedes mostrar un mensaje de error al usuario si lo deseas
          }
        });
      }else{
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Ingrese cedula a buscar',
          confirmButtonText: 'Ok'
        });
      }
    }else{
      const cedula = this.formularioActas.get('usuarioRecibe')!.value; // Obtener la cédula del formulario

      if (cedula != null && cedula != '') {
        const data = { cedula }; // Crear el objeto data con la cédula
      
        // Llamar al servicio para cargar el usuario por cédula
        this.usuariosService.loadUsuarioCed(data).subscribe(response => {
          if (!response.error) {
            if (response.data.length === 0) {
              Swal.fire({
                icon: 'warning',
                title: 'Atención!',
                text: response.msg,
                confirmButtonText: 'Ok'
              });
            }else{
              // Si no hay error en la respuesta, asignar los datos al componente
              //this.componentes = response.data;
              //console.log(response.data.data[0]);
              this.usuarioIDRecibe = response.data.data[0].usuarioid;
              this.formularioActas.get('usuarioRecibeNombre')?.setValue(response.data.data[0].nombre  + ' ' + response.data.data[0].apellido);
              this.formularioActas.get('usuarioRecibeDepart')?.setValue(response.data.data[0].departamento);
              //this.nombreEntrega = response.data.data[0].nombre;  
            }
          } else {
            // Si hay un error en la respuesta, mostrar un mensaje de error
            console.error('Error al cargar el usuario:', response.msg);
            // Aquí puedes mostrar un mensaje de error al usuario si lo deseas
          }
        });    
      }else{
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Ingrese cedula a buscar',
          confirmButtonText: 'Ok'
        });
      }
    }
  }


  buscarComp(){
    const codigo = this.formularioActas.get('codComponente')!.value; // Obtener la cédula del formulario

    if (codigo != null && codigo != '') {
      const data = { codigo }; // Crear el objeto data con la cédula
    
      // Llamar al servicio para cargar el usuario por cédula
      this.componentesService.loadCompCod(data).subscribe(response => {
        if (!response.error) {
          //console.log(response.data.length);
          if (response.data.length === 0) {
            Swal.fire({
              icon: 'warning',
              title: 'Atención!',
              text: response.msg,
              confirmButtonText: 'Ok'
            });
          }else{
            // Si no hay error en la respuesta, asignar los datos al componente
            //this.componentes = response.data;
            //console.log(response.data.data[0]);
            this.componenteResponse = response.data.data[0];
            //console.log(this.componenteResponse);
            //this.usuarioIDEntrega = response.data.data[0].usuarioid;
            this.formularioActas.get('tipoComponente')?.setValue(response.data.data[0].componente);
            this.formularioActas.get('estadoComponente')?.setValue(response.data.data[0].estado);
            //this.nombreEntrega = response.data.data[0].nombre;
          }
        } else {
          // Si hay un error en la respuesta, mostrar un mensaje de error
          console.error('Error al cargar el usuario:', response.msg);
          // Aquí puedes mostrar un mensaje de error al usuario si lo deseas
        }
      });
    }else{
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Ingrese componente a buscar',
        confirmButtonText: 'Ok'
      });
    }
  }

  aniadirComponente() {
    // Verifica que componenteResponse no sea null o undefined
    if (this.componenteResponse) {
      // Asegúrate de que componenteResponse es un objeto, no un arreglo
      if (typeof this.componenteResponse === 'object' && !Array.isArray(this.componenteResponse)) {
         // Verifica si el componente ya está en el arreglo
          // Verificar si el arreglo está vacío
          if (this.agregados.length === 0) {
            // Si está vacío, agregar directamente el elemento
            this.agregados.push(this.formularioActas.get('codComponente')?.value);
            this.componentes = [...this.componentes, this.componenteResponse];
    
            // Restablece componenteResponse a null
            this.componenteResponse = [];
    
            // Vacia los campos del formulario
            this.formularioActas.get('codComponente')?.reset();
            this.formularioActas.get('tipoComponente')?.reset();
            this.formularioActas.get('estadoComponente')?.reset();
            //console.log(this.agregados);
          } else {
            // Si no está vacío, recorrer el arreglo y buscar el texto
            let encontrado = false;
            for (const elemento of this.agregados) {
                if (typeof elemento === 'string' && elemento.includes(this.formularioActas.get('codComponente')?.value)) {
                    // Si se encuentra el texto, marcar como encontrado y salir del bucle
                    encontrado = true;
                    break;
                }
            }
            // Si no se encontró el texto, agregarlo
            if (!encontrado) {
                this.agregados.push(this.formularioActas.get('codComponente'));
                this.componentes = [...this.componentes, this.componenteResponse];
  
                // Restablece componenteResponse a null
                this.componenteResponse = [];
        
                // Vacia los campos del formulario
                this.formularioActas.get('codComponente')?.reset();
                this.formularioActas.get('tipoComponente')?.reset();
                this.formularioActas.get('estadoComponente')?.reset();
            }else{
              Swal.fire({
                icon: 'warning',
                title: 'Atención!',
                text: 'El componente ya fue agregado',
                confirmButtonText: 'Ok'
              });
            }
          }
          
          
        
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'No existe componente para agregar',
          confirmButtonText: 'Ok'
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'No existe componente para agregar',
        confirmButtonText: 'Ok'
      });
    }
  }
  

  eliminarItem(componente: { componenteid: any; }) {
    this.componentes = this.componentes.filter(c => c.componenteid !== componente.componenteid);
    // Filtra el arreglo para eliminar el elemento
    this.agregados = this.agregados.filter(elemento => elemento !== this.formularioActas.get('codComponente')?.value);
  }

  guardarActa() {
    const formularioActasValue = this.formularioActas.value;
    const componentesValues = Object.values(this.componentes).map(value => ({
      componenteid: value.componenteid
    }));
  
    const objActa = {
      usuarioentregaid: this.usuarioIDEntrega.toString(),
      usuariorecepcionid: this.usuarioIDRecibe.toString(), 
      fechaentrega: this.formularioActas.get('fechaEntrega')?.value.toISOString().split('T')[0],  // Convertir a formato 'yyyy-mm-dd'
      fecharecepcion: this.formularioActas.get('fechaRecepcion')?.value.toISOString().split('T')[0],  // Convertir a formato 'yyyy-mm-dd'
      comentarios: this.formularioActas.get('observaciones')?.value,
      detalle: JSON.stringify(componentesValues)
    };
  
    Swal.fire({
      title: 'Guardar?',
      text: 'Desea ingresar el acta',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.actasService.insertActa(objActa).subscribe(r => {
          if (!r.error) {
            Swal.fire('Listo', `Datos ingresados correctamente`, 'success').then(() => {
              this.formularioActas.reset();
              this.usuarioIDEntrega=[];
              this.usuarioIDRecibe=[];
              this.componentes=[];
            })
          } else {
            Swal.fire('Error', 'No se pudo ingresar el acta.' + r.msg, 'error');
          }
        });
      }
    });
  }

}
