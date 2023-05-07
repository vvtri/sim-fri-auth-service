import { BaseEntity } from 'common';
import { UserTokenStatus, UserTokenType } from 'shared';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserToken extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: UserTokenType })
  type: UserTokenType;

  @Column({ length: 1000 })
  token: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ enum: UserTokenStatus, type: 'enum' })
  status: UserTokenStatus;

  // join user
  @Column()
  userId: number;

  @ManyToOne(() => User, (u) => u.userTokens)
  @JoinColumn()
  user: User;
  // end join user
}
