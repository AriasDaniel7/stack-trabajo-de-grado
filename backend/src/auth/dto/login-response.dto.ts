import { UserEntity } from '@database/entities/user';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ type: UserEntity })
  user: UserEntity;

  @ApiProperty({ type: String, format: 'jwt' })
  token: string;
}
