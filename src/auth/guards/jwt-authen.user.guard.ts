import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { StrategyName } from '../constants/index.constant';
import { ForbiddenExc } from 'common';
import { IS_PUBLIC_KEY } from '../../common/constants/index.constant';

@Injectable()
export class JwtAuthenUserGuard extends AuthGuard(StrategyName.USER) {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (info instanceof Error || !user || err)
      throw new ForbiddenExc({ statusCode: 1 });

    return user;
  }
}
