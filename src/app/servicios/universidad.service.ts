import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Universidad } from '../modelos/universidad.model';

import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class UniversidadService {
  private apiUrl = environment.universidadApi;

  constructor(private http: HttpClient) {}

  listarUniversidades(): Observable<Universidad[]> {
    return this.http.get<Universidad[]>(`${this.apiUrl}/listar`);
  }

  cargarCSV(archivo: File): Observable<string> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post(`${this.apiUrl}/cargar`, formData, { responseType: 'text' });
  }

  predecir(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/prediccion`, datos);
  }

  // ✅ CORREGIDO: envío de token + ruta correcta
obtenerDesdeCSV(): Observable<any[]> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.get<any[]>(`${this.apiUrl}/csv`, { headers }); // ✅ Ruta corregida
}


  enviarPregunta(pregunta: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/preguntas`, { pregunta }); // 🔁 también usa baseUrl
  }
}





