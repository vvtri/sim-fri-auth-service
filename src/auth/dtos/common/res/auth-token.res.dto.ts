import { PartialNonFunctionProperties } from 'shared';

export interface AuthTokenResDtoParams {
  data: PartialNonFunctionProperties<AuthTokenResDto>;
}

export class AuthTokenResDto {
  accessToken: string;
  refreshToken: string;
  isVerified = true;

  static mapProperty(dto: AuthTokenResDto, { data }: AuthTokenResDtoParams) {
    dto.accessToken = data.accessToken;
    dto.refreshToken = data.refreshToken;
    dto.isVerified = data.isVerified;
  }

  static forCustomer(params: AuthTokenResDtoParams) {
    const { data } = params;

    if (!data) return null;
    const result = new AuthTokenResDto();

    this.mapProperty(result, params);

    return result;
  }

  static forMerchant(params: AuthTokenResDtoParams) {
    const { data } = params;

    if (!data) return null;
    const result = new AuthTokenResDto();

    this.mapProperty(result, params);

    return result;
  }

  static forAdmin(params: AuthTokenResDtoParams) {
    const { data } = params;

    if (!data) return null;
    const result = new AuthTokenResDto();

    this.mapProperty(result, params);

    return result;
  }
}
