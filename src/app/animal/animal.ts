import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TutorService } from '../services/tutor.service';
import { AnimalService } from '../Services/animal.service';

@Component({
  selector: 'app-animal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './animal.html',
})
export class AnimalComponent implements OnInit {

  nome = '';
  especie = '';
  raca = '';
  idade: number | null = null;
  tutorId: number | null = null;

  erro = '';
  sucesso = '';
  carregando = false;

  animais: any[] = [];
  tutores: any[] = [];

  constructor(
    private tutorService: TutorService,
    private animalService: AnimalService,
  ) {}

  ngOnInit(): void {
    this.tutorService.listar().subscribe({
      next: (dados) => this.tutores = dados,
      error: () => this.erro = 'Erro ao carregar tutores.',
    });
    this.carregarAnimais();
  }

  carregarAnimais(): void {
    this.animalService.listar().subscribe({
      next: (dados) => this.animais = dados,
      error: () => this.erro = 'Erro ao carregar animais.',
    });
  }

  salvar(): void {
    this.erro = '';
    this.sucesso = '';

    if (!this.nome.trim() || !this.especie || !this.raca.trim() || this.idade == null || !this.tutorId) {
      this.erro = 'Preencha todos os campos.';
      return;
    }

    if (this.idade < 0 || this.idade > 50) {
      this.erro = 'Idade inválida.';
      return;
    }

    this.carregando = true;

    this.animalService.salvar({
      nome: this.nome.trim(),
      especie: this.especie,
      raca: this.raca.trim(),
      idade: this.idade,
      tutorId: this.tutorId,
    }).subscribe({
      next: () => {
        this.sucesso = 'Animal cadastrado com sucesso!';
        this.nome = '';
        this.especie = '';
        this.raca = '';
        this.idade = null;
        this.tutorId = null;
        this.carregarAnimais();
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Erro ao salvar animal.';
        this.carregando = false;
      },
    });
  }
}
