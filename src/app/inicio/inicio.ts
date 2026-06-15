import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
})
export class InicioComponent {
  
  constructor(private router: Router) {}

  irParaLogin(perfil: string): void {
    if (perfil === 'recepcionista') {
      this.router.navigate(['/login-recepcionista']);
    } else {
      this.router.navigate(['/login-veterinario']);
    }
  }
}