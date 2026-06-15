import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
})
export class HomeComponent {

  constructor(private router: Router) {
    if (!localStorage.getItem('usuario')) {
      this.router.navigate(['/']); // Joga de volta para a tela inicial caso não esteja logado
    }
  }

  navegar(rota: string): void {
    this.router.navigate([rota]);
  }

  logout(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/']);
  }
}