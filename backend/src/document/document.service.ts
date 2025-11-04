import { FeeEntity } from '@database/entities/rates';
import { Injectable } from '@nestjs/common';
import { ProgramService } from '@program/program.service';
import type { Response } from 'express';
import { DataSource } from 'typeorm';
import { EconomicViabilityProtocolTemplate } from './templates/economic-viability-protocol';

@Injectable()
export class DocumentService {
  constructor(
    private readonly programService: ProgramService,
    private dataSource: DataSource,
  ) {}

  async generateEconomicViabilityProtocol(idOffering: string, res: Response) {
    const offering = await this.findOneByIdOffering(idOffering);
    const fees = await this.findAllFees();

    const template = new EconomicViabilityProtocolTemplate();
    await template.generate(res, fees, offering);
  }

  private async findOneByIdOffering(idOffering: string) {
    return await this.programService.findOneByIdOffering(idOffering);
  }

  private async findAllFees() {
    return await this.dataSource.getRepository(FeeEntity).find({
      relations: {
        modality: true,
      },
    });
  }
}
