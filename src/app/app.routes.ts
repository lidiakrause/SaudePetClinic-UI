import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { HomeComponent } from './home/home';
import { TutorComponent } from './tutor/tutor';
import { AgendamentoComponent } from './agendamento/agendamento';
import { AnimalComponent } from './animal/animal';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'tutor', component: TutorComponent },
  { path: 'agendamento', component: AgendamentoComponent },
  { path: 'animal', component: AnimalComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
