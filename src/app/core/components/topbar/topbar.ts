import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar implements OnInit {
  private router = inject(Router);

  nomeUsuario: string = '';
  nivelAcesso: string = '';
  clinicaUsuario: string | null = null;

  ngOnInit(): void {
    this.carregarDadosUsuario();

    window.addEventListener('clinicaSelecionada', () => {
      this.carregarDadosUsuario();
    });
  }

  carregarDadosUsuario(): void {
    const usuarioJson = localStorage.getItem('usuario');

    if (usuarioJson) {
      try {
        const usuario = JSON.parse(usuarioJson);
        this.nomeUsuario = usuario.nome || 'Usuário';
        this.nivelAcesso = usuario.perfil || 'NÃO DEFINIDO';

        if (this.nivelAcesso.toUpperCase() === 'ADMIN') {
          const clinicaAdminNome = localStorage.getItem('admin_clinica_nome');
          this.clinicaUsuario = clinicaAdminNome
            ? `${clinicaAdminNome} (Modo Admin)`
            : 'Selecione uma clínica';
        } else {
          this.clinicaUsuario = usuario.nomeClinica || null;
        }

      } catch (e) {
        this.nomeUsuario = 'Usuário';
        this.clinicaUsuario = null;
      }
    } else {
      this.logout();
    }
  }

  getBadgeClass(): string {
    if (!this.nivelAcesso) return 'badge-default';
    switch (this.nivelAcesso.toUpperCase()) {
      case 'ADMIN': return 'badge-admin';
      case 'GESTOR': return 'badge-gestor';
      case 'VETERINARIO': case 'VET': return 'badge-vet';
      case 'RECEPCIONISTA': return 'badge-recep';
      default: return 'badge-default';
    }
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
