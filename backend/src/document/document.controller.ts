import { Controller, Get, Param, ParseUUIDPipe, Res } from '@nestjs/common';
import { DocumentService } from './document.service';
import type { Response } from 'express';
import { Auth } from '@auth/decorators/auth.decorator';

@Auth()
@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get('/offering/:id/economic-viability-protocol')
  generateEconomicViabilityProtocol(
    @Param('id', ParseUUIDPipe) idOffering: string,
    @Res() res: Response,
  ) {
    return this.documentService.generateEconomicViabilityProtocol(
      idOffering,
      res,
    );
  }
}
