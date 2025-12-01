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
import { Not, Repository } from 'typeorm';
import { compare, hash } from 'bcrypt';
import { Rol } from '@database/interfaces/data';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ParamDto } from './dto/param.dto';
import { OrderType } from '@shared/dtos/pagination.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { SendEmailDto } from './dto/send-email.dto';
import { RecoveryPasswordTemplate } from './templates/recovery-password';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly mailerService: MailerService,
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

  async findAll(paramDto: ParamDto, user: UserEntity) {
    const { limit = 10, offset = 0, order = OrderType.DESC } = paramDto;

    const [data, count] = await this.userRepository.findAndCount({
      where: {
        id: Not(user.id),
      },
      skip: offset,
      take: limit,
      order: {
        email: order,
      },
    });

    return {
      count,
      pages: Math.ceil(count / limit),
      data,
    };
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

    if (role && currentUser.role === Rol.ADMIN) {
      user.role = role;
    }

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

  async updatePasswordByEmail(email: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { email: email },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    user.password = await hash(newPassword, 10);

    try {
      await this.userRepository.save(user);
      return { message: 'Password updated successfully' };
    } catch (error) {
      this.handleError(error);
    }
  }

  private generatorPassword(longitud: number = 10): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';

    for (let i = 0; i < longitud; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return password;
  }

  async sendRecoveryEmail(sendEmail: SendEmailDto) {
    const newPassword = this.generatorPassword(10);
    await this.updatePasswordByEmail(sendEmail.email, newPassword);
    try {
      await this.mailerService.sendMail({
        to: sendEmail.email,
        subject: 'Recuperación de contraseña',
        html: RecoveryPasswordTemplate.generateTemplate(newPassword),
      });
      return { message: 'Recovery email sent successfully' };
    } catch (error) {
      throw new ConflictException('Error sending recovery email');
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
