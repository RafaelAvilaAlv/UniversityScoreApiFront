import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiURL = environment.userApi;
  private authURL = environment.authApi;

  private tokenSubject = new BehaviorSubject<string | null>(null);
  private rolSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const rol = localStorage.getItem('rol');

      if (token) this.tokenSubject.next(token);
      if (rol) this.rolSubject.next(rol);
    }
  }

  register(usuario: any): Observable<any> {
    return this.http.post(`${this.apiURL}/registrar`, usuario);
  }

  login(credenciales: any): Observable<any> {
    return this.http.post(`${this.authURL}/login`, credenciales).pipe(
      tap((respuesta: any) => {
        const decoded: any = jwtDecode(respuesta.token);
        const rol = decoded.rol;

        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('rol', rol);

        this.tokenSubject.next(respuesta.token);
        this.rolSubject.next(rol);
      })
    );
  }

  guardarToken(token: string): void {
    this.tokenSubject.next(token);
    localStorage.setItem('token', token);
  }

  guardarRol(rol: string): void {
    this.rolSubject.next(rol);
    localStorage.setItem('rol', rol);
  }

  obtenerToken(): string | null {
    return this.tokenSubject.value;
  }

  obtenerRol(): string | null {
    return this.rolSubject.value || localStorage.getItem('rol');
  }

  cerrarSesion(): void {
    this.tokenSubject.next(null);
    this.rolSubject.next(null);
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
  }

  estaAutenticado(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const ahora = Math.floor(Date.now() / 1000);
      return payload.exp && payload.exp > ahora;
    } catch {
      return false;
    }
  }
}