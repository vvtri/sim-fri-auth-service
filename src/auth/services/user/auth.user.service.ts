import { Injectable, Logger } from '@nestjs/common';
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
  ForbiddenExc,
  NotFoundExc,
  UnAuthorizedExc,
} from 'common';
import firebaseAdmin from 'firebase-admin';
import { Transactional } from 'typeorm-transactional';
import { GlobalConfig } from '../../../common/configs/global.config';
import { EmailService } from '../../../util/services/email.service';
import { AuthTokenResDto } from '../../dtos/common/res/auth-token.res.dto';
import {
  LoginUserReqDto,
  RegisterUserReqDto,
  ResendVerificationEmailUserReqDto,
  VerificationEmailUserReqDto,
} from '../../dtos/user/req/auth.user.req.dto';
import { User } from '../../entities/user.entity';
import { UserStatus } from '../../enums/user.enum';
import { UserRepository } from '../../repositories/user.repository';
import { JwtAuthPayload } from '../../types/jwt-payload.type';
import genRandNumb from 'random-number-csprng';
import { UserTokenRepository } from '../../repositories/user-token.repository';
import { UserTokenStatus, UserTokenType } from '../../enums/user-token.enum';
import dayjs from 'dayjs';
import { LessThan } from 'typeorm';
import { UserResDto } from '../../dtos/common/res/customer.res.dto';

@Injectable()
export class AuthUserService {
  private readonly logger = new Logger(AuthUserService.name);
  constructor(
    private userRepo: UserRepository,
    private userTokenRepo: UserTokenRepository,
    private jwtService: JwtService,
    private configService: ConfigService<GlobalConfig>,
    private emailService: EmailService,
  ) {}

  async getCurrent(user: User) {
    return UserResDto.forUser({ data: user });
  }

  @Transactional()
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

    if (user.status === UserStatus.UNVERIFIED) {
      return AuthTokenResDto.forCustomer({ data: { isVerified: false } });
    }

    const payload: JwtAuthPayload = { userId: user.id };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return AuthTokenResDto.forCustomer({
      data: { accessToken, refreshToken, isVerified: true },
    });
  }

  @Transactional()
  async register(dto: RegisterUserReqDto) {
    const { password, email } = dto;

    let user = await this.userRepo.findOneBy({ email });

    if (user) throw new ConflictExc({ statusCode: 1 });

    const hash = await bcrypt.hash(password, 12);

    user = this.userRepo.create({
      email,
      password: hash,
      status: UserStatus.UNVERIFIED,
    });
    await this.userRepo.save(user);

    await this.sendAndSaveVerificationToken(user);

    return AuthTokenResDto.forCustomer({ data: { isVerified: false } });
  }

  @Transactional()
  private async sendAndSaveVerificationToken(user: User) {
    const randNumb = await genRandNumb(0, 9999999);
    const code = String(randNumb).padStart(7, '0');

    const expiresAt = dayjs().add(
      this.configService.get('auth.verificationExpires'),
      'second',
    );

    await this.userTokenRepo.update(
      { type: UserTokenType.VERIFICATION_EMAIL, userId: user.id },
      { status: UserTokenStatus.INACTIVE },
    );

    const userToken = this.userTokenRepo.create({
      user,
      token: code,
      type: UserTokenType.VERIFICATION_EMAIL,
      expiresAt,
      status: UserTokenStatus.ACTIVE,
    });
    await this.userTokenRepo.insert(userToken);

    await this.emailService.send({
      templateId: this.configService.get(
        'sendGrid.templateId.verificationEmail',
      ),
      dynamicTemplateData: { email: user.email, code },
      to: user.email,
    });
  }

  @Transactional()
  async resendVerificationEmail(dto: ResendVerificationEmailUserReqDto) {
    const { email } = dto;

    const user = await this.userRepo.findOneBy({ email });

    if (!user)
      throw new NotFoundExc({ statusCode: AuthStatusCode.INVALID_EMAIL });

    if (user.status !== UserStatus.UNVERIFIED)
      throw new ExpectationFailedExc({
        statusCode: AuthStatusCode.INVALID_EMAIL,
      });

    const resendTimeToDay = await this.userTokenRepo
      .createQueryBuilder('ut')
      .where('ut.userId = :userId', { userId: user.id })
      .andWhere('ut.type = :type', { type: UserTokenType.VERIFICATION_EMAIL })
      .andWhere('ut.status = :status', { status: UserTokenStatus.ACTIVE })
      .getCount();

    if (resendTimeToDay > 10)
      throw new ExpectationFailedExc({
        statusCode: AuthStatusCode.INVALID_EMAIL,
      });

    await this.sendAndSaveVerificationToken(user);

    return AuthTokenResDto.forCustomer({ data: { isVerified: false } });
  }

  @Transactional()
  async verify(dto: VerificationEmailUserReqDto) {
    const { code, email } = dto;

    const user = await this.userRepo.findOneBy({ email });

    if (!user) throw new NotFoundExc({ statusCode: 1 });

    const userToken = await this.userTokenRepo.findFirst({
      where: {
        userId: user.id,
        type: UserTokenType.VERIFICATION_EMAIL,
        status: UserTokenStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' },
    });

    if (!userToken || userToken.token !== code) {
      throw new ExpectationFailedExc({ statusCode: 1 });
    }

    await this.userRepo.update(user.id, { status: UserStatus.ACTIVE });
    this.userTokenRepo
      .update(userToken.id, { status: UserTokenStatus.INACTIVE })
      .catch((err) => this.logger.log(err));

    const payload: JwtAuthPayload = { userId: user.id };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return AuthTokenResDto.forCustomer({
      data: { accessToken, refreshToken, isVerified: true },
    });
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
