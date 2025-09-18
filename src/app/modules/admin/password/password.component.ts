import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '@data/services/admin/users.service';
import { AuthService } from '@data/services/api/auth.service';
import { Table } from 'primeng/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrl: './password.component.scss',
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


export class PasswordComponent implements OnInit {


  usuarios: any[] = [];
  roles: any[] = [];
  errorMessage = '';

  cedulaSearchValue: string = '';
  
  formularioPassword!: FormGroup; // Propiedad para el formulario
  formularioVisible: boolean = false;
  formularioVisible2 : boolean = false;

  clienteIdEditando: number | null = null; // Propiedad para almacenar el ID del estado en edición
 
  capsLockOn1: boolean = false;
  capsLockOn2: boolean = false;
 
 
  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private authService: AuthService
  
  ) { }


  ngOnInit(): void {

        
    this.formularioPassword = this.fb.group({
      oldPassword: [''],
      newPassword : ['', Validators.required],  // Campo de id de persona MAEPER
      repNewPassword: ['', Validators.required],  // Campo de cedula requerido
      },
      { 
        validator: this.passwordsMatchValidator 
      });  // Aplicar el validador aquí
     
      this.mostrarFormulario();
  
  
  }

  checkCapsLock1(event: KeyboardEvent): void {
    this.capsLockOn1 = event.getModifierState && event.getModifierState('CapsLock');
  }

  checkCapsLock2(event: KeyboardEvent): void {
    this.capsLockOn2 = event.getModifierState && event.getModifierState('CapsLock');
  }



  mostrarFormulario(): void {
    this.formularioVisible = true;
    this.formularioVisible2 = false;
    this.usuarios = [];
  }



  ocultarFormulario(): void {
    //this.formularioVisible = false;
    this.formularioPassword.reset();
    //this.clienteIdEditando = null;
  }


  applyFilterGlobal(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      const filterValue = inputElement.value;
      //this.tbusuarios.filterGlobal(filterValue, 'contains');
    }
  }


  passwordsMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('newPassword')?.value;
    const repNewPassword = control.get('repNewPassword')?.value;

    return newPassword && repNewPassword && newPassword !== repNewPassword ? { mismatch: true } : null;
  }


  cambiarContrasenia(): void {
    if (this.formularioPassword.valid) {
      const formData = this.formularioPassword.value;
  
      Swal.fire({
        title: 'Confirmar',
        text: '¿Estás seguro de cambiar la contraseña?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.isConfirmed) {
          this.usersService.changePassword(formData.oldPassword, formData.newPassword).subscribe(r => {
            // El componente maneja todos los mensajes de éxito y error
            if (!r.error) {
              // Swal.fire('Éxito', r.msg || 'Contraseña cambiada correctamente, inicie sesión con su nueva contraseña', 'success').then(() => {
              Swal.fire('Éxito', 'Contraseña cambiada correctamente, inicie sesión con su nueva contraseña', 'success').then(() => {
                this.ocultarFormulario();
                this.logout();
              });
            } else {
              Swal.fire('Error', r.msg || 'No se pudo cambiar la contraseña', 'error');
            }
          });
        }
      });
    } else {
      if (this.formularioPassword.hasError('mismatch')) {
        Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
      } else {
        Swal.fire('Error', 'Datos incompletos.', 'error');
      }
    }
  }

  logout() {
    // Lógica para cerrar sesión
    this.authService.logout()
    //console.log('Cerrar Sesión');
  }

}
