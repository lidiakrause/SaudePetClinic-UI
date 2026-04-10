import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  cnpj: string = '';
  senha: string = '';
  erro: string = '';

  constructor(private router: Router) {}

  login() {
    if (!this.cnpj || !this.senha) {
      this.erro = 'Preencha todos os campos';
      return;
    }

    const cnpjLimpo = this.cnpj.replace(/\D/g, '');

    if (cnpjLimpo === '12345678000126' && this.senha === 'Cachorro.26') {
      this.erro = '';
      this.router.navigate(['/home']);
    } else {
      this.erro = 'Credenciais inválidas';
    }
  }

  formatarCnpj() {
    let cnpj = this.cnpj.replace(/\D/g, '');

    if (cnpj.length > 14) {
      cnpj = cnpj.substring(0, 14);
    }

    cnpj = cnpj.replace(/^(\d{2})(\d)/, '$1.$2');
    cnpj = cnpj.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    cnpj = cnpj.replace(/\.(\d{3})(\d)/, '.$1/$2');
    cnpj = cnpj.replace(/(\d{4})(\d)/, '$1-$2');

    this.cnpj = cnpj;
  }
}
