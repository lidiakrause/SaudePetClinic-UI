import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth';

import { Login } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { GerenciarAgendamentos } from './features/agendamentos/agenda/agenda';
import { TelaAtendimento } from './features/agendamentos/atendimento/atendimento';
import { GerenciarAnimais } from './features/gerenciar-animais/gerenciar-animais';
import { GerenciarTutores } from './features/gerenciar-tutores/gerenciar-tutores';
import { GerenciarClinicas } from './features/admin/gerenciar-clinicas/gerenciar-clinicas';
import { GerenciarFuncionarios } from './features/gerenciar-funcionarios/gerenciar-funcionarios';
import { GerenciarGestores } from './features/admin/gerenciar-gestores/gerenciar-gestores';

export const routes: Routes = [
  { path: 'login', component: Login },

  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },

  {
    path: 'agendamento',
    component: GerenciarAgendamentos,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'GESTOR', 'VETERINARIO', 'RECEPCIONISTA'] }
  },

  {
    path: 'atendimento',
    component: TelaAtendimento,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'GESTOR', 'VETERINARIO'] }
  },

  {
    path: 'gerenciar-tutores',
    component: GerenciarTutores,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'GESTOR', 'VETERINARIO', 'RECEPCIONISTA'] }
  },
  {
    path: 'gerenciar-animais',
    component: GerenciarAnimais,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'GESTOR', 'VETERINARIO', 'RECEPCIONISTA'] }
  },

  {
    path: 'gerenciar-funcionarios',
    component: GerenciarFuncionarios,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'GESTOR'] }
  },

  {
    path: 'gerenciar-clinicas',
    component: GerenciarClinicas,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },
  {

    path: 'gerenciar-gestores',
    component: GerenciarGestores,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
