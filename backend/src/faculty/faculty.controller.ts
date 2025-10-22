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
import { FacultyService } from './faculty.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ParamDto } from './dto/param.dto';
import { Auth } from '@auth/decorators/auth.decorator';

@ApiTags('Facultades')
@Controller('faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post()
  create(@Body() createFacultyDto: CreateFacultyDto) {
    return this.facultyService.create(createFacultyDto);
  }

  @Get('all')
  findAll(@Query() paramDto: ParamDto) {
    return this.facultyService.findAll(paramDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.facultyService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFacultyDto: UpdateFacultyDto,
  ) {
    return this.facultyService.update(id, updateFacultyDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.facultyService.remove(id);
  }
}
