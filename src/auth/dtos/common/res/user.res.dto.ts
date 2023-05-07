import { User } from '../../../entities/user.entity';

export interface UserResDtoParams {
  data?: User;
}

export class UserResDto {
  id: number;
  phoneNumber: string;
  address: string;
  email: string;
  name: string;
  birthDate: Date;
  createdAt: Date;

  static mapProperty(dto: UserResDto, { data }: UserResDtoParams) {
    dto.id = data.id;
    dto.phoneNumber = data.phoneNumber;
    dto.address = data.address;
    dto.email = data.email;
    dto.name = data.name;
    dto.birthDate = data.birthDate;
    dto.createdAt = data.createdAt;
  }

  static forUser(params: UserResDtoParams) {
    const { data } = params;

    if (!data) return null;
    const result = new UserResDto();

    this.mapProperty(result, params);
    return result;
  }
}
