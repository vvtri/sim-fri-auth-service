import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmCustomModule } from 'common';
import { GlobalConfig } from '../common/configs/global.config';
import { UserProfileRepository } from '../profile/repositories/user-profile.repository';
import { AuthUserController } from './controllers/user/auth.user.controller';
import { UserTokenRepository } from './repositories/user-token.repository';
import { UserRepository } from './repositories/user.repository';
import { AuthUserService } from './services/user/auth.user.service';
import { JwtAuthenUserStrategy } from './strategies/jwt-authen.user.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<GlobalConfig>) => ({
        secret: configService.get('auth.accessToken.secret'),
        signOptions: {
          algorithm: configService.get('auth.accessToken.algorithm'),
        },
      }),
    }),
    TypeOrmCustomModule.forFeature([
      UserRepository,
      UserTokenRepository,
      UserProfileRepository,
    ]),
  ],
  controllers: [AuthUserController],
  providers: [AuthUserService, JwtAuthenUserStrategy],
})
export class AuthModule {}
