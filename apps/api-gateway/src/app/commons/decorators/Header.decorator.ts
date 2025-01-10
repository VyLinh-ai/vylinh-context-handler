import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const HeaderField = createParamDecorator(
  (field: string, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers[field.toLowerCase()] || null;
  },
);
