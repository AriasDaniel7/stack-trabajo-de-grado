import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { SchoolGradeService } from './school-grade.service';
import { CreateSchoolGradeDto } from './dto/create-school-grade.dto';
import { UpdateSchoolGradeDto } from './dto/update-school-grade.dto';
import { Auth } from '@auth/decorators/auth.decorator';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { ParamDto } from './dto/param.dto';
import { PaginationDto } from '@shared/dtos/pagination.dto';

@Auth()
@ApiBearerAuth()
@ApiTags('Niveles académicos')
@Controller('school-grade')
export class SchoolGradeController {
  constructor(private readonly schoolGradeService: SchoolGradeService) {}

  @Post()
  create(@Body() createSGDto: CreateSchoolGradeDto) {
    return this.schoolGradeService.create(createSGDto);
  }

  @Get('all')
  findAll(@Query() paramDto: ParamDto) {
    return this.schoolGradeService.findAll(paramDto);
  }

  @Get('all-existing')
  findAllExisting(@Query() pagination: PaginationDto) {
    return this.schoolGradeService.findAllExisting(pagination);
  }

  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.schoolGradeService.findOne(id);
  }

  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSGDto: UpdateSchoolGradeDto,
  ) {
    return this.schoolGradeService.update(id, updateSGDto);
  }

  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.schoolGradeService.remove(id);
  }
}
