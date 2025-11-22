import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateSchoolGradeDto } from './dto/create-school-grade.dto';
import { UpdateSchoolGradeDto } from './dto/update-school-grade.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SchoolGradeEntity } from '@database/entities/school-grade';
import { Repository } from 'typeorm';
import { ParamDto } from './dto/param.dto';
import { ConfigService } from '@nestjs/config';
import { OrderType, PaginationDto } from '@shared/dtos/pagination.dto';
import { EducationLevel } from './interfaces/education-level-response';

@Injectable()
export class SchoolGradeService {
  private logger = new Logger(SchoolGradeService.name);
  private API_HOST?: string;

  constructor(
    @InjectRepository(SchoolGradeEntity)
    private readonly SGRepository: Repository<SchoolGradeEntity>,
    private readonly configService: ConfigService,
  ) {
    this.API_HOST = this.configService.get<string>('API_HOST');
  }

  async create(createSGDto: CreateSchoolGradeDto) {
    try {
      const newSG = this.SGRepository.create(createSGDto);
      await this.SGRepository.save(newSG);
      return newSG;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(paramDto: ParamDto) {
    const { limit = 10, offset = 0, order = 'ASC', name = '' } = paramDto;

    const queryBuilder = this.SGRepository.createQueryBuilder('schoolGrade');

    if (name) {
      queryBuilder.where('schoolGrade.name LIKE :query', {
        query: `%${name.trim()}%`,
      });
    }

    queryBuilder.orderBy('schoolGrade.level', order).skip(offset).take(limit);

    const [data, count] = await Promise.all([
      queryBuilder.getMany(),
      queryBuilder.getCount(),
    ]);

    return {
      count,
      pages: Math.ceil(count / limit),
      data,
    };
  }

  async findAllExisting(pagination: PaginationDto) {
    const { limit = 10, offset = 0, order = OrderType.ASC } = pagination;

    const url = `${this.API_HOST}/nivelEducativo/findAll`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new InternalServerErrorException(
          'Failed to fetch existing school grades',
        );
      }

      const data: EducationLevel[] = await response.json();

      const sortedData = data.sort((a, b) => {
        if (order === OrderType.ASC) {
          return a.descripcion.localeCompare(b.descripcion);
        } else {
          return b.descripcion.localeCompare(a.descripcion);
        }
      });

      return {
        count: sortedData.length,
        pages: Math.ceil(sortedData.length / limit),
        data: sortedData.slice(offset, offset + limit).map((item) => ({
          id: item.id,
          description: item.descripcion,
          forIes: item.paraIes,
          observation: item.observacion,
        })),
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: string) {
    const sg = await this.SGRepository.findOneBy({ id });
    if (!sg)
      throw new NotFoundException(`School Grade with id "${id}" not found`);
    return sg;
  }

  async update(id: string, updateSGDto: UpdateSchoolGradeDto) {
    if (!updateSGDto)
      throw new BadRequestException('No data provided for update');

    const sg = await this.findOne(id);
    Object.assign(sg, updateSGDto);

    try {
      await this.SGRepository.save(sg);
      return sg;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string) {
    const sg = await this.findOne(id);
    try {
      await this.SGRepository.remove(sg);
      return { message: 'School Grade removed successfully' };
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(err: any) {
    if (err.code === '23505') {
      const detail = (err.detail as string) || '';
      if (detail.includes('level')) {
        throw new ConflictException(
          'A school grade with that level already exists',
        );
      }

      if (detail.includes('name')) {
        throw new ConflictException(
          'A school grade with that name already exists',
        );
      }
    }

    if (err.code === '23503') {
      const detail = (err.detail as string) || '';
      if (detail.includes('docents')) {
        throw new ConflictException(
          'Cannot delete school grade because it is associated with one or more docents',
        );
      }
    }

    this.logger.error(err);
    throw new InternalServerErrorException('Please contact support');
  }
}
