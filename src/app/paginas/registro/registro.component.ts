import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicios/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  formularioRegistro: FormGroup;
  mensajeError = '';
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.formularioRegistro = this.fb.group(
      {
        nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
        correo: ['', [Validators.required, Validators.email]],
        clave: [
          '',
          [
            Validators.required,
            Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
          ]
        ],
        confirmarClave: ['', [Validators.required]]
      },
      { validators: this.validarClavesIguales }
    );
  }

  validarClavesIguales(control: AbstractControl): ValidationErrors | null {
    const clave = control.get('clave')?.value;
    const confirmar = control.get('confirmarClave')?.value;

    if (!clave || !confirmar) {
      return null;
    }

    return clave === confirmar ? null : { clavesDiferentes: true };
  }

  get nombreUsuario() {
    return this.formularioRegistro.get('nombreUsuario');
  }

  get correo() {
    return this.formularioRegistro.get('correo');
  }

  get clave() {
    return this.formularioRegistro.get('clave');
  }

  get confirmarClave() {
    return this.formularioRegistro.get('confirmarClave');
  }

  registrar(): void {
    this.mensajeError = '';

    if (this.formularioRegistro.invalid) {
      this.formularioRegistro.markAllAsTouched();

      if (this.formularioRegistro.hasError('clavesDiferentes')) {
        Swal.fire({
          icon: 'warning',
          title: 'Las contraseñas no coinciden',
          confirmButtonText: 'Ok'
        });
      }

      return;
    }

    const { nombreUsuario, correo, clave } = this.formularioRegistro.value;

    const usuario = {
      nombreUsuario,
      correo,
      contrasena: clave
    };

    this.cargando = true;

    this.authService.register(usuario).subscribe({
      next: () => {
        this.cargando = false;

        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'El usuario ha sido registrado correctamente.',
          confirmButtonText: 'Ok'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al registrar usuario:', error);

        this.mensajeError =
          error?.error?.mensaje ||
          error?.error?.error ||
          'No se pudo completar el registro. Intenta nuevamente.';

        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: this.mensajeError,
          confirmButtonText: 'Cerrar'
        });
      }
    });
  }


  irLogin(): void {
    this.router.navigate(['/login']);
  }
}