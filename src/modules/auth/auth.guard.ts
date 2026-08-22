import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { RoleType } from 'src/enums/role.type';
import { Reflector } from '@nestjs/core';
import { jwtConstants } from './constants';
import type { AuthenticatedRequest, JwtUser } from './auth.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    let payload: JwtUser;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.accessSecret,
      });
      request.user = payload;
    } catch (err) {
      console.log('JWT verify error:', err);
      throw new UnauthorizedException();
    }

    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles && requiredRoles.length > 0) {
      if (!payload.role || !requiredRoles.includes(payload.role)) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    if (request.cookies && request.cookies['access_token']) {
      return request.cookies['access_token'];
    }
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
