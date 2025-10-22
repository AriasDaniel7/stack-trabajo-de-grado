import { PartialType } from '@nestjs/swagger';
import { CreateSmmlvDto } from './create-smmlv.dto';

export class UpdateSmmlvDto extends PartialType(CreateSmmlvDto) {}
