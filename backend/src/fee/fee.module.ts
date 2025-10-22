import { Module } from '@nestjs/common';
import { FeeService } from './fee.service';
import { FeeController } from './fee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeEntity } from '@database/entities/rates';
import { ModalityModule } from '@modality/modality.module';

@Module({
  imports: [TypeOrmModule.forFeature([FeeEntity]), ModalityModule],
  controllers: [FeeController],
  providers: [FeeService],
})
export class FeeModule {}
