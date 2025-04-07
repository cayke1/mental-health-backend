// In roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/custom/enum/roles.enum';

export const ROLES_KEY = 'roles';
export const Roles = (roles: Role[]) => SetMetadata(ROLES_KEY, roles);
