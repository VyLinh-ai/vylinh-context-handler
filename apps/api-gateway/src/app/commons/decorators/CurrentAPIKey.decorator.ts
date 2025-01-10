import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { APIKey } from '@prisma/client';

export const CurrentAPIKey = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as APIKey;
  },
);
