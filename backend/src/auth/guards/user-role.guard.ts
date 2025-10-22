import { UserEntity } from '@database/entities/user';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

export const META_ROLES = 'roles';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req['user'] as UserEntity;

    if (!user) {
      throw new BadRequestException('User not found in request');
    }

    if (validRoles.includes(user.role)) return true;

    throw new UnauthorizedException(
      `User ${user.name} does not have the required roles: [${validRoles.join(', ')}]`,
    );
  }
}
