import { Module } from '@nestjs/common';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramEntity } from '@database/entities/program';
import { ConfigModule } from '@nestjs/config';
import { ProgramOfferingEntity } from '@database/entities/program-offering';
import { PensumEntity } from '@database/entities/pensum';
import { ProgramPlacementEntity } from '@database/entities/program-placement';
import { CacheModule } from '@nestjs/cache-manager';
import { DiscountEntity } from '@database/entities/discount';

@Module({
  imports: [
    ConfigModule,
    CacheModule.register({
      ttl: 300000, // 5 minutes
      max: 1000, // maximum number of items in cache
    }),
    TypeOrmModule.forFeature([
      ProgramEntity,
      ProgramOfferingEntity,
      PensumEntity,
      ProgramPlacementEntity,
      DiscountEntity,
    ]),
  ],
  controllers: [ProgramController],
  providers: [ProgramService],
})
export class ProgramModule {}
