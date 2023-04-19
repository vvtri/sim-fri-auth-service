import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'common';
import { DataSource } from 'typeorm';
import { UserToken } from '../entities/user-token.entity';

@Injectable()
export class UserTokenRepository extends BaseRepository<UserToken> {
  constructor(dataSource: DataSource) {
    super(UserToken, dataSource);
  }
}
