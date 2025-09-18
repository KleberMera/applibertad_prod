import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ERROR_VALIDATIONS } from '@data/constants';
import { AuthService } from '@data/services/api/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-form, [app-login-form]',
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {

  public loginForm: FormGroup;
  public errors = ERROR_VALIDATIONS;
  public loginSubmitted: boolean = false;

  // Propiedades para la animación
  public characters: { char: string, isAnimating: boolean }[] = [];
  public isFocused: boolean = false;

  currentYear: number = new Date().getFullYear();

  capsLockOn: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      user: [
        '',
        [
          Validators.required,
          // Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/)
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.maxLength(25)
        ]
      ],
    });
  }

  checkCapsLock(event: KeyboardEvent): void {
    this.capsLockOn = event.getModifierState && event.getModifierState('CapsLock');
  }

  // Método para manejar cambios en el input
  onUserInputChange(event: any) {
    const newValue = event.target.value.toLowerCase();
    
    // Actualizar array de caracteres para la visualización
    this.updateCharacters(newValue);
    
    // Actualizar FormControl
    this.loginForm.get('user')?.setValue(newValue, { emitEvent: false });
  }

  // Método original mantenido para compatibilidad
  forzarMinuscula() {
    const valor = this.loginForm.get('user')?.value;
    this.loginForm.get('user')?.setValue(valor.toLowerCase(), { emitEvent: false });
    this.updateCharacters(valor.toLowerCase());
  }

  // Métodos para la visualización - SIMPLIFICADO
  updateCharacters(value: string) {
    this.characters = [];

    for (let i = 0; i < value.length; i++) {
      // Mientras tiene foco, solo el último es minúscula
      const char = (this.isFocused && i === value.length - 1) ? value[i].toLowerCase() : value[i].toUpperCase();
      this.characters.push({
        char: char,
        isAnimating: false
      });
    }
  }

  onFocus() {
    this.isFocused = true;
    // Actualizar visualización cuando gana foco
    const currentValue = this.loginForm.get('user')?.value || '';
    this.updateCharacters(currentValue);
  }

  onBlur() {
    this.isFocused = false;
    // Al perder foco, convertir todo a mayúsculas
    const currentValue = this.loginForm.get('user')?.value || '';
    this.convertAllToUppercase(currentValue);
  }

  // Nuevo método para convertir todo a mayúsculas al perder foco
  convertAllToUppercase(value: string) {
    this.characters = [];
    
    for (let i = 0; i < value.length; i++) {
      this.characters.push({
        char: value[i].toUpperCase(),
        isAnimating: false
      });
    }
  }

  getDisplayValue(): string {
    return this.characters.map(c => c.char).join('');
  }

  focusInput() {
    const hiddenInput = document.querySelector('.hidden-input') as HTMLInputElement;
    if (hiddenInput) {
      hiddenInput.focus();
    }
  }

  // Tus métodos originales sin cambios
  autenticate() {
    this.loginSubmitted = true;
    if (!this.loginForm.valid) {
      return;
    }
    this.authService.login(this.loginForm.value).subscribe(r => {
      //console.log(r);
    });
  }

  get fm() {
    return this.loginForm.controls;
  }
}