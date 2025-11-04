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
import { SmmlvService } from './smmlv.service';
import { CreateSmmlvDto } from './dto/create-smmlv.dto';
import { UpdateSmmlvDto } from './dto/update-smmlv.dto';
import { Auth } from '@auth/decorators/auth.decorator';
import { ParamDto } from './dto/param.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Auth()
@ApiBearerAuth()
@Controller('smmlv')
export class SmmlvController {
  constructor(private readonly smmlvService: SmmlvService) {}

  @Post()
  create(@Body() createSmmlvDto: CreateSmmlvDto) {
    return this.smmlvService.create(createSmmlvDto);
  }

  @Get('all')
  findAll(@Query() paramDto: ParamDto) {
    return this.smmlvService.findAll(paramDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.smmlvService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSmmlvDto: UpdateSmmlvDto,
  ) {
    return this.smmlvService.update(id, updateSmmlvDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.smmlvService.remove(id);
  }
}
