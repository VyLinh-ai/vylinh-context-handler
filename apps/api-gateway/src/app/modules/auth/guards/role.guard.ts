import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../commons/decorators/roles.decorator';
import { PrismaService } from '@layerg-agg-workspace/shared/services';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // API key object passed from JwtAuthGuard

    const apiKey = await this.prisma.aPIKey.findUnique({
      where: { apiKey: user.apiKey },
    });

    return requiredRoles.includes(apiKey.roles);
  }
}
