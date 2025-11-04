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
import { ProgramService } from './program.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@shared/dtos/pagination.dto';
import { ParamProgramAllDto } from './dto/param-program-all.dto';
import { ParamProgramAllInternalDto } from './dto/param-program-all-internal.dto';
import { ParamOfferingDto } from './dto/param-offering.dto';
import { Auth } from '@auth/decorators/auth.decorator';

@Auth()
@ApiBearerAuth()
@ApiTags('Programas')
@Controller('program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Post()
  create(@Body() createProgramDto: CreateProgramDto) {
    return this.programService.create(createProgramDto);
  }

  @Get('all')
  findAll(@Query() params: ParamProgramAllDto) {
    return this.programService.findAll(params);
  }

  @Get('all/internal')
  findAllInternal(@Query() params: ParamProgramAllInternalDto) {
    return this.programService.findAllInternal(params);
  }

  @Get('placement/:id')
  findOneByIdProgramPlacement(@Param('id', ParseUUIDPipe) id: string) {
    return this.programService.findOneByIdProgramPlacement(id);
  }

  @Get('offering/:id')
  findOneByIdOffering(@Param('id', ParseUUIDPipe) id: string) {
    return this.programService.findOneByIdOffering(id);
  }

  @Get('placement/:id/offerings')
  findOfferingsByIdProgramPlacement(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() params: ParamOfferingDto,
  ) {
    return this.programService.findOfferingsByIdProgramPlacement(id, params);
  }

  @Get('all/external')
  findAllExternal(@Query() params: ParamProgramAllDto) {
    return this.programService.findAllExternal(params);
  }

  @Get(':id/pensum')
  findPensumByIdProgram(
    @Query() pagination: PaginationDto,
    @Param('id') id: string,
  ) {
    return this.programService.findPensumByIdProgram(id, pagination);
  }

  @Patch('offering/:id')
  updateOffering(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProgramDto: UpdateProgramDto,
  ) {
    return this.programService.updateOffering(id, updateProgramDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.programService.remove(+id);
  }

  @Delete('placement/:id')
  removePlacement(@Param('id', ParseUUIDPipe) id: string) {
    return this.programService.removePlacement(id);
  }

  @Delete('offering/:id')
  removeOffering(@Param('id', ParseUUIDPipe) id: string) {
    return this.programService.removeOffering(id);
  }
}
