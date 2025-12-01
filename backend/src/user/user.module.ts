import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@database/entities/user';
import { SmtpModule } from '@smtp/smtp.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), SmtpModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
