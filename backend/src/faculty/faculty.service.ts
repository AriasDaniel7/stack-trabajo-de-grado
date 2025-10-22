import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FacultyEntity } from '@database/entities/faculty';
import { Like, Repository } from 'typeorm';
import { ParamDto } from './dto/param.dto';
import { OrderType } from '@shared/dtos/pagination.dto';

@Injectable()
export class FacultyService {
  private readonly logger = new Logger(FacultyService.name);

  constructor(
    @InjectRepository(FacultyEntity)
    private readonly facultyRepository: Repository<FacultyEntity>,
  ) {}

  async create(createFacultyDto: CreateFacultyDto) {
    try {
      const faculty = this.facultyRepository.create(createFacultyDto);
      await this.facultyRepository.save(faculty);
      return faculty;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(paramDto: ParamDto) {
    const {
      limit = 10,
      offset = 0,
      order = OrderType.ASC,
      name = '',
    } = paramDto;

    const [data, count] = await Promise.all([
      this.facultyRepository.find({
        where: { name: Like(`%${name.trim()}%`) },
        order: { name: order },
        take: limit,
        skip: offset,
      }),
      this.facultyRepository.count(),
    ]);

    return {
      count,
      pages: Math.ceil(count / limit),
      data,
    };
  }

  async findOne(id: string) {
    const faculty = await this.facultyRepository.findOneBy({ id });

    if (!faculty) throw new NotFoundException('Faculty not found');

    return faculty;
  }

  async update(id: string, updateFacultyDto: UpdateFacultyDto) {
    if (!updateFacultyDto) {
      throw new BadRequestException('No data provided for update');
    }

    const faculty = await this.findOne(id);
    Object.assign(faculty, updateFacultyDto);

    try {
      await this.facultyRepository.save(faculty);
      return faculty;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string) {
    const faculty = await this.findOne(id);

    try {
      await this.facultyRepository.remove(faculty);
      return { message: 'Faculty removed successfully' };
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.code === '23505') {
      throw new ConflictException('Faculty already exists');
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Please contact support.');
  }
}
