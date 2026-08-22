import { Request } from 'express';
import { RoleType } from 'src/enums/role.type';

export interface JwtUser {
  sub: string;
  email: string;
  role?: RoleType;
}

export interface AuthenticatedRequest extends Request {
  user: JwtUser;
}
