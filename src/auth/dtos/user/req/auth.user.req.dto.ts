import { IsValidEmail, IsValidText } from 'common';

export class LoginUserReqDto {
  @IsValidEmail()
  email: string;

  @IsValidText()
  password: string;
}

export class RegisterUserReqDto {
  @IsValidText({ maxLength: 1000 })
  firebaseAuthToken: string;

  @IsValidText()
  password: string;
}
