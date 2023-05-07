import { BaseEntity, UserStatus } from 'common';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { File } from '../../file/entities/file.entity';
import { UserToken } from './user-token.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 1000 })
  password: string;

  @Column({ type: 'enum', enum: UserStatus })
  status: UserStatus;

  @Column('text', { array: true, nullable: true })
  deviceTokens: string[];

  @Column({ name: 'phone_number', length: 50, nullable: true })
  phoneNumber: string;

  @Column({ name: 'address', length: 255, nullable: true })
  address: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ name: 'name', length: 50, nullable: true })
  name: string;

  @Column({ name: 'birth_date', type: 'timestamptz', nullable: true })
  birthDate: Date;

  @OneToMany(() => UserToken, (ut) => ut.user)
  userTokens: UserToken[];

  @OneToMany(() => File, (f) => f.user)
  files: File[];
}
