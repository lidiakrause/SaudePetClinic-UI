import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UsuariosService, UsuarioRequestDTO, UsuarioResponseDTO } from '@core/api';

@Component({
  selector: 'app-gerenciar-funcionarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciar-funcionarios.html',
  styleUrl: './gerenciar-funcionarios.css',
})
export class GerenciarFuncionarios implements OnInit {
  private usuariosService = inject(UsuariosService);
  private cdr = inject(ChangeDetectorRef);

  idClinicaSelecionada: number | null = null;
  nomeClinicaSelecionada = '';

  funcionarios: UsuarioResponseDTO[] = [];
  carregando = false;
  excluindoId: number | null = null;

  exibirFormulario = false;
  modoEdicao = false;
  idEmEdicao: number | null = null;
  salvando = false;

  cpf = '';
  nome = '';
  senha = '';
  perfilSelecionado: 'VETERINARIO' | 'RECEPCIONISTA' = 'VETERINARIO';

  crmv = '';
  telefone = '';

  horarioInicio = '08:00';
  horarioFim = '18:00';
  atendeSabado = false;
  atendeDomingo = false;

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
        } else if (perfil === 'GESTOR') {
          if (usuarioLogado.idClinica) {
            this.idClinicaSelecionada = Number(usuarioLogado.idClinica);
            this.nomeClinicaSelecionada = usuarioLogado.nomeClinica || `Sua Unidade`;
          }
        }

        if (this.idClinicaSelecionada) {
          this.carregarFuncionarios();
        }
      } catch (e) {
        this.erro = 'Erro ao processar sessão do usuário logado.';
      }
    }
  }

  carregarFuncionarios(): void {
    if (!this.idClinicaSelecionada) return;
    this.carregando = true;
    this.erro = '';

    this.usuariosService.listarUsuarios(this.idClinicaSelecionada).subscribe({
      next: (dados: UsuarioResponseDTO[]) => {
        this.funcionarios = dados.filter((u: UsuarioResponseDTO) => u.perfil !== 'ADMIN' && u.perfil !== 'GESTOR');
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.erro = 'Erro ao carregar a listagem de funcionários.';
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  novoFuncionario(): void {
    this.limparFormulario();
    this.modoEdicao = false;
    this.exibirFormulario = true;
  }

  editarFuncionario(func: UsuarioResponseDTO): void {
    this.limparFormulario();
    this.modoEdicao = true;
    this.idEmEdicao = func.idUsuario ?? null;

    this.cpf = func.cpf ?? '';
    this.nome = func.nome ?? '';
    this.perfilSelecionado = (func.perfil as 'VETERINARIO' | 'RECEPCIONISTA') ?? 'VETERINARIO';
    this.senha = '';

    this.crmv = (func as any).crmv ?? '';
    this.telefone = (func as any).telefone ?? '';

    this.horarioInicio = (func as any).horarioInicio || '08:00';
    this.horarioFim = (func as any).horarioFim || '18:00';
    this.atendeSabado = (func as any).atendeSabado ?? false;
    this.atendeDomingo = (func as any).atendeDomingo ?? false;

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
    this.senha = '';
    this.perfilSelecionado = 'VETERINARIO';
    this.crmv = '';
    this.telefone = '';

    this.horarioInicio = '08:00';
    this.horarioFim = '18:00';
    this.atendeSabado = false;
    this.atendeDomingo = false;

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
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 2) {
      v = `(${v.substring(0, 2)}) ${v.substring(2)}`;
    }
    if (v.length > 9) {
      v = `${v.substring(0, 10)}-${v.substring(10)}`;
    }
    this.telefone = v;
  }

  salvar(): void {
    this.erro = '';
    this.sucesso = '';

    if (!this.idClinicaSelecionada) {
      this.erro = 'Nenhuma clínica selecionada.';
      return;
    }

    const cpfLimpo = this.cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      this.erro = 'Informe um CPF válido.';
      return;
    }
    if (!this.nome.trim()) {
      this.erro = 'Informe o nome do funcionário.';
      return;
    }
    if (!this.modoEdicao && !this.senha) {
      this.erro = 'Informe uma senha de acesso.';
      return;
    }
    if (this.senha && this.senha.length < 6) {
      this.erro = 'A senha deve ter no mínimo 6 caracteres.';
      return;
    }
    if (this.perfilSelecionado === 'VETERINARIO' && !this.crmv.trim()) {
      this.erro = 'O número do CRMV é obrigatório para médicos veterinários.';
      return;
    }

    const payload: any = {
      idClinica: this.idClinicaSelecionada,
      cpf: cpfLimpo,
      nome: this.nome.trim(),
      senha: this.senha || undefined,
      perfil: this.perfilSelecionado as UsuarioRequestDTO.PerfilEnum
    };

    if (this.perfilSelecionado === 'VETERINARIO') {
      payload.crmv = this.crmv.trim().toUpperCase();
      payload.telefone = this.telefone.replace(/\D/g, '') || undefined;

      payload.horarioInicio = this.horarioInicio;
      payload.horarioFim = this.horarioFim;
      payload.atendeSabado = this.atendeSabado;
      payload.atendeDomingo = this.atendeDomingo;
    }

    this.salvando = true;

    const requisicao = this.modoEdicao && this.idEmEdicao !== null
      ? this.usuariosService.atualizarUsuario(this.idEmEdicao, payload)
      : this.usuariosService.criarUsuario(payload);

    requisicao.subscribe({
      next: () => {
        this.sucesso = this.modoEdicao ? 'Dados atualizados com sucesso!' : 'Funcionário cadastrado com sucesso!';
        this.salvando = false;
        this.exibirFormulario = false;
        this.carregarFuncionarios();
      },
      error: (error: HttpErrorResponse) => {
        this.salvando = false;
        if (error.status === 409) {
          this.erro = 'Conflito de dados: CPF ou CRMV já cadastrado no sistema.';
        } else {
          this.erro = 'Erro ao salvar informações da equipe.';
        }
        this.cdr.detectChanges();
      },
    });
  }

  excluir(func: UsuarioResponseDTO): void {
    if (!func.idUsuario) return;
    if (!confirm(`Deseja remover "${func.nome}"?`)) return;

    this.excluindoId = func.idUsuario;
    this.usuariosService.deletarUsuario(func.idUsuario).subscribe({
      next: () => {
        this.sucesso = 'Funcionário removido com sucesso!';
        this.excluindoId = null;
        this.carregarFuncionarios();
      },
      error: () => {
        this.excluindoId = null;
        this.erro = 'Erro ao tentar remover o registro.';
        this.cdr.detectChanges();
      },
    });
  }
}
