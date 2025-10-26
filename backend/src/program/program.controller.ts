import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProgramService } from './program.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@shared/dtos/pagination.dto';
import { ParamProgramAllDto } from './dto/param-program-all.dto';

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

  @Get('all-existing')
  findAllExisting(@Query() params: ParamProgramAllDto) {
    return this.programService.findAllExisting(params);
  }

  @ApiParam({ name: 'idProgram', description: 'Program ID', type: String })
  @Get(':idProgram/pensum')
  findPensumByIdProgram(
    @Query() pagination: PaginationDto,
    @Param('idProgram') id: string,
  ) {
    return this.programService.findPensumByIdProgram(id, pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.programService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProgramDto: UpdateProgramDto) {
    return this.programService.update(+id, updateProgramDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.programService.remove(+id);
  }
}
