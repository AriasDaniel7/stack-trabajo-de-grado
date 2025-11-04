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
import { DocentService } from './docent.service';
import { CreateDocentDto } from './dto/create-docent.dto';
import { UpdateDocentDto } from './dto/update-docent.dto';
import { Auth } from '@auth/decorators/auth.decorator';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DocentEntity } from '@database/entities/docent';
import { createPaginatedResponseDto } from '@shared/dtos/paginated-response.dto';
import { ParamDto } from './dto/param.dto';

@Auth()
@ApiBearerAuth()
@ApiTags('Docentes')
@Controller('docent')
export class DocentController {
  constructor(private readonly docentService: DocentService) {}

  @ApiCreatedResponse({ type: DocentEntity })
  @Post()
  create(@Body() createDocentDto: CreateDocentDto) {
    return this.docentService.create(createDocentDto);
  }

  @ApiOkResponse({ type: createPaginatedResponseDto(DocentEntity) })
  @Get('all')
  findAll(@Query() paramDto: ParamDto) {
    return this.docentService.findAll(paramDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.docentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDocentDto: UpdateDocentDto,
  ) {
    return this.docentService.update(id, updateDocentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.docentService.remove(id);
  }
}
