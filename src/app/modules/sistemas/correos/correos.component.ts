import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-correos',
  templateUrl: './correos.component.html',
  styleUrl: './correos.component.scss'
})
export class CorreosComponent {
  // Datos para consulta de cédula
  correoForm: FormGroup;
  identificacion!: string;
  // ip: string = '120.40.73.73:8080';
  //ip: string = 'www.lalibertad.gob.ec';
    ip: string = 'localhost:8080';

  //Para validar la cédula
  validador!: boolean;
  cedula!: String;

  //Captura de datos
  arreglo: any;
  arreglocorreo: any;
  public consultaRequisitos: any;
  public consultaCorreos: any;
  public band = false;
  public estadoContrato = false;
  public bandCorreo = false;
  public idEnviarJson!: string;
  public cedulaEnviarJson!: string;
  public correotthh!:string;
  public correomail!:string;

  // Capturar antes de arroba
  public correoCompleto!: string;
  public partesCorreo: any;
  public partesArroba!: string;
  public placeholder: string = 'Ingrese Correo';

  //Mostrar ventanas
  showDivIngreso = true;
  showCorreosActualizar= true;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    
    ) {
      this.correoForm = this.fb.group({
        cedula: ['', Validators.required],
      });
      
    }

  /**
   * Validación de cédula ecuatoriana
   * @param cedula Valor que recibe como parámetro
   */
  validadorDeCedula(identificacion: String) {
    let cedulaCorrecta = false;
    if (identificacion === '0962502365') {
        cedulaCorrecta = true;
    } else if (identificacion.length == 10) {
        let tercerDigito = parseInt(identificacion.substring(2, 3));
        if (tercerDigito < 6) {
            // El último dígito se considera dígito verificador
            let coefValCedula = [2, 1, 2, 1, 2, 1, 2, 1, 2];
            let verificador = parseInt(identificacion.substring(9, 10));
            let suma: number = 0;
            let digito: number = 0;
            
            for (let i = 0; i < identificacion.length - 1; i++) {
                digito = parseInt(identificacion.substring(i, i + 1)) * coefValCedula[i];
                suma += parseInt((digito % 10) + '') + parseInt(digito / 10 + '');
            }

            suma = Math.round(suma);
            if (Math.round(suma % 10) == 0 && Math.round(suma % 10) == verificador) {
                cedulaCorrecta = true;
            } else if (10 - Math.round(suma % 10) == verificador) {
                cedulaCorrecta = true;
            }
        }
    }

    this.validador = cedulaCorrecta;
  }


  toggleDiv() {
    this.showDivIngreso = !this.showDivIngreso;
  }

  toggleDivClear(){
    window.location.reload();
  }

  toggleAbrirCorreos() {
    // this.showCorreosActualizar = true;
    var id = this.idEnviarJson;
    var cedula = this.cedulaEnviarJson;
    var correotthh = this.correotthh;
    var correomail = this.correomail;

    // Manda en false a todas las banderas
    this.band = false;
    this.estadoContrato = false;
    this.bandCorreo = false;

    // window.location.reload();
    const esqueletoJson = {
      id: id,
      cedula: cedula,
      correo_tthh: correotthh,
      correo_mail: correomail+"@lalibertad.gob.ec"
    }

    console.log(id);

    // const apiUrlCorreo = 'http://'+ this.ip + '/wsLibertad_v2/api/v1/ws/actualizarregistrardatosdecorreo';
    const apiUrlCorreo = 'https://'+ this.ip + '/wsLibertad_v2/api/v1/ws/actualizarregistrardatosdecorreo';

    // Configuración de las cabeceras
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    interface ServerResponse {
      status: boolean; // o el tipo que corresponda
      // Otras propiedades que puedan estar presentes en la respuesta
    }

    let respuesta: any;

    // this.http.put(apiUrlCorreo, esqueletoJson)
    this.http.put<ServerResponse>(apiUrlCorreo, esqueletoJson, httpOptions)
    .subscribe(
      (response:ServerResponse) => {
        respuesta = response;
        //console.log(respuesta.R);
        if(respuesta.R == 'Registro actualizado'){
          Swal.fire({
            imageUrl:'../../../intranet/correos/assets/ciudad_con_pasion.png',
            imageHeight: 40,
            title: '<i class="pi pi-check-circle" style="color: green; font-size: 40px"></i>',
            text: 'Datos actualizados con éxito',
            footer: "GAD Municipal La Libertad",
            confirmButtonColor: 'red',
            confirmButtonText: 'Cerrar',
          }).then(() => {
            this.showDivIngreso = true;
            this.consultaRequisitos = null;
            this.correoForm.get('cedula')?.patchValue("");
            this.correomail = ""; 
            this.placeholder = "Ingrese Correo";
            // this.showDivIngreso = true;
            // window.location.reload();
          });
        } else {
          Swal.fire({
            imageUrl:'../../../intranet/correos/assets/ciudad_con_pasion.png',
            imageHeight: 40,
            title: '<i class="pi pi-check-circle" style="color: green; font-size: 40px"></i>',
            text: 'Datos grabados con éxito',
            footer: "GAD Municipal La Libertad",
            confirmButtonColor: 'red',
            confirmButtonText: 'Cerrar',
          }).then(() => {
            this.showDivIngreso = true;
            this.consultaRequisitos = null;
            this.correoForm.get('cedula')?.patchValue("");
            this.correomail = ""; 
            this.placeholder = "Ingrese Correo";
            // this.showCorreosActualizar = false;
            // window.location.reload();
            // window.location.href = 'http://120.40.73.67:8080/admin/'
          });
        }
        
      },
      (error) => {
        Swal.fire({
          imageUrl:'../../../intranet/correos/assets/ciudad_con_pasion.png',
          imageHeight: 40,
          title: '<i class="pi pi-times-circle" style="color: red; font-size: 100px"></i>',
          text: 'Ha ocurrido un error al procesar la solicitud',
          footer: "GAD Municipal La Libertad",
          confirmButtonColor: 'red',
          confirmButtonText: 'Cerrar',
        }).then(() => {
          this.showDivIngreso = true;
          this.consultaRequisitos = null;
          this.correoForm.get('cedula')?.patchValue("");
          this.correomail = ""; 
          this.placeholder = "Ingrese Correo";
          // this.showDivIngreso = true;
          // window.location.reload();
        });
        console.error('Error al enviar la solicitud:', error);
      }
    );
      
  }

  atras(){
    this.showDivIngreso = true;
    this.consultaRequisitos = null;
    this.correoForm.get('cedula')?.patchValue("");
    this.correomail = ""; 
    this.placeholder = "Ingrese Correo";
  }
    
    
  ngOnInit(){
    this.consultarCorreo();
  }

  /**
   * Consulta los correos
   * @param cedula Variable que se ingresa para su comparación
   */
  consultarCorreo(){
    
    // Url de API
    // const apiUrlRequisitos = 'http://'+ this.ip +'/wsLibertad_v2/api/v1/ws/requisitosconsultacorreo';
    const apiUrlRequisitos = 'https://'+ this.ip +'/wsLibertad_v2/api/v1/ws/requisitosconsultacorreo';
    // const apiUrlCorreo = 'http://'+ this.ip +'/wsLibertad_v2/api/v1/ws/extraerdatosdecorreo';
    const apiUrlCorreo = 'https://'+ this.ip +'/wsLibertad_v2/api/v1/ws/extraerdatosdecorreo';
    
    // Objeto JSON que contiene el parámetro "cedula"
    var cedula = this.identificacion;
    const requestBody = { cedula: cedula };

    // Configuración de las cabeceras
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    //Manda en falso a todo
    this.correoForm.get('cedula')?.patchValue("");
    this.band = false;
    this.estadoContrato = false;
    this.bandCorreo = false;

    this.validadorDeCedula(cedula);
    if(+cedula.length === 10){
      if(this.validador){
        // Swal.fire({            
        //   imageUrl:'../../../assets/ciudad_con_pasion.png',
        //   imageHeight: 40,
        //   title: '<i class="pi pi-check-circle" style="color: green; font-size: 100px"></i>',
        //   text: 'Cédula correcta',
        //   confirmButtonColor: 'green',
        //   confirmButtonText: '<i class="pi pi-check"></i> Volver',
        //   footer: "GAD Municipal La Libertad"
        // });

        this.http.post(apiUrlRequisitos, requestBody, httpOptions)
        .subscribe(
          response => {
            // this.correoCompleto = this.consultaCorreos.CORREO_MAIL;
            // this.partesCorreo = this.correoCompleto.split('@');
            // this.partesArroba = this.partesCorreo[0];
            if(Object.keys(response).length === 0 && response.constructor === Object) {
              // Mostrar un mensaje al usuario indicando que no se encontraron datos para la cédula ingresada
              Swal.fire({            
                imageUrl:'../../../intranet/correos/assets/ciudad_con_pasion.png',
                imageHeight: 40,
                // title: '<i class="pi pi-check" style="color: green"></i> Sin deudas',
                text: 'La cédula ingresada no corresponde a un funcionario',
                confirmButtonColor: 'green',
                confirmButtonText: '<i class="pi pi-check"></i> Volver',
                footer: "GAD Municipal La Libertad"
              }).then(() => {
                this.showDivIngreso = true;
                this.consultaRequisitos = null;
                this.correoForm.get('cedula')?.patchValue("");
                this.placeholder = "Ingrese Correo";
                // this.showDivIngreso = true;
                // window.location.reload();
              });

            } 
            else {
              // console.log(response);
              this.arreglo = Object.values(response);
              for(let index=0;index < this.arreglo.length; index++){
                this.consultaRequisitos = this.arreglo[index];
                if(!this.band){
                  if(this.consultaRequisitos.EXISTE_CP != "0"){
                    this.band = true;
                    //console.log("En el if: "+this.band);
                  }
                  // console.log(this.band);
                  // this.band = false;
                }
                if(!this.estadoContrato){
                  if(this.consultaRequisitos.ESTADO === "A"){
                    this.estadoContrato = true;
                  }
                }
                //console.log("después del if: " + this.band);
                this.http.post(apiUrlCorreo, requestBody, httpOptions)
                .subscribe(
                  response => {
                    // console.log(response);
                    this.arreglocorreo = Object.values(response);
                    for(let index=0; index < this.arreglocorreo.length; index++){
                      this.consultaCorreos = this.arreglocorreo[index];
                      this.idEnviarJson = this.consultaCorreos.ID;
                      this.cedulaEnviarJson = this.consultaCorreos.CEDULA;
                      if(this.consultaCorreos.CORREO_TTHH === " " || this.consultaCorreos.CORREO_TTHH === null){
                        this.correotthh = "";
                      } else {
                        this.correotthh = this.consultaCorreos.CORREO_TTHH;
                      }
                      if(this.consultaCorreos.CORREO_MAIL === " "){
                        
                        this.correomail = "";
                        this.placeholder = "Ingrese Correo";
                      } else if(this.consultaCorreos.CORREO_MAIL === "SIN REGISTRO"){
                        this.placeholder = 'SIN REGISTRO';
                        this.correomail = "";
                      }
                      else {
                        // if(this.correomail === 'SIN REGISTRO'){
                        //   // this.correoForm.get('correomail')?.patchValue(null);
                        //   console.log('Pasa por aquí')
                        //   this.correomail = '';
                        // } else{
                          this.correoCompleto = this.consultaCorreos.CORREO_MAIL;
                          this.partesCorreo = this.correoCompleto.split('@');
                          this.partesArroba = this.partesCorreo[0];
                          this.correomail = this.partesArroba;
                        // }
                      }

                    }
                    // console.log(this.consultaCorreos)
                  }
                );
              } 
            }
          }
        );

        // console.log(this.validador)
      } else {
        Swal.fire({
          imageUrl:'../../../intranet/correos/assets/ciudad_con_pasion.png',
          imageHeight: 40,
          title: '<i class="pi pi-exclamation-triangle" style="color: orange; font-size: 100px"></i>',
          text: 'Cédula incorrecta',
          confirmButtonColor: 'orange',
          confirmButtonText: '<i class="pi pi-check"></i> Volver',
          footer: "GAD Municipal La Libertad"
        }).then(() => {
          // this.showDivIngreso = true;
          // window.location.reload();
          this.showDivIngreso = true;
          this.consultaRequisitos = null;
          this.correoForm.get('cedula')?.patchValue("");
          this.placeholder = "Ingrese Correo";
        });
      }
    } else {
      Swal.fire({
        imageUrl:'../../../intranet/correos/assets/ciudad_con_pasion.png',
        imageHeight: 40,
        title: '<i class="pi pi-exclamation-triangle" style="color: orange; font-size: 100px"></i>',
        text: 'El número de identificación está incompleto',
        confirmButtonColor: 'orange',
        confirmButtonText: '<i class="pi pi-check"></i> Volver',
        footer: "GAD Municipal La Libertad"
      }).then(()=> {
        // this.showDivIngreso = true;
        // window.location.reload();
        this.showDivIngreso = true;
        this.consultaRequisitos = null;
        this.correoForm.get('cedula')?.patchValue("");
        this.placeholder = "Ingrese Correo";
      });
    } 
    this.toggleDiv()
  }
}
