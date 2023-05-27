import { BaseEntity } from 'common';
import { UserStatus } from 'shared';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { File } from '../../file/entities/file.entity';
import { UserProfile } from '../../profile/entities/user-profile.entity';
import { UserToken } from './user-token.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 1000 })
  password: string;

  @Column({ type: 'enum', enum: UserStatus })
  status: UserStatus;

  @Column({ name: 'phone_number', length: 50, nullable: true })
  phoneNumber: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @OneToMany(() => UserToken, (ut) => ut.user)
  userTokens: UserToken[];

  @OneToMany(() => File, (f) => f.user)
  files: File[];

  @OneToOne(() => UserProfile, (up) => up.user)
  userProfile: UserProfile;
}
