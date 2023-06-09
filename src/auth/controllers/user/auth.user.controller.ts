import { Body, Controller, Get, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import { PrefixType } from 'common';
import {
  AuthenticateUser,
  CurrentUser,
} from '../../../common/decorators/auth.decorator';
import {
  LoginUserReqDto,
  RefreshTokenReqDto,
  RegisterUserReqDto,
  ResendVerificationEmailUserReqDto,
  VerificationEmailUserReqDto,
} from '../../dtos/user/req/auth.user.req.dto';
import { User } from '../../entities/user.entity';
import { AuthUserService } from '../../services/user/auth.user.service';

@Controller(`${PrefixType.USER}/auth`)
@ApiTags('Auth User')
export class AuthUserController {
  constructor(
    private authUserService: AuthUserService,
    private jwtService: JwtService,
  ) {}

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

  @Post('refresh-token')
  refreshToken(@Body() body: RefreshTokenReqDto) {
    return this.authUserService.refreshToken(body);
  }

  @Get('current')
  @AuthenticateUser()
  getCurrent(@CurrentUser() user: User) {
    return this.authUserService.getCurrent(user);
  }
}
