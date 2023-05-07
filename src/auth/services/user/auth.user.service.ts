import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import {
  AuthStatusCode,
  ConflictExc,
  ExpectationFailedExc,
  NotFoundExc,
  UnAuthorizedExc,
} from 'common';
import dayjs from 'dayjs';
import genRandNumb from 'random-number-csprng';
import { Transactional } from 'typeorm-transactional';
import { GlobalConfig } from '../../../common/configs/global.config';
import { EmailService } from '../../../util/services/email.service';
import { AuthTokenResDto } from '../../dtos/common/res/auth-token.res.dto';
import { UserResDto } from '../../dtos/common/res/user.res.dto';
import {
  LoginUserReqDto,
  RefreshTokenReqDto,
  RegisterUserReqDto,
  ResendVerificationEmailUserReqDto,
  VerificationEmailUserReqDto,
} from '../../dtos/user/req/auth.user.req.dto';
import { User } from '../../entities/user.entity';
import { UserTokenStatus, UserTokenType } from '../../enums/user-token.enum';
import { UserStatus } from '../../enums/user.enum';
import { UserTokenRepository } from '../../repositories/user-token.repository';
import { UserRepository } from '../../repositories/user.repository';
import { JwtAuthPayload } from '../../types/jwt-payload.type';

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
      throw new NotFoundExc({ statusCode: AuthStatusCode.USER_NOT_FOUND });

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      throw new ExpectationFailedExc({
        statusCode: AuthStatusCode.INVALID_PASSWORD,
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

    if (user)
      throw new ConflictExc({ statusCode: AuthStatusCode.USER_EXISTED });

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
      throw new NotFoundExc({ statusCode: AuthStatusCode.USER_NOT_FOUND });

    if (user.status !== UserStatus.UNVERIFIED)
      throw new ExpectationFailedExc({
        statusCode: AuthStatusCode.USER_VERIFIED,
      });

    const resendTimeToDay = await this.userTokenRepo
      .createQueryBuilder('ut')
      .where('ut.userId = :userId', { userId: user.id })
      .andWhere('ut.type = :type', { type: UserTokenType.VERIFICATION_EMAIL })
      .andWhere('ut.status = :status', { status: UserTokenStatus.ACTIVE })
      .andWhere(`date_part('day', ut.createdAt) = date_part('day', now())`)
      .getCount();

    if (resendTimeToDay > 10)
      throw new ExpectationFailedExc({
        statusCode: AuthStatusCode.TOO_MANY_VERIFICATION_REQUEST,
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

    if (
      !userToken ||
      userToken.token !== code ||
      userToken.expiresAt < new Date()
    ) {
      throw new ExpectationFailedExc({
        statusCode: AuthStatusCode.INVALID_USER_TOKEN,
      });
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

  async refreshToken(dto: RefreshTokenReqDto) {
    const { refreshToken } = dto;

    try {
      const payload = this.jwtService.verify<JwtAuthPayload>(refreshToken, {
        secret: this.configService.get('auth.refreshToken.secret'),
      });
      const accessToken = this.generateAccessToken({
        userId: payload.userId,
      });

      return AuthTokenResDto.forCustomer({ data: { accessToken } });
    } catch (error) {
      throw new UnAuthorizedExc({
        statusCode: AuthStatusCode.INVALID_REFRESH_TOKEN,
      });
    }
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
