import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ModalityService } from './modality.service';
import { CreateModalityDto } from './dto/create-modality.dto';
import { UpdateModalityDto } from './dto/update-modality.dto';
import { ParamDto } from './dto/param.dto';
import { Auth } from '@auth/decorators/auth.decorator';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@shared/dtos/pagination.dto';

@ApiTags('Modalidad')
@Controller('modality')
export class ModalityController {
  constructor(private readonly modalityService: ModalityService) {}

  @Post()
  create(@Body() createModalityDto: CreateModalityDto) {
    return this.modalityService.create(createModalityDto);
  }

  @Get('all')
  findAll(@Query() paramDto: ParamDto) {
    return this.modalityService.findAll(paramDto);
  }

  @ApiParam({
    name: 'idEducationalLevel',
    type: Number,
    description: 'ID of the educational level',
  })
  @Get('all-existing/:idEducationalLevel')
  findExistingModalities(
    @Param('idEducationalLevel') id: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.modalityService.findByIdEducationalLevel(+id, pagination);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.modalityService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateModalityDto: UpdateModalityDto,
  ) {
    return this.modalityService.update(id, updateModalityDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.modalityService.remove(id);
  }
}
