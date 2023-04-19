import { IsValidEmail, IsValidText } from 'common';

export class LoginUserReqDto {
  @IsValidEmail()
  email: string;

  @IsValidText()
  password: string;
}

export class RegisterUserReqDto {
  @IsValidEmail()
  email: string;

  @IsValidText()
  password: string;
}

export class ResendVerificationEmailUserReqDto {
  @IsValidEmail()
  email: string;
}

export class VerificationEmailUserReqDto {
  @IsValidEmail()
  email: string;

  @IsValidText()
  code: string;
}
