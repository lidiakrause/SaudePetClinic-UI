import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AgendamentosService,
  AgendamentoResponseDTO,
  UsuariosService,
  UsuarioResponseDTO
} from '@core/api';

@Component({
  selector: 'app-tela-atendimento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './atendimento.html',
  styleUrl: './atendimento.css',
})
export class TelaAtendimento implements OnInit {
  private agendamentosService = inject(AgendamentosService);
  private usuariosService = inject(UsuariosService);
  private cdr = inject(ChangeDetectorRef);

  idClinicaSelecionada: number | null = null;
  idVetLogado: number | null = null;
  isVeterinario = false;

  veterinarios: UsuarioResponseDTO[] = [];
  atendimentosDoDia: AgendamentoResponseDTO[] = [];
  carregando = false;

  idVetFiltro: number | null = null;
  dataHoje = '';

  atendimentoEmFoco: AgendamentoResponseDTO | null = null;
  anotacoesAcao = '';
  salvandoAcao = false;

  exibirModalDetalhes = false;
  agendamentoSelecionadoDetalhe: AgendamentoResponseDTO | null = null;

  erro = '';
  sucesso = '';

  obterDataLocalFormatada(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  ngOnInit(): void {
    this.dataHoje = this.obterDataLocalFormatada();
    const usuarioJson = localStorage.getItem('usuario');

    if (usuarioJson) {
      try {
        const usuarioLogado = JSON.parse(usuarioJson);
        const perfil = usuarioLogado.perfil?.toUpperCase();

        if (perfil === 'ADMIN') {
          const adminClinicaId = localStorage.getItem('admin_clinica_id');
          if (adminClinicaId) this.idClinicaSelecionada = Number(adminClinicaId);
        } else {
          if (usuarioLogado.idClinica) this.idClinicaSelecionada = Number(usuarioLogado.idClinica);
        }

        if (perfil === 'VETERINARIO') {
          this.isVeterinario = true;
          this.idVetLogado = Number(usuarioLogado.idUsuario);
          this.idVetFiltro = this.idVetLogado;
          this.carregarAtendimentos();
        } else {
          this.isVeterinario = false;
          this.carregarListaVeterinarios();
        }
      } catch (e) {
        this.erro = 'Erro ao processar dados da sessão.';
      }
    }
  }

  carregarListaVeterinarios(): void {
    if (!this.idClinicaSelecionada) return;
    this.usuariosService.listarUsuarios(this.idClinicaSelecionada).subscribe({
      next: (usuarios) => {
        this.veterinarios = usuarios.filter(u => u.perfil === 'VETERINARIO');
        if (this.veterinarios.length > 0) {
          this.idVetFiltro = this.veterinarios[0].idUsuario ?? null;
          this.carregarAtendimentos();
        }
      }
    });
  }

  carregarAtendimentos(): void {
    if (!this.idVetFiltro) return;
    this.carregando = true;
    this.erro = '';

    this.agendamentosService.listarAgendamentos(undefined, this.idVetFiltro, this.dataHoje).subscribe({
      next: (dados: AgendamentoResponseDTO[]) => {
        this.atendimentosDoDia = dados.sort((a, b) => (a.hora ?? '').localeCompare(b.hora ?? ''));
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.carregando = false;
        if (err.status === 404) this.atendimentosDoDia = [];
        this.cdr.detectChanges();
      }
    });
  }

  focarAtendimento(agendamento: AgendamentoResponseDTO): void {
    this.atendimentoEmFoco = agendamento;
    this.anotacoesAcao = '';
    this.erro = '';
    this.sucesso = '';
  }

  alterarStatusComAnotacoes(statusDestino: 'FINALIZADO' | 'CANCELADO'): void {
    if (!this.atendimentoEmFoco || !this.atendimentoEmFoco.idAgendamento) return;

    this.erro = '';
    if (!this.anotacoesAcao.trim()) {
      this.erro = `As observações são obrigatórias para conseguir alterar para ${statusDestino}.`;
      return;
    }

    this.salvandoAcao = true;

    const statusPayload = {
      status: statusDestino,
      anotacoes: this.anotacoesAcao.trim()
    };

    this.agendamentosService.atualizarStatusAgendamento(this.atendimentoEmFoco.idAgendamento, statusPayload as any).subscribe({
      next: () => {
        this.sucesso = `Consulta alterada para ${statusDestino} com sucesso!`;
        this.atendimentoEmFoco = null;
        this.anotacoesAcao = '';
        this.salvandoAcao = false;
        this.carregarAtendimentos();
      },
      error: () => {
        this.erro = 'Houve uma falha ao atualizar o status no servidor.';
        this.salvandoAcao = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalDetalhes(agendamento: AgendamentoResponseDTO): void {
    this.agendamentoSelecionadoDetalhe = agendamento;
    this.exibirModalDetalhes = true;
  }

  fecharModalDetalhes(): void {
    this.exibirModalDetalhes = false;
    this.agendamentoSelecionadoDetalhe = null;
  }

  cancelarFoco(): void {
    this.atendimentoEmFoco = null;
    this.anotacoesAcao = '';
  }
}
