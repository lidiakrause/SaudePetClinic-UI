import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TutorService } from '../services/tutor.service';

@Component({
  selector: 'app-tutor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tutor.html',
  styleUrls: ['./tutor.css'],
})
export class TutorComponent implements OnInit {

  nome = '';
  telefone = '';
  email = '';

  erro = '';
  sucesso = '';
  carregando = false;

  tutores: any[] = [];

  constructor(private tutorService: TutorService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.tutorService.listar().subscribe({
      next: (dados) => this.tutores = dados,
      error: () => this.erro = 'Erro ao carregar tutores.',
    });
  }

  salvar(): void {
    this.erro = '';
    this.sucesso = '';

    const telefoneLimpo = this.telefone.replace(/\D/g, '');

    if (!this.nome.trim() || !telefoneLimpo || !this.email.trim()) {
      this.erro = 'Preencha todos os campos.';
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(this.email)) {
      this.erro = 'E-mail inválido.';
      return;
    }

    this.carregando = true;

    this.tutorService.salvar({ nome: this.nome.trim(), telefone: telefoneLimpo, email: this.email.trim() }).subscribe({
      next: () => {
        this.sucesso = 'Tutor cadastrado com sucesso!';
        this.nome = '';
        this.telefone = '';
        this.email = '';
        this.carregar();
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Erro ao salvar tutor.';
        this.carregando = false;
      },
    });
  }

  formatarTelefone(): void {
    let t = this.telefone.replace(/\D/g, '').slice(0, 11);
    if (t.length > 10) t = t.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    else if (t.length > 6) t = t.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    else if (t.length > 2) t = t.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    this.telefone = t;
  }
}
