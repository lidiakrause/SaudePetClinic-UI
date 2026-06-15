import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
})
export class AppComponent {
  
  rotaAtual: string = '/';

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.rotaAtual = event.urlAfterRedirects;
      }
    });
  }

  navegar(rota: string): void {
    this.router.navigate([rota]);
  }

  exibirMenu(): boolean {
  const rota = this.rotaAtual.split('?')[0];

  if (rota === '/' || rota === '/login') {
    return false;
  }
  
  return true; 
}
}