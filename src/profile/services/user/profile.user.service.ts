import { Injectable } from '@nestjs/common';
import { KafkaProducer } from '@vvtri/nestjs-kafka';
import {
  KAFKA_TOPIC,
  UserProfileCreatedKafkaPayload as UserProfileUpdatedKafkaPayload,
} from 'common';
import { Transactional } from 'typeorm-transactional';
import { User } from '../../../auth/entities/user.entity';
import { UserRepository } from '../../../auth/repositories/user.repository';
import { UserProfileResDto } from '../../dtos/common/res/user-profile.res.dto';
import { UpdateProfileUserReqDto } from '../../dtos/user/req/profile.user.req.dto';
import { UserProfile } from '../../entities/user-profile.entity';
import { UserProfileRepository } from '../../repositories/user-profile.repository';

@Injectable()
export class ProfileUserService {
  constructor(
    private kafkaProducer: KafkaProducer,

    private userRepo: UserRepository,
    private userProfile: UserProfileRepository,
  ) {}

  @Transactional()
  async getProfile(user: User) {
    const profile = await this.userProfile.findOneOrThrowNotFoundExc({
      where: { userId: user.id },
      relations: { avatar: true },
    });

    return UserProfileResDto.forUser({ data: profile });
  }

  @Transactional()
  async update(dto: UpdateProfileUserReqDto, user: User) {
    const {
      address,
      avatarId,
      birthDate,
      hometown,
      name,
      relationshipStatus,
      school,
      workplace,
    } = dto;

    let userProfile = await this.userProfile.findOneOrThrowNotFoundExc({
      where: { userId: user.id },
      relations: { avatar: true },
    });

    userProfile = {
      ...userProfile,
      ...(address && { address }),
      ...(avatarId && { avatarId }),
      ...(birthDate && { birthDate }),
      ...(hometown && { hometown }),
      ...(name && { name }),
      ...(relationshipStatus && { relationshipStatus }),
      ...(school && { school }),
      ...(workplace && { workplace }),
    };
    await this.userProfile.save(userProfile);

    const result = await this.getProfile(user);

    await this.sendUserProfileUpdatedKafka(userProfile);

    return result;
  }

  private async sendUserProfileUpdatedKafka(userProfile: UserProfile) {
    const kafkaPayload = new UserProfileUpdatedKafkaPayload({
      ...userProfile,
    });
    await this.kafkaProducer.send<UserProfileUpdatedKafkaPayload>({
      topic: KAFKA_TOPIC.USER_PROFILE_UPDATED,
      messages: [
        { value: kafkaPayload, headers: { id: String(userProfile.userId) } },
      ],
    });
  }
}
