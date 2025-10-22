import { JwtPayload } from '@auth/interfaces/jwt-payload.interface';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserService } from '@user/user.service';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    const secretOrKey = configService.get<string>('JWT_SECRET');

    if (!secretOrKey) {
      throw new InternalServerErrorException('JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  async validate(payload: JwtPayload) {
    const { id } = payload;
    const user = await this.userService.findOne(id);

    if (!user) throw new UnauthorizedException('Invalid token');
    if (!user.isActive) throw new UnauthorizedException('User is not active');

    return user;
  }
}
