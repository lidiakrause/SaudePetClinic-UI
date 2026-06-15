import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-recep',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './loginrecep.html',
})
export class LoginComponent {

  cnpj = '';
  senha = '';
  erro = '';

  private readonly CNPJ_TESTE = '12345678000126';
  private readonly SENHA_TESTE = 'Cachorro.26';

  constructor(private router: Router) {}

  login(): void {
    this.erro = '';

    const cnpjLimpo = this.cnpj.replace(/\D/g, '');

    if (!cnpjLimpo || !this.senha) {
      this.erro = 'Preencha todos os campos.';
      return;
    }

    if (cnpjLimpo === this.CNPJ_TESTE && this.senha === this.SENHA_TESTE) {
      localStorage.setItem('usuario', JSON.stringify({ cnpj: cnpjLimpo }));
      this.router.navigate(['/home']);
    } else {
      this.erro = 'CNPJ ou senha inválidos.';
    }
  }

  formatarCnpj(): void {
    let c = this.cnpj.replace(/\D/g, '').slice(0, 14);
    c = c.replace(/^(\d{2})(\d)/, '$1.$2');
    c = c.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    c = c.replace(/\.(\d{3})(\d)/, '.$1/$2');
    c = c.replace(/(\d{4})(\d)/, '$1-$2');
    this.cnpj = c;
  }
}
