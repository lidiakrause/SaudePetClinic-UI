import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AgendamentosService,
  AgendamentoRequestDTO,
  AgendamentoResponseDTO,
  UsuariosService,
  UsuarioResponseDTO,
  AnimaisService,
  AnimalDTO,
  TutoresService,
  TutorDTO
} from '@core/api';

interface DiaCalendario {
  numero: number | null;
  dataStr: string;
  temAgendamento: boolean;
  isHoje: boolean;
}

@Component({
  selector: 'app-agendamento-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class GerenciarAgendamentos implements OnInit {
  private agendamentosService = inject(AgendamentosService);
  private usuariosService = inject(UsuariosService);
  private animaisService = inject(AnimaisService);
  private tutoresService = inject(TutoresService);
  private cdr = inject(ChangeDetectorRef);

  idClinicaSelecionada: number | null = null;
  nomeClinicaSelecionada = '';
  nomeUsuario = '';
  perfilUsuario = '';

  veterinarios: UsuarioResponseDTO[] = [];
  todosAnimais: AnimalDTO[] = [];
  sugestoesAnimais: AnimalDTO[] = [];
  todosTutores: TutorDTO[] = [];

  todosAgendamentos: AgendamentoResponseDTO[] = [];
  agendamentosFiltrados: AgendamentoResponseDTO[] = [];
  carregandoLista = false;

  dataFiltro = '';
  anoAtual = new Date().getFullYear();
  mesAtual = new Date().getMonth();
  nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  diasDoCalendario: DiaCalendario[] = [];

  horariosDisponiveis: string[] = [];
  carregandoHorarios = false;

  idVeterinarioSelecionado: number | null = null;
  dataSelecionada = '';
  horarioSelecionado = '';
  idAnimalSelecionado: number | null = null;
  anotacoes = '';

  termoBuscaAnimal = '';
  exibirDropdownAnimais = false;

  exibirModalDetalhes = false;
  agendamentoSelecionadoDetalhe: AgendamentoResponseDTO | null = null;
  exibirFormCancelamento = false;
  justificativaCancelamento = '';
  cancelandoAcao = false;

  salvando = false;
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
    this.dataFiltro = this.obterDataLocalFormatada();

    const usuarioJson = localStorage.getItem('usuario');
    if (usuarioJson) {
      try {
        const usuarioLogado = JSON.parse(usuarioJson);
        this.nomeUsuario = usuarioLogado.nome || '';
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
          this.carregarDadosIniciais();
          this.carregarTodosAgendamentos();
        }
      } catch (e) {
        this.erro = 'Erro ao processar sessão.';
      }
    }
  }

  carregarDadosIniciais(): void {
    this.usuariosService.listarUsuarios(this.idClinicaSelecionada!).subscribe({
      next: (usuarios: UsuarioResponseDTO[]) => {
        this.veterinarios = usuarios.filter(u => u.perfil === 'VETERINARIO');
        this.cdr.detectChanges();
      }
    });

    this.animaisService.listarAnimais(this.idClinicaSelecionada!).subscribe({
      next: (animais: AnimalDTO[]) => {
        this.todosAnimais = animais;
        this.cdr.detectChanges();
      }
    });

    this.tutoresService.listarTutores(this.idClinicaSelecionada!).subscribe({
      next: (dados: TutorDTO[]) => {
        this.todosTutores = dados;
        this.cdr.detectChanges();
      }
    });
  }

  carregarTodosAgendamentos(): void {
    this.carregandoLista = true;
    this.agendamentosService.listarAgendamentos(undefined, undefined, undefined).subscribe({
      next: (dados: AgendamentoResponseDTO[]) => {
        this.todosAgendamentos = dados;
        this.filtrarTabelaPorData();
        this.construirCalendario();
        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.carregandoLista = false;
        if (err.status === 404) {
          this.todosAgendamentos = [];
          this.filtrarTabelaPorData();
          this.construirCalendario();
        }
        this.cdr.detectChanges();
      }
    });
  }

  filtrarTabelaPorData(): void {
    this.agendamentosFiltrados = this.todosAgendamentos.filter(a => a.data === this.dataFiltro);
  }

  construirCalendario(): void {
    this.diasDoCalendario = [];
    const primeiroDiaDaSemana = new Date(this.anoAtual, this.mesAtual, 1).getDay();
    const totalDiasNoMes = new Date(this.anoAtual, this.mesAtual + 1, 0).getDate();

    const hojeStr = this.obterDataLocalFormatada();

    for (let i = 0; i < primeiroDiaDaSemana; i++) {
      this.diasDoCalendario.push({ numero: null, dataStr: '', temAgendamento: false, isHoje: false });
    }

    for (let dia = 1; dia <= totalDiasNoMes; dia++) {
      const mFormatado = (this.mesAtual + 1).toString().padStart(2, '0');
      const dFormatado = dia.toString().padStart(2, '0');
      const dataStringISO = `${this.anoAtual}-${mFormatado}-${dFormatado}`;

      const possuiConsulta = this.todosAgendamentos.some(a => a.data === dataStringISO && (a.status as any) !== 'CANCELADO');

      this.diasDoCalendario.push({
        numero: dia,
        dataStr: dataStringISO,
        temAgendamento: possuiConsulta,
        isHoje: dataStringISO === hojeStr
      });
    }
  }

  mudarMes(direcao: number): void {
    this.mesAtual += direcao;
    if (this.mesAtual > 11) {
      this.mesAtual = 0;
      this.anoAtual++;
    } else if (this.mesAtual < 0) {
      this.mesAtual = 11;
      this.anoAtual--;
    }
    this.construirCalendario();
  }

  selecionarDataCalendario(dataStr: string): void {
    if (!dataStr) return;
    this.dataFiltro = dataStr;
    this.filtrarTabelaPorData();
  }

  getNomeTutor(idTutor: number | undefined): string {
    if (!idTutor) return '—';
    const tutor = this.todosTutores.find(t => t.idTutor === idTutor);
    return tutor ? (tutor.nome ?? '') : `ID: ${idTutor}`;
  }

  filtrarAnimaisDinamico(): void {
    const busca = this.termoBuscaAnimal.toLowerCase().trim();
    if (busca.length < 2) {
      this.sugestoesAnimais = [];
      this.exibirDropdownAnimais = false;
      this.idAnimalSelecionado = null;
      return;
    }
    this.sugestoesAnimais = this.todosAnimais.filter(a => a.nome?.toLowerCase().includes(busca));
    this.exibirDropdownAnimais = this.sugestoesAnimais.length > 0;
  }

  selecionarAnimalDropdown(animal: AnimalDTO): void {
    this.idAnimalSelecionado = animal.idAnimal ?? null;
    this.termoBuscaAnimal = animal.nome ?? '';
    this.exibirDropdownAnimais = false;
  }

  atualizarHorariosDisponiveis(): void {
    this.horarioSelecionado = '';
    this.horariosDisponiveis = [];
    this.erro = '';

    if (!this.idVeterinarioSelecionado || !this.dataSelecionada) {
      return;
    }

    const vet = this.veterinarios.find(v => v.idUsuario === Number(this.idVeterinarioSelecionado));
    if (!vet) return;

    const dataObjeto = new Date(this.dataSelecionada.replace(/-/g, '/'));
    const diaSemana = dataObjeto.getDay();

    if (diaSemana === 6 && !(vet as any).atendeSabado) {
      this.erro = `${vet.nome} não realiza atendimentos aos Sábados.`;
      return;
    }
    if (diaSemana === 0 && !(vet as any).atendeDomingo) {
      this.erro = `${vet.nome} não realiza atendimentos aos Domingos.`;
      return;
    }

    this.carregandoHorarios = true;
    const inicioStr = (vet as any).horarioInicio || '08:00';
    const fimStr = (vet as any).horarioFim || '18:00';

    this.agendamentosService.listarAgendamentos(undefined, Number(this.idVeterinarioSelecionado), this.dataSelecionada).subscribe({
      next: (agendamentosExistentes: AgendamentoResponseDTO[]) => {
        const horariosOcupados = agendamentosExistentes
          .filter(a => Number(a.idVet) === Number(this.idVeterinarioSelecionado) && a.data === this.dataSelecionada && (a.status as any) !== 'CANCELADO')
          .map(a => a.hora ?? '');

        this.horariosDisponiveis = this.gerarSlotsHorarios(inicioStr, fimStr, 30, horariosOcupados);
        this.carregandoHorarios = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.carregandoHorarios = false;
        if (error.status === 404) {
          this.horariosDisponiveis = this.gerarSlotsHorarios(inicioStr, fimStr, 30, []);
        } else {
          this.erro = 'Erro ao consultar a disponibilidade do veterinário.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  private gerarSlotsHorarios(inicio: string, fim: string, intervaloMinutos: number, ocupados: string[]): string[] {
    const slots: string[] = [];
    let [horaInit, minInit] = inicio.split(':').map(Number);
    const [horaFim, minFim] = fim.split(':').map(Number);

    let minutesAtuais = horaInit * 60 + minInit;
    const minutesLimite = horaFim * 60 + minFim;

    while (minutesAtuais < minutesLimite) {
      const h = Math.floor(minutesAtuais / 60).toString().padStart(2, '0');
      const m = (minutesAtuais % 60).toString().padStart(2, '0');
      const horarioFormatado = `${h}:${m}`;

      if (!ocupados.includes(horarioFormatado)) {
        slots.push(horarioFormatado);
      }
      minutesAtuais += intervaloMinutos;
    }
    return slots;
  }

  salvarAgendamento(): void {
    this.erro = '';
    this.sucesso = '';

    if (!this.idAnimalSelecionado) {
      this.erro = 'Selecione um paciente válido.';
      return;
    }
    if (!this.idVeterinarioSelecionado) {
      this.erro = 'Selecione o veterinário.';
      return;
    }
    if (!this.dataSelecionada || !this.horarioSelecionado) {
      this.erro = 'Selecione a data e o horário.';
      return;
    }

    const hojeStr = this.obterDataLocalFormatada();
    if (this.dataSelecionada < hojeStr) {
      this.erro = 'Agendamento rejeitado: A data escolhida já passou.';
      return;
    }

    const payload: AgendamentoRequestDTO = {
      idAnimal: this.idAnimalSelecionado,
      idVet: Number(this.idVeterinarioSelecionado),
      data: this.dataSelecionada,
      hora: this.horarioSelecionado,
      anotacoes: this.anotacoes.trim() || undefined
    };

    this.salvando = true;

    this.agendamentosService.criarAgendamento(payload).subscribe({
      next: () => {
        this.sucesso = 'Agendamento realizado com sucesso!';
        this.limparFormulario();
        this.salvando = false;
        this.carregarTodosAgendamentos();
      },
      error: () => {
        this.salvando = false;
        this.erro = 'Erro ao processar o agendamento no servidor.';
        this.cdr.detectChanges();
      }
    });
  }

  confirmarCancelamentoBalcao(): void {
    if (!this.agendamentoSelecionadoDetalhe || !this.agendamentoSelecionadoDetalhe.idAgendamento) return;

    this.erro = '';
    if (!this.justificativaCancelamento.trim()) {
      alert('A justificativa de cancelamento é obrigatória.');
      return;
    }

    this.cancelandoAcao = true;

    const statusPayload = {
      status: 'CANCELADO',
      anotacoes: this.justificativaCancelamento.trim()
    };

    this.agendamentosService.atualizarStatusAgendamento(this.agendamentoSelecionadoDetalhe.idAgendamento, statusPayload as any).subscribe({
      next: () => {
        this.sucesso = 'Agendamento cancelado com sucesso pela recepção!';
        this.fecharModalDetalhes();
        this.carregarTodosAgendamentos();
        this.cancelandoAcao = false;
      },
      error: () => {
        this.erro = 'Não foi possível processar o cancelamento deste agendamento.';
        this.cancelandoAcao = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalDetalhes(agendamento: AgendamentoResponseDTO): void {
    this.agendamentoSelecionadoDetalhe = agendamento;
    this.exibirModalDetalhes = true;
    this.exibirFormCancelamento = false;
    this.justificativaCancelamento = '';
  }

  fecharModalDetalhes(): void {
    this.exibirModalDetalhes = false;
    this.agendamentoSelecionadoDetalhe = null;
    this.exibirFormCancelamento = false;
    this.justificativaCancelamento = '';
  }

  limparFormulario(): void {
    this.idVeterinarioSelecionado = null;
    this.dataSelecionada = '';
    this.horarioSelecionado = '';
    this.idAnimalSelecionado = null;
    this.termoBuscaAnimal = '';
    this.anotacoes = '';
    this.horariosDisponiveis = [];
  }
}
