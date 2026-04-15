import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  formularioLogin: FormGroup;
  mensajeError = '';
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.formularioLogin = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required]
    });
  }

  iniciarSesion(): void {
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      return;
    }

    this.mensajeError = '';
    this.cargando = true;

    const credenciales = this.formularioLogin.value;

    this.authService.login(credenciales).subscribe({
      next: (respuesta) => {
        this.cargando = false;

        this.authService.guardarToken(respuesta.token);

        const decoded: any = jwtDecode(respuesta.token);
        const rol = decoded.rol;

        this.authService.guardarRol(rol);

        if (rol === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/usuario/dashboard']);
        }
      },
      error: () => {
        this.cargando = false;
        this.mensajeError = 'Credenciales incorrectas. Intenta nuevamente.';

        Swal.fire({
          icon: 'error',
          title: 'Error de inicio de sesión',
          text: 'Credenciales inválidas. Intenta nuevamente.',
          confirmButtonText: 'Ok'
        });
      }
    });
  }
}