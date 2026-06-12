import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnimalService {

  private api = 'http://localhost:8080/animais';

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  salvar(animal: { nome: string; especie: string; raca: string; idade: number; tutorId: number }): Observable<any> {
    return this.http.post(this.api, animal);
  }
}
