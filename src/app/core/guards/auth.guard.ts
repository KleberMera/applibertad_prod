import { Injectable } from '@angular/core';
import { 
  CanActivate,
  CanActivateChild,
  CanLoad,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Route,
  UrlSegment,
  CanActivateFn 
} from '@angular/router';
import { INTERNAL_ROUTES } from '@data/constants/routes';
import { AuthService } from '@data/services/api/auth.service';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  return true;
};

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAuth(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAuth(state.url);
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean {
    const url = segments.map(segment => segment.path).join('/');
    return this.checkAuth(`/${url}`);
  }

  private checkAuth(url: string): boolean {
    const currentUser = this.authService.getUser;
    
    // console.log('AuthGuard - Usuario actual:', currentUser);
    // console.log('AuthGuard - URL solicitada:', url);
    
    // Verificar si el usuario está autenticado
    if (!currentUser) {
      // console.log('AuthGuard - Usuario no autenticado, redirigiendo al login');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: url }
      });
      return false;
    }

    const resetPassword = Number(currentUser.RESET_PASSWORD);
    const isChangePasswordRoute = url === '/panel/admin/changePassword';
    
    // console.log('AuthGuard - RESET_PASSWORD:', resetPassword);
    // console.log('AuthGuard - Es ruta de cambio de contraseña:', isChangePasswordRoute);

    // Si RESET_PASSWORD = 1, solo permitir la ruta de cambio de contraseña
    if (resetPassword === 1) {
      if (!isChangePasswordRoute) {
        // console.log('AuthGuard - Usuario debe cambiar contraseña, redirigiendo...');
        this.router.navigate(['/panel/admin/changePassword']);
        return false;
      }
      // Si está en la ruta de cambio de contraseña y RESET_PASSWORD = 1, permitir
      // console.log('AuthGuard - Permitiendo acceso a cambio de contraseña (obligatorio)');
      return true;
    }

    // Si RESET_PASSWORD = 0, permitir acceso a todas las rutas (incluyendo changePassword)
    // console.log('AuthGuard - Usuario puede navegar libremente');
    return true;
  }
}