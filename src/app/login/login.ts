import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  cpf: string = '';
  senha: string = '';
  erro: string = '';

  constructor(private router: Router) {}

  login(): void {
    const cpfLimpo = this.cpf.replace(/\D/g, '');

    if (cpfLimpo.length !== 11) {
      this.erro = 'Por favor, insira um CPF válido com 11 dígitos.';
      return;
    }

    if (!this.senha) {
      this.erro = 'Por favor, digite sua senha.';
      return;
    }

    // Validação dos dados de teste
    if (cpfLimpo === '04411144421' && this.senha === 'saudepet123') {
      localStorage.setItem('usuario', cpfLimpo);
      this.erro = '';
      this.router.navigate(['/home']);
    } else {
      this.erro = "CPF ou Senha inválidos para teste. Use CPF: 044.111.444-21 e Senha: saudepet123";
    }
  }

  formatarCpf(): void {
    let v = this.cpf.replace(/\D/g, '');
    
    if (v.length <= 11) {
      v = v.replace(/^(\d{3})(\d)/, '$1.$2');
      v = v.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    
    this.cpf = v;
  }
}