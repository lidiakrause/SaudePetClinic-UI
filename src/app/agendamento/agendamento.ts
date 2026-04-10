import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Agendamento {
  tutor: string;
  animal: string;
  data: string;
  hora: string;
  status: string;
}

@Component({
  selector: 'app-agendamento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agendamento.html',
  styleUrls: ['./agendamento.css'],
})
export class AgendamentoComponent {
  agendamentos: Agendamento[] = [];
}
