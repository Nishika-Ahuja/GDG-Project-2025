import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot
  ): boolean | UrlTree {
    const userId = route.params['id'];

    if (!userId || userId === 'null') {
      // agar userId null ya undefined hai, toh login pe bhej do
      return this.router.parseUrl('/login');
    }

    return true;
  }
}
