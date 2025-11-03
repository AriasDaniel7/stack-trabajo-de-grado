import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SeminarService } from './seminar.service';
import { CreateSeminarDto } from './dto/create-seminary.dto';
import { UpdateSeminarDto } from './dto/update-seminary.dto';
import { ParamDto } from './dto/param.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '@auth/decorators/auth.decorator';

@Auth()
@ApiTags('Seminarios')
@Controller('seminar')
export class SeminarController {
  constructor(private readonly seminarService: SeminarService) {}

  @Post()
  create(@Body() createSeminaryDto: CreateSeminarDto) {
    return this.seminarService.create(createSeminaryDto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all seminars with filters and pagination' })
  findAll(@Query() paramDto: ParamDto) {
    return this.seminarService.findAll(paramDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.seminarService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSeminaryDto: UpdateSeminarDto,
  ) {
    return this.seminarService.update(id, updateSeminaryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.seminarService.remove(id);
  }
}
