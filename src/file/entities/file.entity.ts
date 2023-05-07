import { BaseEntity } from 'common';
import { AudienceType, FileType } from 'shared';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class File extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  key: string;

  @Column({ length: 255 })
  bucket: string;

  @Column({ default: 0 })
  size: string;

  @Column({ type: 'enum', enum: AudienceType })
  audienceType: AudienceType;

  @Column({ type: 'enum', enum: FileType })
  fileType: FileType;

  // join user
  @Column()
  userId: number;

  @ManyToOne(() => User, (u) => u.files)
  @JoinColumn()
  user: User;
  // end join user
}
