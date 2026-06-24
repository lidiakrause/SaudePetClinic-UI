import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AnimaisService, AnimalDTO, TutoresService, TutorDTO } from '@core/api';

@Component({
  selector: 'app-gerenciar-animais',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gerenciar-animais.html',
  styleUrl: './gerenciar-animais.css',
})
export class GerenciarAnimais implements OnInit {
  private animaisService = inject(AnimaisService);
  private tutoresService = inject(TutoresService);
  private cdr = inject(ChangeDetectorRef);

  idClinicaSelecionada: number | null = null;
  nomeClinicaSelecionada = '';

  animais: AnimalDTO[] = [];
  carregando = false;
  excluindoId: number | null = null;

  exibirFormulario = false;
  modoEdicao = false;
  idEmEdicao: number | null = null;
  salvando = false;

  nome = '';
  especie = 'CACHORRO';
  raca = '';
  sexo = 'MACHO';
  peso: number | null = null;
  idTutor: number | null = null;

  todosTutores: TutorDTO[] = [];
  sugestoesTutores: TutorDTO[] = [];
  termoBuscaTutor = '';
  exibirDropdownTutores = false;

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
          this.carregarAnimais();
          this.carregarTodosTutores();
        }
      } catch (e) {
        this.erro = 'Erro ao processar sessão do usuário logado.';
      }
    }
  }

  carregarAnimais(): void {
    if (!this.idClinicaSelecionada) return;
    this.carregando = true;
    this.animaisService.listarAnimais(this.idClinicaSelecionada).subscribe({
      next: (dados: AnimalDTO[]) => {
        this.animais = dados;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.erro = 'Erro ao carregar a listagem de animais.';
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  carregarTodosTutores(): void {
  this.tutoresService.listarTutores(this.idClinicaSelecionada!).subscribe({
    next: (dados: TutorDTO[]) => {
      this.todosTutores = dados;
      this.cdr.detectChanges();
      }
    });
  }

  filtrarTutoresDinamico(): void {
    const busca = this.termoBuscaTutor.toLowerCase().trim();

    if (busca.length < 2) {
      this.sugestoesTutores = [];
      this.exibirDropdownTutores = false;
      this.idTutor = null;
      return;
    }

    this.sugestoesTutores = this.todosTutores.filter(t =>
      (t.nome && t.nome.toLowerCase().includes(busca)) ||
      (t.cpf && t.cpf.includes(busca))
    );
    this.exibirDropdownTutores = this.sugestoesTutores.length > 0;
  }

  selecionarTutorDropdown(tutor: TutorDTO): void {
    this.idTutor = tutor.idTutor ?? null;
    this.termoBuscaTutor = tutor.nome ?? '';
    this.exibirDropdownTutores = false;
  }

  novoAnimal(): void {
    this.limparFormulario();
    this.modoEdicao = false;
    this.exibirFormulario = true;
  }

  editarAnimal(animal: AnimalDTO): void {
    this.limparFormulario();
    this.modoEdicao = true;
    this.idEmEdicao = animal.idAnimal ?? null;

    this.nome = animal.nome ?? '';
    this.especie = animal.especie ?? 'CACHORRO';
    this.raca = animal.raca ?? '';
    this.sexo = animal.sexo ?? 'MACHO';
    this.peso = animal.peso ?? null;

    this.idTutor = animal.idTutor ?? null;
    const tutorCorrespondente = this.todosTutores.find(t => t.idTutor === this.idTutor);
    this.termoBuscaTutor = tutorCorrespondente ? (tutorCorrespondente.nome ?? '') : `Tutor #${this.idTutor}`;

    this.exibirFormulario = true;
  }

  cancelar(): void {
    this.exibirFormulario = false;
    this.limparFormulario();
  }

  private limparFormulario(): void {
    this.idEmEdicao = null;
    this.nome = '';
    this.especie = 'CACHORRO';
    this.raca = '';
    this.sexo = 'MACHO';
    this.peso = null;
    this.idTutor = null;
    this.termoBuscaTutor = '';
    this.sugestoesTutores = [];
    this.exibirDropdownTutores = false;
    this.erro = '';
    this.sucesso = '';
  }

  salvar(): void {
    this.erro = '';
    this.sucesso = '';

    if (!this.idClinicaSelecionada) {
      this.erro = 'Nenhuma clínica associada a esta operação.';
      return;
    }
    if (!this.nome.trim()) {
      this.erro = 'Informe o nome do animal.';
      return;
    }
    if (!this.idTutor) {
      this.erro = 'Por favor, selecione um tutor válido da lista de sugestões.';
      return;
    }

    const payload: AnimalDTO = {
      idTutor: this.idTutor,
      nome: this.nome.trim(),
      especie: this.especie,
      raca: this.raca.trim() || undefined,
      sexo: this.sexo,
      peso: this.peso ?? undefined
    };

    this.salvando = true;

  const requisicao = this.modoEdicao && this.idEmEdicao !== null
    ? this.animaisService.atualizarAnimal(this.idEmEdicao, payload)
    : this.animaisService.criarAnimal(payload);

    requisicao.subscribe({
      next: () => {
        this.sucesso = this.modoEdicao ? 'Dados do animal atualizados!' : 'Animal cadastrado com sucesso!';
        this.salvando = false;
        this.exibirFormulario = false;
        this.carregarAnimais();
      },
      error: (error: HttpErrorResponse) => {
        this.salvando = false;
        if (error.status === 404) {
          this.erro = 'Tutor não encontrado.';
        } else {
          this.erro = 'Erro interno ao salvar informações do animal.';
        }
        this.cdr.detectChanges();
      },
    });
  }

getDescricaoTutor(idTutor: number | undefined): string {
  if (!idTutor) return 'Sem Tutor';
  const tutor = this.todosTutores.find(t => t.idTutor === idTutor);
  return tutor ? (tutor.nome ?? '') : `Tutor #${idTutor}`;
}

  excluir(animal: AnimalDTO): void {
    if (!animal.idAnimal) return;
    if (!confirm(`Deseja realmente remover o animal "${animal.nome}"?`)) return;

    this.excluindoId = animal.idAnimal;
    this.erro = '';
    this.sucesso = '';

    this.animaisService.deletarAnimal(animal.idAnimal).subscribe({
      next: () => {
        this.sucesso = 'Animal removido com sucesso!';
        this.excluindoId = null;
        this.carregarAnimais();
      },
      error: (error: HttpErrorResponse) => {
        this.excluindoId = null;
        this.erro = 'Falha ao tentar remover o animal.';
        this.cdr.detectChanges();
      },
    });
  }
}
