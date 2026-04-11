import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartDataset } from 'chart.js';
import Chart from 'chart.js/auto';
import { Router } from '@angular/router';
import { UniversidadService } from '../../servicios/universidad.service';

@Component({
  selector: 'app-usuario-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './usuario-dashboard.component.html',
  styleUrls: ['./usuario-dashboard.component.scss']
})
export class UsuarioDashboardComponent {
  datos = {
    RANK_2025: null as number | null,
    Academic_Reputation_Score: null as number | null,
    Employer_Reputation_Score: null as number | null,
    Sustainability_Score: null as number | null,
    International_Research_Network_Score: null as number | null
  };

  listaRankings: number[] = Array.from({ length: 200 }, (_, i) => i + 1);
  listaReputacionAcademica: number[] = Array.from(
    { length: 100 },
    (_, i) => parseFloat((i + 1).toFixed(1))
  ).reverse();

  resultado: number | null = null;
  error = '';

  evaluacion = '';
  percentil: number | null = null;
  universidadesComparables: string[] = [];
  universidadSimilar: any = null;

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

  preguntaSeleccionada = '';
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

  constructor(
    private universidadService: UniversidadService,
    private router: Router
  ) {}

  predecir(): void {
    this.error = '';
    this.resultado = null;

    this.universidadService.predecir(this.datos).subscribe({
      next: (res: any) => {
        this.resultado = res.puntaje_estimado;
        this.evaluacion = res.evaluacion;
        this.percentil = res.percentil;
        this.universidadesComparables = res.universidades_comparables ?? [];
        this.universidadSimilar = res.universidad_similar ?? null;

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
        console.error('Error en predicción:', err);
        this.error = err?.error?.detalle || 'Ocurrió un error en la predicción.';
      }
    });
  }

  enviarPregunta(): void {
    if (!this.preguntaSeleccionada.trim()) return;

    this.universidadService.enviarPregunta(this.preguntaSeleccionada).subscribe({
      next: (respuesta: any) => {
        this.respuestaPregunta = Array.isArray(respuesta) ? respuesta : [respuesta];
      },
      error: (err) => {
        console.error('Error al enviar pregunta:', err);
      }
    });
  }

  dibujarGrafico(): void {
    const canvas = document.getElementById('graficoPrediccion') as HTMLCanvasElement | null;
    if (!canvas || this.resultado === null) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prevChart = Chart.getChart('graficoPrediccion');
    if (prevChart) prevChart.destroy();

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Score', 'Restante'],
        datasets: [
          {
            data: [this.resultado, 100 - this.resultado],
            backgroundColor: ['#198754', '#e9ecef'],
            borderWidth: 1
          }
        ]
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
    if (score >= 70) return 'Rendimiento aceptable';
    return 'Rendimiento bajo';
  }

  getColorByEvaluacion(): string {
    if (this.resultado !== null) {
      if (this.resultado >= 80) return 'rgba(75, 192, 192, 0.5)';
      if (this.resultado >= 50) return 'rgba(255, 206, 86, 0.5)';
      return 'rgba(255, 99, 132, 0.5)';
    }
    return 'rgba(201, 203, 207, 0.5)';
  }

  verUniversidades(): void {}

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('correo');
    this.router.navigate(['/login']);
  }
}