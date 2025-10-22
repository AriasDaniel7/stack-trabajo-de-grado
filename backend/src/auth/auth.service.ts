import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@user/user.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import { compare } from 'bcrypt';
import { UserEntity } from '@database/entities/user';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto, response: Response) {
    try {
      const { email, password } = loginDto;

      const user = await this.userService.findByEmail(email);

      const isPasswordValid = await compare(password, user.password || '');

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('User is not active');
      }

      const token = await this.getJwtToken({ id: user.id });

      // this.handleJwtCookie(response, token);

      const { password: _, ...userData } = user;

      return { user: userData, token };
    } catch (error) {
      this.handleError(error);
    }
  }

  async checkAuthStatus(user: UserEntity, response: Response) {
    const token = await this.getJwtToken({ id: user.id });
    // this.handleJwtCookie(response, token);
    return { user, token };
  }

  // async logout(response: Response) {
  //   const isProduction =
  //     this.configService.get<string>('NODE_ENV') === 'production';

  //   response.clearCookie('access_token', {
  //     httpOnly: true,
  //     secure: isProduction,
  //     sameSite: isProduction ? 'strict' : 'strict',
  //   });
  //   return { message: 'Logged out successfully' };
  // }

  // private handleJwtCookie(res: Response, token: string) {
  //   const isProduction =
  //     this.configService.get<string>('NODE_ENV') === 'production';

  //   res.cookie('access_token', token, {
  //     httpOnly: true,
  //     secure: isProduction,
  //     sameSite: isProduction ? 'strict' : 'strict',
  //     maxAge: 1000 * 60 * 60, // 1 hour
  //   });
  // }

  private async getJwtToken(payload: JwtPayload) {
    return await this.jwtService.signAsync(payload);
  }

  private handleError(err: any) {
    if (err instanceof NotFoundException) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (err instanceof UnauthorizedException) {
      throw err;
    }

    this.logger.error(err);
    throw new InternalServerErrorException('Please contact support');
  }
}
