import { Module } from '@nestjs/common';
import { SmmlvService } from './smmlv.service';
import { SmmlvController } from './smmlv.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmmlvEntity } from '@database/entities/smmlv';

@Module({
  imports: [TypeOrmModule.forFeature([SmmlvEntity])],
  controllers: [SmmlvController],
  providers: [SmmlvService],
})
export class SmmlvModule {}
