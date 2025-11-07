import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { Rol } from '@database/interfaces/data';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from '@auth/decorators/auth.decorator';
import { GetUser } from '@auth/decorators/get-user.decorator';
import { UserEntity } from '@database/entities/user';
import { UpdatePasswordDto } from './dto/update-password.dto';

@ApiTags('Usuarios')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('setup-admin')
  async create(@Body() createUserDto: CreateUserDto) {
    const userCount = await this.userService.count();

    if (userCount === 0) {
      return this.userService.create({ ...createUserDto, role: Rol.ADMIN });
    }

    throw new UnauthorizedException('Only admins can create new users');
  }

  @ApiBearerAuth()
  @Auth(Rol.ADMIN)
  @Post()
  createByAdmin(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiBearerAuth()
  @Auth(Rol.ADMIN)
  @Get('all')
  findAll() {
    return this.userService.findAll();
  }

  @ApiBearerAuth()
  @Auth()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOne(id);
  }

  @ApiBearerAuth()
  @Auth()
  @Patch(':id/update-password')
  updatePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(id, updatePasswordDto);
  }

  @ApiBearerAuth()
  @Auth()
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: UserEntity,
  ) {
    return this.userService.update(id, updateUserDto, user);
  }

  @ApiBearerAuth()
  @Auth(Rol.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.remove(id);
  }
}
