import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UsuariosService, UsuarioRequestDTO, UsuarioResponseDTO } from '@core/api';

@Component({
  selector: 'app-gerenciar-gestores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciar-gestores.html',
  styleUrl: './gerenciar-gestores.css',
})
export class GerenciarGestores implements OnInit {
  private usuariosService = inject(UsuariosService);
  private cdr = inject(ChangeDetectorRef);

  idClinicaSelecionada: number | null = null;
  nomeClinicaSelecionada = '';

  gestores: UsuarioResponseDTO[] = [];
  carregando = false;
  excluindoId: number | null = null;

  exibirFormulario = false;
  modoEdicao = false;
  idEmEdicao: number | null = null;
  salvando = false;

  cpf = '';
  nome = '';
  senha = '';

  erro = '';
  sucesso = '';

  ngOnInit(): void {
    const adminClinicaId = localStorage.getItem('admin_clinica_id');
    const adminClinicaNome = localStorage.getItem('admin_clinica_nome');

    if (adminClinicaId) {
      this.idClinicaSelecionada = Number(adminClinicaId);
      this.nomeClinicaSelecionada = adminClinicaNome || `Clínica #${adminClinicaId}`;
      this.carregarGestores();
    }
  }

  carregarGestores(): void {
    if (!this.idClinicaSelecionada) return;

    this.carregando = true;
    this.erro = '';

    this.usuariosService.listarUsuarios(this.idClinicaSelecionada).subscribe({
      next: (dados: UsuarioResponseDTO[]) => {
        this.gestores = dados.filter((u: UsuarioResponseDTO) => u.perfil === 'GESTOR');
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.erro = 'Erro ao carregar a listagem de gestores do servidor.';
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  novoGestor(): void {
    this.limparFormulario();
    this.modoEdicao = false;
    this.exibirFormulario = true;
  }

  editarGestor(gestor: UsuarioResponseDTO): void {
    this.limparFormulario();
    this.modoEdicao = true;
    this.idEmEdicao = gestor.idUsuario ?? null;

    this.cpf = gestor.cpf ?? '';
    this.nome = gestor.nome ?? '';
    this.senha = '';

    this.formatarCpf();
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

  salvar(): void {
    this.erro = '';
    this.sucesso = '';

    if (!this.idClinicaSelecionada) {
      this.erro = 'Nenhuma clínica selecionada para associar o gestor.';
      return;
    }

    const cpfLimpo = this.cpf.replace(/\D/g, '');

    if (cpfLimpo.length !== 11) {
      this.erro = 'Informe um CPF válido com 11 dígitos.';
      return;
    }
    if (!this.nome.trim()) {
      this.erro = 'Informe o nome do gestor.';
      return;
    }
    if (!this.modoEdicao && !this.senha) {
      this.erro = 'Informe uma senha para o novo gestor.';
      return;
    }

    const payload: UsuarioRequestDTO = {
      idClinica: this.idClinicaSelecionada,
      cpf: cpfLimpo,
      nome: this.nome.trim(),
      senha: this.senha,
      perfil: 'GESTOR' as UsuarioRequestDTO.PerfilEnum
    };

    this.salvando = true;

    const requisicao = this.modoEdicao && this.idEmEdicao !== null
      ? this.usuariosService.atualizarUsuario(this.idEmEdicao, payload)
      : this.usuariosService.criarUsuario(payload);

    requisicao.subscribe({
      next: () => {
        this.sucesso = this.modoEdicao ? 'Alterações salvas com sucesso!' : 'Gestor cadastrado com sucesso!';
        this.salvando = false;
        this.exibirFormulario = false;
        this.carregarGestores();
      },
      error: (error: HttpErrorResponse) => {
        this.salvando = false;
        if (error.status === 409) {
          this.erro = 'Conflito de duplicidade: Este CPF já está cadastrado.';
        } else if (error.status === 403) {
          this.erro = 'Você não possui permissão para executar esta ação.';
        } else {
          this.erro = 'Erro interno ao processar requisição.';
        }
        this.cdr.detectChanges();
      },
    });
  }

  excluir(gestor: UsuarioResponseDTO): void {
    if (!gestor.idUsuario) return;

    if (!confirm(`Deseja realmente remover o gestor: "${gestor.nome}"?`)) return;

    this.excluindoId = gestor.idUsuario;
    this.erro = '';
    this.sucesso = '';

    this.usuariosService.deletarUsuario(gestor.idUsuario).subscribe({
      next: () => {
        this.sucesso = 'Gestor removido com sucesso!';
        this.excluindoId = null;
        this.carregarGestores();
      },
      error: (error: HttpErrorResponse) => {
        this.excluindoId = null;
        if (error.status === 409) {
          this.erro = 'Não é possível excluir: existem vínculos ativos associados a este usuário.';
        } else {
          this.erro = 'Falha ao tentar remover o gestor.';
        }
        this.cdr.detectChanges();
      },
    });
  }
}
