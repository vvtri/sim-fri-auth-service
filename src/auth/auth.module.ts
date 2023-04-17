import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmCustomModule } from 'common';
import { GlobalConfig } from '../common/configs/global.config';
import { AuthUserController } from './controllers/user/auth.user.controller';
import { UserRepository } from './repositories/user.repository';
import { AuthUserService } from './services/user/auth.user.service';

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
    TypeOrmCustomModule.forFeature([UserRepository]),
  ],
  controllers: [AuthUserController],
  providers: [AuthUserService],
})
export class AuthModule {}
