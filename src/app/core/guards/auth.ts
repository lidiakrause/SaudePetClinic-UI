import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const rolesPermitidos = route.data['roles'] as Array<string>;

  if (!rolesPermitidos || rolesPermitidos.length === 0) {
    return true;
  }

  const usuarioJson = localStorage.getItem('usuario');
  if (usuarioJson) {
    try {
      const usuario = JSON.parse(usuarioJson);
      const perfilUsuario = usuario.perfil?.toUpperCase();

      if (rolesPermitidos.includes(perfilUsuario)) {
        return true;
      }
    } catch (e) {
    }
  }


  router.navigate(['/home']);
  return false;
};
