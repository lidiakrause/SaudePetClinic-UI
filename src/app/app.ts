import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'
import { Router, RouterOutlet } from '@angular/router';

import { Topbar } from '@core/components/topbar/topbar';
import { Sidebar } from '@core/components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    Topbar,
    Sidebar
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private router = inject(Router);


  public exibirMenu(): boolean {
    return this.router.url !== '/login' && this.router.url !== '/';
  }
}
