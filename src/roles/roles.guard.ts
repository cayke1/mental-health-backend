import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/custom/decorators/roles.decorator';
import { Role } from 'src/custom/enum/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user) throw new UnauthorizedException('User not found');

    if (typeof user.role === 'string') {
      return requiredRoles.some((role) => user.role === role);
    }

    if (Array.isArray(user.roles)) {
      return requiredRoles.some((role) => user.roles.includes(role));
    }

    if (Array.isArray(user.role)) {
      return requiredRoles.some((role) => user.role.includes(role));
    }

    throw new UnauthorizedException('User role not found');
  }
}
