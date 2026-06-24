import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ClinicasService, ClinicaDTO } from '@core/api';

@Component({
  selector: 'app-gerenciar-clinicas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciar-clinicas.html',
  styleUrl: './gerenciar-clinicas.css',
})
export class GerenciarClinicas implements OnInit {
  private clinicasService = inject(ClinicasService);
  private cdr = inject(ChangeDetectorRef);

  clinicas: ClinicaDTO[] = [];
  carregando = false;
  excluindoId: number | null = null;
  clinicaAcessadaId: number | null = null;

  exibirFormulario = false;
  modoEdicao = false;
  idEmEdicao: number | null = null;
  salvando = false;

  cnpj = '';
  razaoSocial = '';
  nomeFantasia = '';

  erro = '';
  sucesso = '';

  ngOnInit(): void {
    this.carregarClinicas();

    const adminClinicaId = localStorage.getItem('admin_clinica_id');
    if (adminClinicaId) {
      this.clinicaAcessadaId = Number(adminClinicaId);
    }
  }

  carregarClinicas(): void {
    this.carregando = true;
    this.erro = '';

    this.clinicasService.listarClinicas().subscribe({
      next: (dados: ClinicaDTO[]) => {
        this.clinicas = dados;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.erro = 'Erro ao carregar a listagem do servidor.';
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  novaClinica(): void {
    this.limparFormulario();
    this.modoEdicao = false;
    this.exibirFormulario = true;
  }

  editarClinica(clinica: ClinicaDTO): void {
    this.limparFormulario();
    this.modoEdicao = true;
    this.idEmEdicao = clinica.idClinica ?? null;

    this.cnpj = clinica.cnpj;
    this.razaoSocial = clinica.razaoSocial;
    this.nomeFantasia = clinica.nomeFantasia ?? '';

    this.formatarCnpj();
    this.exibirFormulario = true;
  }

  cancelar(): void {
    this.exibirFormulario = false;
    this.limparFormulario();
  }

  private limparFormulario(): void {
    this.idEmEdicao = null;
    this.cnpj = '';
    this.razaoSocial = '';
    this.nomeFantasia = '';
    this.erro = '';
    this.sucesso = '';
  }

  formatarCnpj(): void {
    let v = this.cnpj.replace(/\D/g, '');
    if (v.length <= 14) {
      v = v.replace(/^(\d{2})(\d)/, '$1.$2');
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
      v = v.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    this.cnpj = v;
  }

  salvar(): void {
    this.erro = '';
    this.sucesso = '';
    const cnpjLimpo = this.cnpj.replace(/\D/g, '');

    if (cnpjLimpo.length !== 14) {
      this.erro = 'Informe um CNPJ válido com 14 dígitos.';
      return;
    }
    if (!this.razaoSocial.trim()) {
      this.erro = 'Informe a razão social.';
      return;
    }

    const payload: ClinicaDTO = {
      cnpj: cnpjLimpo,
      razaoSocial: this.razaoSocial.trim(),
      nomeFantasia: this.nomeFantasia.trim() || undefined,
    };

    this.salvando = true;

  const requisicao = this.modoEdicao && this.idEmEdicao !== null
    ? this.clinicasService.atualizarClinica(this.idEmEdicao, payload)
    : this.clinicasService.criarClinica(payload);

    requisicao.subscribe({
      next: () => {
        this.sucesso = this.modoEdicao ? 'Alterações salvas com sucesso!' : 'Registro cadastrado com sucesso!';
        this.salvando = false;
        this.exibirFormulario = false;
        this.carregarClinicas();
      },
      error: (error: HttpErrorResponse) => {
        this.salvando = false;
        if (error.status === 409) {
          this.erro = 'Conflito de duplicidade: Este registro já existe.';
        } else if (error.status === 403) {
          this.erro = 'Você não possui permissão para executar esta ação.';
        } else {
          this.erro = 'Erro interno ao processar requisição.';
        }
        this.cdr.detectChanges();
      },
    });
  }

  excluir(clinica: ClinicaDTO): void {
    if (!clinica.idClinica) return;

    if (!confirm(`Deseja realmente remover: "${clinica.razaoSocial}"?`)) return;

    this.excluindoId = clinica.idClinica;
    this.erro = '';
    this.sucesso = '';

    this.clinicasService.deletarClinica(clinica.idClinica).subscribe({
      next: () => {
        this.sucesso = 'Registro removido com sucesso!';
        this.excluindoId = null;
        this.carregarClinicas();
      },
      error: (error: HttpErrorResponse) => {
        this.excluindoId = null;
        if (error.status === 409) {
          this.erro = 'Não é possível excluir: existem vínculos ativos associados a este registro.';
        } else {
          this.erro = 'Falha ao tentar remover o registro.';
        }
        this.cdr.detectChanges();
      },
    });
  }

  acessarClinica(clinica: ClinicaDTO): void {
    if (!clinica.idClinica) return;

    localStorage.setItem('admin_clinica_id', clinica.idClinica.toString());
    const nomeExibicao = clinica.nomeFantasia || clinica.razaoSocial;
    localStorage.setItem('admin_clinica_nome', nomeExibicao);

    this.clinicaAcessadaId = clinica.idClinica;

    window.dispatchEvent(new Event('clinicaSelecionada'));
  }
}
