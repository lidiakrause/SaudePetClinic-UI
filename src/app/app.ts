import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class AppComponent {

  constructor(private router: Router) {}

  // Função que gerencia o clique de forma manual e segura
  navegar(rota: string): void {
    this.router.navigate([rota]);
  }
}