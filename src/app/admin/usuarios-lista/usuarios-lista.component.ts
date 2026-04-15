import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsuarioService } from '../../servicios/usuario.service';

@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, RouterModule],
  templateUrl: './usuarios-lista.component.html',
  styleUrls: ['./usuarios-lista.component.scss']
})
export class UsuariosListaComponent implements OnInit {
  usuarios: any[] = [];

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (error) => {
        console.error('Error al obtener usuarios:', error);
      }
    });
  }
}