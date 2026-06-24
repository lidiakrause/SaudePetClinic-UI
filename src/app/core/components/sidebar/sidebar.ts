import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {
  perfilUsuario: string = '';

  ngOnInit(): void {
    const usuarioJson = localStorage.getItem('usuario');
    if (usuarioJson) {
      try {
        const usuario = JSON.parse(usuarioJson);
        this.perfilUsuario = usuario.perfil || '';
      } catch (e) {
        this.perfilUsuario = '';
      }
    }
  }

  public hasRole(rolesPermitidos: string[]): boolean {
    if (!this.perfilUsuario) return false;
    return rolesPermitidos.includes(this.perfilUsuario.toUpperCase());
  }
}
