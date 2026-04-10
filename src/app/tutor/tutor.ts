import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tutor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tutor.html',
  styleUrls: ['./tutor.css'],
})
export class TutorComponent {
  nome: string = '';
  cpf: string = '';
  telefone: string = '';

  erro: string = '';
  sucesso: string = '';

  tutores: any[] = [];

  salvar() {
    const cpfLimpo = this.cpf.replace(/\D/g, '');
    const telefoneLimpo = this.telefone.replace(/\D/g, '');

    if (!this.nome || !cpfLimpo || !telefoneLimpo) {
      this.erro = 'Preencha todos os campos obrigatórios';
      this.sucesso = '';
      return;
    }

    if (cpfLimpo.length !== 11) {
      this.erro = 'CPF inválido';
      this.sucesso = '';
      return;
    }

    if (!/^\d{10,11}$/.test(telefoneLimpo)) {
      this.erro = 'Telefone inválido';
      this.sucesso = '';
      return;
    }

    this.erro = '';
    this.sucesso = 'Cadastro realizado com sucesso!';

    this.tutores.push({
      nome: this.nome,
      cpf: this.cpf,
      telefone: this.telefone,
    });

    this.nome = '';
    this.cpf = '';
    this.telefone = '';
  }

  somenteTexto(event: any) {
    event.target.value = event.target.value.replace(/[0-9]/g, '');
  }

  formatarCpf() {
    let cpf = this.cpf.replace(/\D/g, '');

    if (cpf.length > 11) {
      cpf = cpf.slice(0, 11);
    }

    if (cpf.length > 9) {
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (cpf.length > 6) {
      cpf = cpf.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (cpf.length > 3) {
      cpf = cpf.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }

    this.cpf = cpf;
  }

  // MÁSCARA TELEFONE
  formatarTelefone() {
    let tel = this.telefone.replace(/\D/g, '');

    if (tel.length > 11) {
      tel = tel.slice(0, 11);
    }

    if (tel.length > 10) {
      tel = tel.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
    } else if (tel.length > 6) {
      tel = tel.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
    } else if (tel.length > 2) {
      tel = tel.replace(/(\d{2})(\d{1,5})/, '($1) $2');
    }

    this.telefone = tel;
  }
}
