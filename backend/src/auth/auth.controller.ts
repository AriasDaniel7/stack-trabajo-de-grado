import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { GetUser } from './decorators/get-user.decorator';
import { UserEntity } from '@database/entities/user';
import { Auth } from './decorators/auth.decorator';
import type { Response } from 'express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(loginDto, response);
  }

  @Auth()
  @ApiBearerAuth()
  @Get('check-auth')
  checkAuth(
    @GetUser() user: UserEntity,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.checkAuthStatus(user, response);
  }

  // @ApiOperation({ summary: 'Logout' })
  // @ApiOkResponse({ description: 'User logged out successfully' })
  // @ApiUnauthorizedResponse({ description: 'Invalid token / Unauthorized' })
  // @Auth()
  // @Get('logout')
  // logout(@Res({ passthrough: true }) response: Response) {
  //   return this.authService.logout(response);
  // }
}
