import { IsValidDate, IsValidEnum, IsValidNumber, IsValidText } from 'common';
import { UserProfileRelationshipStatus } from 'shared';

export class UpdateProfileUserReqDto {
  @IsValidText({ required: false })
  address?: string;

  @IsValidText({ required: false })
  name?: string;

  @IsValidDate({ required: false })
  birthDate?: Date;

  @IsValidText({ required: false })
  workplace?: string;

  @IsValidText({ required: false })
  school?: string;

  @IsValidText({ required: false })
  hometown?: string;

  @IsValidEnum({ enum: UserProfileRelationshipStatus, required: false })
  relationshipStatus?: UserProfileRelationshipStatus;

  @IsValidNumber({ required: false, min: 1 })
  avatarId?: number;
}
