import { META_ROLES } from '@auth/guards/user-role.guard';
import { Rol } from '@database/interfaces/data';
import { SetMetadata } from '@nestjs/common';

export const RoleProtected = (...args: Rol[]) => SetMetadata(META_ROLES, args);
