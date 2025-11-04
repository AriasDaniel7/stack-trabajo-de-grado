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
import { FeeService } from './fee.service';
import { CreateFeeDto } from './dto/create-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';
import { Auth } from '@auth/decorators/auth.decorator';
import { ParamDto } from './dto/param.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Auth()
@ApiBearerAuth()
@Controller('fee')
export class FeeController {
  constructor(private readonly feeService: FeeService) {}

  @Post()
  create(@Body() createFeeDto: CreateFeeDto) {
    return this.feeService.create(createFeeDto);
  }

  @Get('all')
  findAll(@Query() paramDto: ParamDto) {
    return this.feeService.findAll(paramDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.feeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFeeDto: UpdateFeeDto,
  ) {
    return this.feeService.update(id, updateFeeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.feeService.remove(id);
  }
}
