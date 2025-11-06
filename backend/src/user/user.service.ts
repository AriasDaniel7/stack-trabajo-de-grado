import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@database/entities/user';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';

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

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!updateUserDto) {
      throw new BadRequestException('Update data is required');
    }

    const { password, ...userData } = updateUserDto;
    const user = await this.findOne(id);
    Object.assign(user, userData);

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
