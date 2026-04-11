import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UniversidadService } from '../../servicios/universidad.service';

@Component({
  selector: 'app-prediccion',
  templateUrl: './prediccion.component.html',
  styleUrls: ['./prediccion.component.scss']
})
export class PrediccionComponent {
  formulario: FormGroup;
  resultado: number | null = null;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private universidadService: UniversidadService
  ) {
    this.formulario = this.fb.group({
      academic_reputation: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      employer_reputation: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      sustainability: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      faculty_student_ratio: [null, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  predecir(): void {
    if (this.formulario.invalid) return;

    this.cargando = true;
    const datos = this.formulario.value;

    this.universidadService.predecir(datos).subscribe({
      next: (res: any) => {
        this.resultado = res.overall_score ?? res.puntaje_estimado ?? null;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error en la predicción', err);
        this.cargando = false;
        alert('Error al obtener predicción. Verifica la conexión o el backend.');
      }
    });
  }
}