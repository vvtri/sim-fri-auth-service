import { Body, Controller, Get, Post } from '@nestjs/common';
import { Delete, Query } from '@nestjs/common/decorators';
import { ApiTags } from '@nestjs/swagger';
import {
  AuthenticateUser,
  CurrentUser,
} from '../../../common/decorators/auth.decorator';
import {
  LoginUserReqDto,
  RegisterUserReqDto,
  ResendVerificationEmailUserReqDto,
  VerificationEmailUserReqDto,
} from '../../dtos/user/req/auth.user.req.dto';
import { User } from '../../entities/user.entity';
import { AuthUserService } from '../../services/user/auth.user.service';

@Controller(`user/auth`)
@ApiTags('Auth Customer')
export class AuthUserController {
  constructor(private authUserService: AuthUserService) {}

  @Post('register')
  register(@Body() body: RegisterUserReqDto) {
    return this.authUserService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginUserReqDto) {
    return this.authUserService.login(body);
  }

  @Post('verify')
  verify(@Body() body: VerificationEmailUserReqDto) {
    return this.authUserService.verify(body);
  }

  @Post('resend-verification')
  resendVerificationEmail(@Body() body: ResendVerificationEmailUserReqDto) {
    return this.authUserService.resendVerificationEmail(body);
  }

  @Get('current')
  @AuthenticateUser()
  getCurrent(@CurrentUser() user: User) {
    return this.authUserService.getCurrent(user);
  }
}
