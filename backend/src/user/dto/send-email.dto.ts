import { IsEmail, IsString } from 'class-validator';

export class SendEmailDto {
  @IsString()
  @IsEmail()
  email: string;
}
