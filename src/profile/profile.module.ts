import { Module } from '@nestjs/common';
import { TypeOrmCustomModule } from 'common';
import { UserRepository } from '../auth/repositories/user.repository';
import { ProfileUserController } from './controllers/user/profile.user.controller';
import { UserProfileRepository } from './repositories/user-profile.repository';
import { ProfileUserService } from './services/user/profile.user.service';

@Module({
  imports: [
    TypeOrmCustomModule.forFeature([UserProfileRepository, UserRepository]),
  ],
  controllers: [ProfileUserController],
  providers: [ProfileUserService],
})
export class ProfileModule {}
