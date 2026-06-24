import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TutoresService, TutorDTO } from '@core/api';

@Component({
  selector: 'app-gerenciar-tutores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciar-tutores.html',
  styleUrl: './gerenciar-tutores.css',
})
export class GerenciarTutores implements OnInit {
  private tutoresService = inject(TutoresService);
  private cdr = inject(ChangeDetectorRef);

  idClinicaSelecionada: number | null = null;
  nomeClinicaSelecionada = '';

  tutores: TutorDTO[] = [];
  carregando = false;
  excluindoId: number | null = null;

  exibirFormulario = false;
  modoEdicao = false;
  idEmEdicao: number | null = null;
  salvando = false;

  cpf = '';
  nome = '';
  telefone = '';

  erro = '';
  sucesso = '';

  ngOnInit(): void {
    const usuarioJson = localStorage.getItem('usuario');

    if (usuarioJson) {
      try {
        const usuarioLogado = JSON.parse(usuarioJson);
        const perfil = usuarioLogado.perfil?.toUpperCase();

        if (perfil === 'ADMIN') {
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
          this.carregarTutores();
        }
      } catch (e) {
        this.erro = 'Erro ao processar sessão do usuário logado.';
      }
    }
  }

  carregarTutores(): void {
    if (!this.idClinicaSelecionada) return;

    this.carregando = true;
    this.erro = '';

    this.tutoresService.listarTutores(this.idClinicaSelecionada).subscribe({
      next: (dados: TutorDTO[]) => {
        this.tutores = dados;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.erro = 'Erro ao carregar a listagem de tutores do servidor.';
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  novoTutor(): void {
    this.limparFormulario();
    this.modoEdicao = false;
    this.exibirFormulario = true;
  }

  editarTutor(tutor: TutorDTO): void {
    this.limparFormulario();
    this.modoEdicao = true;
    this.idEmEdicao = tutor.idTutor ?? null;

    this.cpf = tutor.cpf ?? '';
    this.nome = tutor.nome ?? '';
    this.telefone = tutor.telefone ?? '';

    this.formatarCpf();
    this.formatarTelefone();
    this.exibirFormulario = true;
  }

  cancelar(): void {
    this.exibirFormulario = false;
    this.limparFormulario();
  }

  private limparFormulario(): void {
    this.idEmEdicao = null;
    this.cpf = '';
    this.nome = '';
    this.telefone = '';
    this.erro = '';
    this.sucesso = '';
  }

  formatarCpf(): void {
    let v = this.cpf.replace(/\D/g, '');
    if (v.length <= 11) {
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    this.cpf = v;
  }

  formatarTelefone(): void {
    let v = this.telefone.replace(/\D/g, '');
    if (v.length <= 11) {
      if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      } else if (v.length > 5) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
      } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
      }
    }
    this.telefone = v;
  }

  salvar(): void {
    this.erro = '';
    this.sucesso = '';

    if (!this.idClinicaSelecionada) {
      this.erro = 'Nenhuma clínica associada a esta operação.';
      return;
    }

    const cpfLimpo = this.cpf.replace(/\D/g, '');
    const telefoneLimpo = this.telefone.replace(/\D/g, '');

    if (cpfLimpo.length !== 11) {
      this.erro = 'Informe um CPF válido com 11 dígitos.';
      return;
    }
    if (!this.nome.trim()) {
      this.erro = 'Informe o nome do tutor.';
      return;
    }
    if (telefoneLimpo.length < 10) {
      this.erro = 'Informe um telefone válido com DDD.';
      return;
    }

    const payload: TutorDTO = {
      idClinica: this.idClinicaSelecionada,
      cpf: cpfLimpo,
      nome: this.nome.trim(),
      telefone: telefoneLimpo
    };

    this.salvando = true;

    const requisicao = this.modoEdicao && this.idEmEdicao !== null
      ? this.tutoresService.atualizarTutor(this.idEmEdicao, payload)
      : this.tutoresService.criarTutor(payload);

    requisicao.subscribe({
      next: () => {
        this.sucesso = this.modoEdicao ? 'Dados do tutor atualizados!' : 'Tutor cadastrado com sucesso!';
        this.salvando = false;
        this.exibirFormulario = false;
        this.carregarTutores();
      },
      error: (error: HttpErrorResponse) => {
        this.salvando = false;
        if (error.status === 409) {
          this.erro = 'Este CPF já encontra-se cadastrado no sistema.';
        } else if (error.status === 403) {
          this.erro = 'Operação não permitida para o seu nível de acesso.';
        } else {
          this.erro = 'Erro interno ao salvar informações.';
        }
        this.cdr.detectChanges();
      },
    });
  }

  excluir(tutor: TutorDTO): void {
    if (!tutor.idTutor) return;

    if (!confirm(`Deseja realmente remover o tutor: "${tutor.nome}" e desvincular seus registros?`)) return;

    this.excluindoId = tutor.idTutor;
    this.erro = '';
    this.sucesso = '';

    this.tutoresService.deletarTutor(tutor.idTutor).subscribe({
      next: () => {
        this.sucesso = 'Tutor removido com sucesso!';
        this.excluindoId = null;
        this.carregarTutores();
      },
      error: (error: HttpErrorResponse) => {
        this.excluindoId = null;
        if (error.status === 409) {
          this.erro = 'Não é possível remover: este tutor possui animais com agendamentos ou históricos ativos.';
        } else {
          this.erro = 'Falha ao tentar remover o registro.';
        }
        this.cdr.detectChanges();
      },
    });
  }
}
