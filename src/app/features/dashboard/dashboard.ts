import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AgendamentosService,
  AgendamentoResponseDTO,
  AnimaisService,
  AnimalDTO
} from '@core/api';

interface ItemGrafico {
  dataStr: string;
  label: string;
  quantidade: number;
  percentual: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private agendamentosService = inject(AgendamentosService);
  private animaisService = inject(AnimaisService);
  private cdr = inject(ChangeDetectorRef);

  idClinicaSelecionada: number | null = null;
  nomeClinicaSelecionada = '';
  nomeUsuario = '';
  perfilUsuario = '';

  totalHoje = 0;
  finalizadosHoje = 0;
  canceladosHoje = 0;
  totalPacientes = 0;

  proximasConsultas: AgendamentoResponseDTO[] = [];
  dadosGrafico: ItemGrafico[] = [];
  carregandoDados = false;
  dataHoje = '';

  erro = '';

  ngOnInit(): void {
    this.dataHoje = new Date().toISOString().split('T')[0];

    const usuarioJson = localStorage.getItem('usuario');
    if (usuarioJson) {
      try {
        const usuarioLogado = JSON.parse(usuarioJson);
        this.nomeUsuario = usuarioLogado.nome || 'Utilizador';
        this.perfilUsuario = usuarioLogado.perfil?.toUpperCase() || '';

        if (this.perfilUsuario === 'ADMIN') {
          const adminClinicaId = localStorage.getItem('admin_clinica_id');
          const adminClinicaNome = localStorage.getItem('admin_clinica_nome');
          if (adminClinicaId) {
            this.idClinicaSelecionada = Number(adminClinicaId);
            this.nomeClinicaSelecionada = adminClinicaNome || `Clínica #${adminClinicaId}`;
          }
        } else {
          if (usuarioLogado.idClinica) {
            this.idClinicaSelecionada = Number(usuarioLogado.idClinica);
            this.nomeClinicaSelecionada = usuarioLogado.nomeClinica || `Sua Unidade`;
          }
        }

        if (this.idClinicaSelecionada) {
          this.carregarMetricasEstatisticas();
        }
      } catch (e) {
        this.erro = 'Erro ao carregar o contexto do painel principal.';
      }
    }
  }

  carregarMetricasEstatisticas(): void {
    if (!this.idClinicaSelecionada) return;
    this.carregandoDados = true;
    this.erro = '';

    this.agendamentosService.listarAgendamentos(undefined, undefined, undefined).subscribe({
      next: (agendamentos: AgendamentoResponseDTO[]) => {
        const consultasDeHoje = agendamentos.filter(a => a.data === this.dataHoje);

        this.totalHoje = consultasDeHoje.length;
        this.finalizadosHoje = consultasDeHoje.filter(a => (a.status as any) === 'FINALIZADO').length;
        this.canceladosHoje = consultasDeHoje.filter(a => (a.status as any) === 'CANCELADO').length;

        this.proximasConsultas = consultasDeHoje
          .filter(a => (a.status as any) === 'AGENDADO')
          .sort((a, b) => (a.hora ?? '').localeCompare(b.hora ?? ''))
          .slice(0, 5);

        this.gerarDadosGrafico7Dias(agendamentos);

        this.verificarFimCarregamento();
      },
      error: (err: HttpErrorResponse) => {
        this.carregandoDados = false;
        if (err.status === 404) {
          this.totalHoje = 0;
          this.finalizadosHoje = 0;
          this.canceladosHoje = 0;
          this.proximasConsultas = [];
          this.dadosGrafico = [];
        } else {
          this.erro = 'Falha ao sincronizar dados estatísticos de agendamento.';
        }
        this.cdr.detectChanges();
      }
    });

    this.animaisService.listarAnimais(this.idClinicaSelecionada).subscribe({
      next: (animais: AnimalDTO[]) => {
        this.totalPacientes = animais.length;
        this.verificarFimCarregamento();
      },
      error: () => {
        this.totalPacientes = 0;
        this.verificarFimCarregamento();
      }
    });
  }

  private gerarDadosGrafico7Dias(agendamentos: AgendamentoResponseDTO[]): void {
    const listagemDias: ItemGrafico[] = [];
    const nomesDiasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    let maiorVolumeDoPeriodo = 0;

    for (let i = 6; i >= 0; i--) {
      const dataAlvo = new Date();
      dataAlvo.setDate(dataAlvo.getDate() - i);

      const ano = dataAlvo.getFullYear();
      const mes = String(dataAlvo.getMonth() + 1).padStart(2, '0');
      const dia = String(dataAlvo.getDate()).padStart(2, '0');
      const dataStr = `${ano}-${mes}-${dia}`;

      const labelExibicao = `${dia}/${mes} (${nomesDiasSemana[dataAlvo.getDay()]})`;

      const totalDoDia = agendamentos.filter(a => a.data === dataStr && (a.status as any) !== 'CANCELADO').length;

      if (totalDoDia > maiorVolumeDoPeriodo) {
        maiorVolumeDoPeriodo = totalDoDia;
      }

      listagemDias.push({
        dataStr,
        label: labelExibicao,
        quantidade: totalDoDia,
        percentual: 0
      });
    }

    listagemDias.forEach(dia => {
      dia.percentual = maiorVolumeDoPeriodo > 0 ? (dia.quantidade / maiorVolumeDoPeriodo) * 100 : 0;
    });

    this.dadosGrafico = listagemDias;
  }

  private contadorRespostas = 0;
  private verificarFimCarregamento(): void {
    this.contadorRespostas++;
    if (this.contadorRespostas >= 2) {
      this.carregandoDados = false;
      this.contadorRespostas = 0;
      this.cdr.detectChanges();
    }
  }
}
