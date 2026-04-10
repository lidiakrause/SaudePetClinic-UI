import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CadastroService {
  private apiUrl = 'http://localhost:8080/cadastro';

  constructor(private http: HttpClient) {}

  cadastrar(dados: any) {
    return this.http.post(this.apiUrl, dados);
  }

  listar() {
    return this.http.get(this.apiUrl);
  }
}
