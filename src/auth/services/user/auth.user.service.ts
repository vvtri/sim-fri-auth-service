import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import {
  AuthStatusCode,
  ConflictExc,
  ExpectationFailedExc,
  UnAuthorizedExc,
} from 'common';
import firebaseAdmin from 'firebase-admin';
import { Transactional } from 'typeorm-transactional';
import { GlobalConfig } from '../../../common/configs/global.config';
import { AuthTokenResDto } from '../../dtos/common/res/auth-token.res.dto';
import {
  LoginUserReqDto,
  RegisterUserReqDto,
} from '../../dtos/user/req/auth.user.req.dto';
import { User } from '../../entities/user.entity';
import { UserRepository } from '../../repositories/user.repository';
import { JwtAuthPayload } from '../../types/jwt-payload.type';

@Injectable()
export class AuthUserService {
  constructor(
    private userRepo: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService<GlobalConfig>,
  ) {}

  async getCurrent(user: User) {}

  async login(dto: LoginUserReqDto) {
    const { email, password } = dto;

    const user = await this.userRepo.findOneBy({ email });

    if (!user)
      throw new NotFoundException({ status: AuthStatusCode.INVALID_EMAIL });

    const isMatchPassword = await bcrypt.compare(password, user.password);

    if (!isMatchPassword) {
      throw new BadRequestException({
        status: AuthStatusCode.INVALID_PASSWORD,
      });
    }

    const payload: JwtAuthPayload = { userId: user.id };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return AuthTokenResDto.forCustomer({ data: { accessToken, refreshToken } });
  }

  @Transactional()
  async register(dto: RegisterUserReqDto) {
    const { firebaseAuthToken, password } = dto;

    const firebaseUser = await firebaseAdmin
      .auth()
      .verifyIdToken(firebaseAuthToken);

    if (!firebaseUser?.email) throw new ExpectationFailedExc({ statusCode: 1 });

    if (!firebaseUser.email_verified)
      throw new UnAuthorizedExc({ statusCode: 1 });

    let user = await this.userRepo.findOneBy({ firebaseId: firebaseUser.uid });

    if (user) throw new ConflictExc({ statusCode: 1 });

    const hash = await bcrypt.hash(password, 12);

    user = this.userRepo.create({
      firebaseId: firebaseUser.uid,
      password: hash,
    });
    await this.userRepo.save(user);

    const payload: JwtAuthPayload = { userId: user.id };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return AuthTokenResDto.forCustomer({ data: { accessToken, refreshToken } });
  }

  private generateAccessToken(payload: JwtAuthPayload) {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('auth.accessToken.expiresTime'),
      secret: this.configService.get('auth.accessToken.secret'),
    });
  }

  private generateRefreshToken(payload: JwtAuthPayload) {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('auth.accessToken.expiresTime'),
      secret: this.configService.get('auth.refreshToken.secret'),
    });
  }
}
