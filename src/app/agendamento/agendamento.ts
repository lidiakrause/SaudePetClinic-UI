import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AnimalService } from '../Services/animal.service';
import { AgendamentoService } from '../Services/agendamento.service';

@Component({
  selector: 'app-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './agendamento.html',
})
export class AgendamentoComponent implements OnInit {

  animalId: number | null = null;
  dataHora = '';
  servico = '';

  erro = '';
  sucesso = '';
  carregando = false;

  agendamentos: any[] = [];
  animais: any[] = [];

  constructor(
    private animalService: AnimalService,
    private agendamentoService: AgendamentoService,
  ) {}

  ngOnInit(): void {
    this.animalService.listar().subscribe({
      next: (dados) => this.animais = dados,
      error: () => this.erro = 'Erro ao carregar animais.',
    });
    this.carregarAgendamentos();
  }

  carregarAgendamentos(): void {
    this.agendamentoService.listar().subscribe({
      next: (dados) => this.agendamentos = dados,
      error: () => this.erro = 'Erro ao carregar agendamentos.',
    });
  }

  salvar(): void {
    this.erro = '';
    this.sucesso = '';

    if (!this.animalId || !this.dataHora || !this.servico) {
      this.erro = 'Preencha todos os campos.';
      return;
    }

    this.carregando = true;

    this.agendamentoService.salvar({
      animalId: this.animalId,
      dataHora: this.dataHora,
      servico: this.servico,
    }).subscribe({
      next: () => {
        this.sucesso = 'Agendamento realizado com sucesso!';
        this.animalId = null;
        this.dataHora = '';
        this.servico = '';
        this.carregarAgendamentos();
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Erro ao salvar agendamento.';
        this.carregando = false;
      },
    });
  }

  formatarDataHora(valor: string): string {
    if (!valor) return '';
    return new Date(valor).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
