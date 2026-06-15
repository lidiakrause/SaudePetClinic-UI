import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TutorService {

  private api = 'http://localhost:8080/tutores';

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  salvar(tutor: { nome: string; telefone: string; email: string }): Observable<any> {
    return this.http.post(this.api, tutor);
  }
}