import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@database/entities/user';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcrypt';
import { Rol } from '@database/interfaces/data';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create(userData);

      if (password) {
        user.password = await hash(password, 10);
      }

      await this.userRepository.save(user);

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'isActive', 'name'],
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
    if (!updatePasswordDto) {
      throw new BadRequestException('Update data is required');
    }

    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const { currentPassword, newPassword } = updatePasswordDto;
    const isPasswordValid = await compare(currentPassword, user.password || '');

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.password = await hash(newPassword, 10);

    try {
      await this.userRepository.save(user);
      return { message: 'Password updated successfully' };
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: UserEntity,
  ) {
    if (!updateUserDto) {
      throw new BadRequestException('Update data is required');
    }

    const { password, role, ...userData } = updateUserDto;

    if (role && currentUser.role !== Rol.ADMIN) {
      throw new UnauthorizedException('Only admins can change roles');
    }

    const user = await this.findOne(id);
    Object.assign(user, userData);

    if (password) {
      user.password = await hash(password, 10);
    }

    try {
      await this.userRepository.save(user);
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);

    return { message: 'User removed successfully' };
  }

  async count() {
    return await this.userRepository.count();
  }

  private handleError(error: any) {
    if (error.code === '23505') {
      const detail: string = error.detail || '';

      if (detail.includes('email')) {
        throw new ConflictException('Email already exists');
      }

      throw new ConflictException('User already exists');
    }

    this.logger.error('Unexpected error', error);
    throw new InternalServerErrorException('Please contact support');
  }
}
