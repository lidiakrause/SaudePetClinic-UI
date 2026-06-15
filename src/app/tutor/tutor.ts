import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interface que espelha exatamente a estrutura de dados do documento
interface Tutor {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  endereco: string;
  ativo: boolean; // Atributo essencial para cumprir a RN-05 (Histórico)
}

@Component({
  selector: 'app-tutor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tutor.html',
})
export class TutorComponent implements OnInit {

  // Modelo do formulário
  tutor: Omit<Tutor, 'id' | 'ativo'> = {
    nome: '',
    cpf: '',
    telefone: '',
    endereco: ''
  };

  // Estados de controle da tela
  listaTutores: Tutor[] = [];
  editandoId: number | null = null;
  msgErro: string = '';
  msgSucesso: string = '';

  ngOnInit(): void {
    this.carregarTutores();
  }

  // Carrega a lista simulada do LocalStorage para manter os dados salvos
  carregarTutores(): void {
    const dados = localStorage.getItem('tutores');
    if (dados) {
      this.listaTutores = JSON.parse(dados);
    } else {
      // Massa de teste inicial
      this.listaTutores = [
        { id: 1, nome: 'Glaucio Dantas', cpf: '11122233344', telefone: '44981323213', endereco: 'Rua Central, 123', ativo: true }
      ];
      this.salvarNoStorage();
    }
  }

  salvarNoStorage(): void {
    localStorage.setItem('tutores', JSON.stringify(this.listaTutores));
  }

  // Ação principal de salvar (Cadastrar ou Editar)
  salvar(): void {
    this.msgErro = '';
    this.msgSucesso = '';

    // Limpa máscaras para validação limpa dos dados numéricos
    const cpfLimpo = this.tutor.cpf.replace(/\D/g, '');
    const telefoneLimpo = this.tutor.telefone.replace(/\D/g, '');

    // ── RN-01: Verificação de campos obrigatórios ──
    if (!this.tutor.nome.trim() || !cpfLimpo || !telefoneLimpo || !this.tutor.endereco.trim()) {
      this.msgErro = 'Preencha todos os campos obrigatórios. (MSG-02)'; // Baseado em MSG-02
      return;
    }

    // ── RN-04: Formato e tamanho do Telefone (Entre 10 e 11 dígitos) ──
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      this.msgErro = 'Formato inválido para o campo informado. O telefone deve ter entre 10 e 11 dígitos. (MSG-04)'; // Baseado em RN-04 / MSG-04
      return;
    }

    if (this.editandoId !== null) {
      // ── MODO EDIÇÃO (Fluxo Alternativo) ──
      
      // RN-02: O CPF não pode colidir com o de OUTRO tutor existente
      const cpfDuplicado = this.listaTutores.some(t => t.cpf === cpfLimpo && t.id !== this.editandoId && t.ativo);
      if (cpfDuplicado) {
        this.msgErro = 'CPF já cadastrado para outro tutor. (MSG-03)'; // Baseado em RN-02 / MSG-03
        return;
      }

      // Atualiza os dados
      this.listaTutores = this.listaTutores.map(t => {
        if (t.id === this.editandoId) {
          return { ...t, nome: this.tutor.nome, cpf: cpfLimpo, telefone: telefoneLimpo, endereco: this.tutor.endereco };
        }
        return t;
      });

      this.msgSucesso = 'Dados atualizados com sucesso! (MSG-05)'; // Baseado em MSG-05
      this.editandoId = null;

    } else {
      // ── MODO CADASTRO (Fluxo Principal) ──

      // RN-03: O CPF deve ser único no sistema
      const cpfDuplicado = this.listaTutores.some(t => t.cpf === cpfLimpo && t.ativo);
      if (cpfDuplicado) {
        this.msgErro = 'CPF já cadastrado. (MSG-03)'; // Baseado em RN-03 / MSG-03
        return;
      }

      // Cria um novo registro ativo por padrão
      const novoTutor: Tutor = {
        id: this.listaTutores.length > 0 ? Math.max(...this.listaTutores.map(t => t.id)) + 1 : 1,
        nome: this.tutor.nome,
        cpf: cpfLimpo,
        telefone: telefoneLimpo,
        endereco: this.tutor.endereco,
        ativo: true // Sempre inicia ativo
      };

      this.listaTutores.push(novoTutor);
      this.msgSucesso = 'Cadastro realizado com sucesso! (MSG-01)'; // Baseado em MSG-01
    }

    this.salvarNoStorage();
    this.limparFormulario();
  }

  // Prepara os campos para edição na tela (Fluxo Alternativo)
  editar(tutorParaEditar: Tutor): void {
    this.editandoId = tutorParaEditar.id;
    this.tutor = {
      nome: tutorParaEditar.nome,
      cpf: tutorParaEditar.cpf,
      telefone: tutorParaEditar.telefone,
      endereco: tutorParaEditar.endereco
    };
    this.msgErro = '';
    this.msgSucesso = '';
  }

  // ── RN-05: Tutores podem ser inativados, mas NUNCA excluídos fisicamente ──
  inativar(id: number): void {
    this.listaTutores = this.listaTutores.map(t => {
      if (t.id === id) {
        return { ...t, ativo: false }; // Inativa o registro mantendo-o no histórico
      }
      return t;
    });

    this.msgSucesso = 'Tutor inativo com sucesso! (MSG-08)'; // Baseado em RN-05 / MSG-08
    this.salvarNoStorage();
    
    if (this.editandoId === id) {
      this.cancelarEdicao();
    }
  }

  cancelarEdicao(): void {
    this.editandoId = null;
    this.limparFormulario();
    this.msgErro = '';
  }

  limparFormulario(): void {
    this.tutor = { nome: '', cpf: '', telefone: '', endereco: '' };
  }

  // Métodos auxiliares de formatação visual (Máscaras)
  formatarCpf(): void {
    let value = this.tutor.cpf.replace(/\D/g, '').slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    this.tutor.cpf = value;
  }

  formatarTelefone(): void {
    let value = this.tutor.telefone.replace(/\D/g, '').slice(0, 11);
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    }
    this.tutor.telefone = value;
  }
}