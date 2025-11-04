import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { ProgramModule } from '@program/program.module';

@Module({
  imports: [ProgramModule],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
