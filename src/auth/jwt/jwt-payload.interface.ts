import { Role } from '@/auth/enum/role.enum';

export interface JwtPayload {
  email: string;
  sub: string;
  role: Role;
}
