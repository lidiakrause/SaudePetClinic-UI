import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AutenticacaoService, LoginResponseDTO } from '@core/api';

import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
})
export class Login {
  cpf: string = '';
  senha: string = '';
  erro: string = '';

  private authApiService = inject(AutenticacaoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

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

    this.authApiService.login({ cpf: cpfLimpo, senha: this.senha }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.erro = 'CPF ou senha incorretos. Verifique suas credenciais.';
        } else {
          this.erro = 'Erro ao conectar com o servidor. Verifique se o backend está ativo.';
        }

        this.cdr.detectChanges();

        return of(null);
      })
    ).subscribe((resposta: LoginResponseDTO | null) => {
      if (!resposta) return;

      localStorage.setItem('token', resposta.token || '');

      if (resposta.usuario) {
        localStorage.setItem('usuario', JSON.stringify(resposta.usuario));
      }

      this.erro = '';
      this.cdr.detectChanges();
      if (resposta.usuario && resposta.usuario.perfil?.toUpperCase() === 'ADMIN') {
              this.router.navigate(['/gerenciar-clinicas']);
            } else {
              this.router.navigate(['/dashboard']);
            }
    });
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
