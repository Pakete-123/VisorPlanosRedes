import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface RequestUser {
  role: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest<{ user: RequestUser }>();
    return required.includes(user.role);
  }
}
