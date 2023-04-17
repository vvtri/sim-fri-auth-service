import { PartialNonFunctionProperties } from 'common';

export interface AuthTokenResDtoParams {
  data: PartialNonFunctionProperties<AuthTokenResDto>;
}

export class AuthTokenResDto {
  accessToken: string;
  refreshToken: string;

  static mapProperty(dto: AuthTokenResDto, { data }: AuthTokenResDtoParams) {
    dto.accessToken = data.accessToken;
    dto.refreshToken = data.refreshToken;
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
