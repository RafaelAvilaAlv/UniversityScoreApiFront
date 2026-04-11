import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Necesario para *ngFor, *ngIf
import { UniversidadService } from '../../servicios/universidad.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-gestion-csv-universidades',
  standalone: true,
  imports: [CommonModule], // 👈 Aquí se habilitan las directivas estructurales
  templateUrl: './gestion-csv-universidades.component.html'
})
export class GestionCsvUniversidadesComponent implements OnInit {
  universidadesDesdeCSV: any[] = [];
  columnas: string[] = [];

  constructor(private universidadService: UniversidadService,private location: Location) {}

  ngOnInit(): void {
    this.universidadService.obtenerDesdeCSV().subscribe({
      next: (data) => {
        this.universidadesDesdeCSV = data;
        if (data.length > 0) {
          this.columnas = Object.keys(data[0]);
        }
      },
      error: (err) => {
        console.error('Error al cargar CSV', err);
      }
    });
  }
  volverAtras(): void {
    this.location.back(); // 👈 Esta es la función que va "para atrás"
  }
}
