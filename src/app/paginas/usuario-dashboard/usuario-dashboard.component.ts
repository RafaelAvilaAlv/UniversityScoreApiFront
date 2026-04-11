import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts'; // ✅ Importar módulo de gráficos

import { ChartDataset } from 'chart.js';


import Chart from 'chart.js/auto';

import { Router } from '@angular/router';

@Component({
  selector: 'app-usuario-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule], // ✅ Agregar NgChartsModule
  templateUrl: './usuario-dashboard.component.html',
  styleUrls: ['./usuario-dashboard.component.scss']
})
export class UsuarioDashboardComponent {
  // Datos ingresados en el formulario
  datos = {
    RANK_2025: null,
    Academic_Reputation_Score: null,
    Employer_Reputation_Score: null,
    Sustainability_Score: null,
    International_Research_Network_Score: null
  };

  // Listas de valores posibles
  listaRankings: number[] = Array.from({ length: 200 }, (_, i) => i + 1); // 1 a 200
  listaReputacionAcademica: number[] = Array.from({ length: 100 }, (_, i) => parseFloat((i + 1).toFixed(1))).reverse(); // 100.0 a 1.0

  resultado: number | null = null;
  error: string = '';

  evaluacion: string = '';
  percentil: number | null = null;
  universidadesComparables: string[] = [];
  universidadSimilar: any = null;


  // Gráfico de barras con ng2-charts
   chartData: ChartDataset<'bar'>[] = [];

  public chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  constructor(private http: HttpClient, private router: Router) {}

 


  predecir() {
  this.error = '';
  this.resultado = null;

  this.http.post<any>('http://localhost:8080/api/universidad/prediccion', this.datos)
    .subscribe({
      next: (res) => {
        this.resultado = res.puntaje_estimado;
        this.evaluacion = res.evaluacion;
        this.percentil = res.percentil;
        this.universidadesComparables = res.universidades_comparables;
        this.universidadSimilar = res.universidad_similar;

        const color = this.getColorByEvaluacion();

        this.chartData = [
          {
            data: [this.resultado ?? 0],
            label: 'Predicción',
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1
          }
        ];

        this.dibujarGrafico();
      },
      error: (err) => {
        this.error = err?.error?.detalle || 'Ocurrió un error en la predicción.';
      }
    });
}



  dibujarGrafico() {
    const canvas = document.getElementById('graficoPrediccion') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx || this.resultado === null) return;

    // Destruir gráfico anterior
    const prevChart = Chart.getChart('graficoPrediccion');
    if (prevChart) prevChart.destroy();

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Score', 'Restante'],
        datasets: [{
          data: [this.resultado, 100 - this.resultado],
          backgroundColor: ['#198754', '#e9ecef'],
          borderWidth: 1
        }]
      },
      options: {
        cutout: '70%',
        plugins: {
          tooltip: { enabled: true },
          legend: { display: false }
        }
      }
    });
  }

  obtenerColorResultado(): string {
    if (this.resultado !== null) {
      if (this.resultado >= 80) return 'bg-success';
      if (this.resultado >= 60) return 'bg-warning text-dark';
      return 'bg-danger';
    }
    return '';
  }

  getMensajeResultado(score: number): string {
    if (score >= 85) return 'Excelente rendimiento estimado';
    else if (score >= 70) return 'Rendimiento aceptable';
    else return 'Rendimiento bajo';
  }

  verUniversidades() {}




  

  // ================== 👇 LÓGICA DE PREGUNTAS AÑADIDA 👇 ==================

  preguntaSeleccionada: string = '';
  respuestaPregunta: any[] = [];

  preguntasDisponibles: string[] = [
    'mejor puntaje',
    'mejor reputacion',
    'mejor ranking',
    'mejor red internacional',
    'mas internacionales',
    'mas citas',
    'mejor empleabilidad',
    'mas sostenible'
  ];

  enviarPregunta(): void {
    if (!this.preguntaSeleccionada.trim()) return;

    this.http.post<any[]>('http://localhost:8080/api/universidad/preguntas', { pregunta: this.preguntaSeleccionada }).subscribe({
      next: (respuesta) => {
        this.respuestaPregunta = respuesta;
      },
      error: (err) => {
        console.error('Error al enviar pregunta:', err);
      }
    });
  }

    cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('correo');
    this.router.navigate(['/login']);
  }


 getColorByEvaluacion(): string {
  if (this.resultado !== null) {
    if (this.resultado >= 80) return 'rgba(75, 192, 192, 0.5)';     // verde
    if (this.resultado >= 50) return 'rgba(255, 206, 86, 0.5)';     // amarillo
    return 'rgba(255, 99, 132, 0.5)';                                // rojo
  }

  // Color por defecto si no hay resultado
  return 'rgba(201, 203, 207, 0.5)'; // gris claro
}

}
