import { Routes } from '@angular/router';
import { LoginComponent } from './login.recep/loginrecep';
import { LoginVetComponent } from './login.vet/loginvet';
import { HomeComponent } from './home/home';
import { TutorComponent } from './tutor/tutor';
import { AgendamentoComponent } from './agendamento/agendamento';
import { AnimalComponent } from './animal/animal';
import { InicioComponent } from './inicio/inicio';

export const routes: Routes = [
  { path: 'login-recepcionista', component: LoginComponent },
  { path: 'login-veterinario', component: LoginVetComponent },
  { path: 'home', component: HomeComponent },
  { path: 'tutor', component: TutorComponent },
  { path: 'agendamento', component: AgendamentoComponent },
  { path: 'animal', component: AnimalComponent },
  { path: 'inicio', component: InicioComponent },

  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
];