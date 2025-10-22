import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req['user'];

    if (!user) {
      throw new BadRequestException('User not found in request');
    }

    return data ? user[data] : user;
  },
);
