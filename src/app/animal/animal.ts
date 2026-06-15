import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaces que espelham o modelo de dados do documento
interface Tutor {
  id: number;
  nome: string;
  cpf: string;
  ativo: boolean;
}

interface Animal {
  id: number;
  nome: string;
  especie: string;
  raca: string;
  idade: number;
  peso: number;
  sexo: string;
  idTutor: number; // Chave estrangeira para o Tutor
  nomeTutor?: string; // Campo auxiliar para exibir na tabela
  ativo: boolean; // Essencial para o histórico médico (RN-05)
}

@Component({
  selector: 'app-animal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './animal.html',
})
export class AnimalComponent implements OnInit {

  // Modelo do formulário do animal
  animal: Omit<Animal, 'id' | 'ativo'> = {
    nome: '',
    especie: '',
    raca: '',
    idade: 0,
    peso: 0,
    sexo: '',
    idTutor: 0
  };

  // Listas de controle
  listaAnimais: Animal[] = [];
  listaTutoresAtivos: Tutor[] = []; // Para carregar no <select> do formulário
  editandoId: number | null = null;
  msgErro: string = '';
  msgSucesso: string = '';

  ngOnInit(): void {
    this.carregarTutores();
    this.carregarAnimais();
  }

  // Carrega tutores do localStorage para permitir o vínculo obrigatório
  carregarTutores(): void {
    const dados = localStorage.getItem('tutores');
    if (dados) {
      const todosTutores: Tutor[] = JSON.parse(dados);
      // Filtra apenas os tutores ATIVOS para o cadastro do animal
      this.listaTutoresAtivos = todosTutores.filter(t => t.ativo);
    }
  }

  carregarAnimais(): void {
    const dados = localStorage.getItem('animais');
    if (dados) {
      this.listaAnimais = JSON.parse(dados);
    } else {
      // Massa de testes inicial
      this.listaAnimais = [
        { id: 1, nome: 'Thor', especie: 'Cão', raca: 'Golden Retriever', idade: 3, peso: 32.5, sexo: 'Macho', idTutor: 1, ativo: true }
      ];
      this.salvarNoStorage();
    }
    this.vincularNomesTutores();
  }

  // Vincula o nome do tutor ao objeto do animal apenas para exibição na tabela
  vincularNomesTutores(): void {
    const dadosTutores = localStorage.getItem('tutores');
    if (dadosTutores) {
      const tutores: Tutor[] = JSON.parse(dadosTutores);
      this.listaAnimais.forEach(ani => {
        const tutorEncontrado = tutores.find(t => t.id === ani.idTutor);
        ani.nomeTutor = tutorEncontrado ? tutorEncontrado.nome : 'Tutor Não Encontrado';
      });
    }
  }

  salvarNoStorage(): void {
    localStorage.setItem('animais', JSON.stringify(this.listaAnimais));
  }

  // Ação de Salvar (Cadastrar ou Editar)
  salvar(): void {
    this.msgErro = '';
    this.msgSucesso = '';

    // Converter idTutor para número para garantir a consistência
    const tutorId = Number(this.animal.idTutor);

    // ── RN-01: Verificação de campos obrigatórios ──
    if (!this.animal.nome.trim() || !this.animal.especie.trim() || !this.animal.raca.trim() || !this.animal.sexo || !tutorId) {
      this.msgErro = 'Preencha todos os campos obrigatórios. (MSG-02)';
      return;
    }

    // ── RN-02 e RN-03: Idade e Peso devem ser maiores que zero ──
    if (this.animal.idade <= 0 || this.animal.peso <= 0) {
      this.msgErro = 'Idade ou peso informados são inválidos. Verifique os valores. (MSG-03)';
      return;
    }

    // ── Validação de Segurança: Garante que o tutor selecionado existe e continua ativo ──
    const tutorValido = this.listaTutoresAtivos.some(t => t.id === tutorId);
    if (!tutorValido) {
      this.msgErro = 'O tutor selecionado não existe ou está inativo. (MSG-04)';
      return;
    }

    if (this.editandoId !== null) {
      // ── MODO EDIÇÃO ──
      this.listaAnimais = this.listaAnimais.map(ani => {
        if (ani.id === this.editandoId) {
          return { 
            ...ani, 
            nome: this.animal.nome, 
            especie: this.animal.especie, 
            raca: this.animal.raca, 
            idade: this.animal.idade, 
            peso: this.animal.peso, 
            sexo: this.animal.sexo, 
            idTutor: tutorId 
          };
        }
        return ani;
      });

      this.msgSucesso = 'Dados do animal atualizados com sucesso! (MSG-05)';
      this.editandoId = null;

    } else {
      // ── MODO CADASTRO ──
      const novoAnimal: Animal = {
        id: this.listaAnimais.length > 0 ? Math.max(...this.listaAnimais.map(a => a.id)) + 1 : 1,
        nome: this.animal.nome,
        especie: this.animal.especie,
        raca: this.animal.raca,
        idade: this.animal.idade,
        peso: this.animal.peso,
        sexo: this.animal.sexo,
        idTutor: tutorId,
        ativo: true
      };

      this.listaAnimais.push(novoAnimal);
      this.msgSucesso = 'Animal cadastrado com sucesso! (MSG-01)';
    }

    this.salvarNoStorage();
    this.vincularNomesTutores();
    this.limparFormulario();
  }

  editar(animalParaEditar: Animal): void {
    this.editandoId = animalParaEditar.id;
    this.animal = {
      nome: animalParaEditar.nome,
      especie: animalParaEditar.especie,
      raca: animalParaEditar.raca,
      idade: animalParaEditar.idade,
      peso: animalParaEditar.peso,
      sexo: animalParaEditar.sexo,
      idTutor: animalParaEditar.idTutor
    };
    this.msgErro = '';
    this.msgSucesso = '';
  }

  // ── RN-05: Animais são inativados, preservando o prontuário clínico ──
  inativar(id: number): void {
    this.listaAnimais = this.listaAnimais.map(ani => {
      if (ani.id === id) {
        return { ...ani, ativo: false };
      }
      return ani;
    });

    this.msgSucesso = 'Animal inativado com sucesso! (MSG-08)';
    this.salvarNoStorage();
    this.vincularNomesTutores();

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
    this.animal = { nome: '', especie: '', raca: '', idade: 0, peso: 0, sexo: '', idTutor: 0 };
  }
}