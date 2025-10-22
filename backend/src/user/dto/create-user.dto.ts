import { Rol, User } from '@database/interfaces/data';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUserDto implements User {
  @IsString()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MaxLength(255)
  password?: string | undefined;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsEnum(Rol)
  role: Rol;
}
