import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AgendamentoService {

  private api = 'http://localhost:8080/agendamentos';

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  salvar(agendamento: { animalId: number; dataHora: string; servico: string }): Observable<any> {
    return this.http.post(this.api, agendamento);
  }
}
