import { PartialType } from '@nestjs/swagger';
import { CreateDocentDto } from './create-docent.dto';

export class UpdateDocentDto extends PartialType(CreateDocentDto) {}
