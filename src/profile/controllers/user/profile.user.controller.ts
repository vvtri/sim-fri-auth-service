import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrefixType } from 'common';
import { User } from '../../../auth/entities/user.entity';
import {
  AuthenticateUser,
  CurrentUser,
} from '../../../common/decorators/auth.decorator';
import { UpdateProfileUserReqDto } from '../../dtos/user/req/profile.user.req.dto';
import { ProfileUserService } from '../../services/user/profile.user.service';

@Controller(`${PrefixType.USER}/profile`)
@AuthenticateUser()
@ApiTags('Profile User')
export class ProfileUserController {
  constructor(private profileUserService: ProfileUserService) {}

  @Get(':id')
  getUserProfile(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.profileUserService.getUserProfile(id, user);
  }

  @Get()
  getMyProfile(@CurrentUser() user: User) {
    return this.profileUserService.getMyProfile(user);
  }

  @Patch()
  updateProfile(
    @Body() body: UpdateProfileUserReqDto,
    @CurrentUser() user: User,
  ) {
    return this.profileUserService.update(body, user);
  }
}
