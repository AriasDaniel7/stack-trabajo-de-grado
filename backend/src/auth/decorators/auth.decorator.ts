import { UserRoleGuard } from '@auth/guards/user-role.guard';
import { Rol } from '@database/interfaces/data';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleProtected } from './role-protected.decorator';

export const Auth = (...roles: Rol[]) => {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard('jwt'), UserRoleGuard),
  );
};
