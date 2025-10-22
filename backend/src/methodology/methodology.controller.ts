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
import { MethodologyService } from './methodology.service';
import { CreateMethodologyDto } from './dto/create-methodology.dto';
import { UpdateMethodologyDto } from './dto/update-methodology.dto';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ParamDto } from './dto/param.dto';
import { PaginationDto } from '@shared/dtos/pagination.dto';

@ApiTags('Metodologia')
@Controller('methodology')
export class MethodologyController {
  constructor(private readonly methodologyService: MethodologyService) {}

  @Post()
  create(@Body() createMethodologyDto: CreateMethodologyDto) {
    return this.methodologyService.create(createMethodologyDto);
  }

  @Get('all')
  findAll(@Query() paramDto: ParamDto) {
    return this.methodologyService.findAll(paramDto);
  }

  @Get('all-existing')
  findAllExisting(@Query() pagination: PaginationDto) {
    return this.methodologyService.findAllExisting(pagination);
  }

  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.methodologyService.findOne(id);
  }

  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMethodologyDto: UpdateMethodologyDto,
  ) {
    return this.methodologyService.update(id, updateMethodologyDto);
  }

  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.methodologyService.remove(id);
  }
}
