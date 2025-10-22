import { PartialType } from '@nestjs/swagger';
import { CreateSeminarDto } from './create-seminary.dto';

export class UpdateSeminarDto extends PartialType(CreateSeminarDto) {}
