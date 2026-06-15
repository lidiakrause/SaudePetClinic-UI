import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-vet',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './loginvet.html', 
})
export class LoginVetComponent {

  cpf = '';
  senha = '';
  erro = '';

  private readonly CPF_TESTE = '12345678901';
  private readonly SENHA_TESTE = 'Veterinario.26';

  constructor(private router: Router) {}

  login(): void {
    this.erro = '';
    const cpfLimpo = this.cpf.replace(/\D/g, '');

    if (!cpfLimpo || !this.senha) {
      this.erro = 'Preencha todos os campos.';
      return;
    }

    if (cpfLimpo === this.CPF_TESTE && this.senha === this.SENHA_TESTE) {
      localStorage.setItem('usuario', JSON.stringify({ cpf: cpfLimpo, perfil: 'veterinario' }));
      this.router.navigate(['/home']);
    } else {
      this.erro = 'CPF ou senha inválidos.';
    }
  }

  formatarCpf(): void {
    let c = this.cpf.replace(/\D/g, '').slice(0, 11);
    c = c.replace(/(\d{3})(\d)/, '$1.$2');
    c = c.replace(/(\d{3})(\d)/, '$1.$2');
    c = c.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    this.cpf = c;
  }
}