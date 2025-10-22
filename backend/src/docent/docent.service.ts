import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateDocentDto } from './dto/create-docent.dto';
import { UpdateDocentDto } from './dto/update-docent.dto';
import { DataSource } from 'typeorm';
import { SchoolGradeService } from '@school-grade/school-grade.service';
import { DocentEntity } from '@database/entities/docent';
import { PaginationDto } from '@shared/dtos/pagination.dto';
import { ParamDto } from './dto/param.dto';

@Injectable()
export class DocentService {
  private logger = new Logger(DocentService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly sGService: SchoolGradeService,
  ) {}

  async create(createDocentDto: CreateDocentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const schoolGrade = await this.sGService.findOne(
        createDocentDto.id_school_grade,
      );

      const docent = queryRunner.manager.create(DocentEntity, {
        ...createDocentDto,
        school_grade: schoolGrade,
      });

      await queryRunner.manager.save(docent);
      await queryRunner.commitTransaction();
      return docent;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleError(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paramDto: ParamDto) {
    const { limit = 10, offset = 0, order = 'ASC', q = '' } = paramDto;
    const query = q.trim();

    const queryBuilder = this.dataSource.createQueryBuilder(
      DocentEntity,
      'docent',
    );

    queryBuilder.leftJoinAndSelect('docent.school_grade', 'school_grade');

    if (query) {
      queryBuilder.where(
        '(docent.name LIKE :query OR docent.document_number LIKE :query)',
        { query: `%${query}%` },
      );
    }

    queryBuilder.orderBy('docent.name', order).skip(offset).take(limit);

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

  async findOne(id: string) {
    const docent = await this.dataSource.getRepository(DocentEntity).findOne({
      where: { id },
      relations: {
        school_grade: true,
      },
    });

    if (!docent) {
      throw new NotFoundException(`Docent with id "${id}" not found`);
    }

    return docent;
  }

  async update(id: string, updateDocentDto: UpdateDocentDto) {
    const docent = await this.findOne(id);
    Object.assign(docent, updateDocentDto);

    if (updateDocentDto.id_school_grade) {
      const schoolGrade = await this.sGService.findOne(
        updateDocentDto.id_school_grade,
      );
      docent.school_grade = schoolGrade;
    }

    try {
      await this.dataSource.getRepository(DocentEntity).save(docent);
      return docent;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string) {
    const docent = await this.findOne(id);
    await this.dataSource.getRepository(DocentEntity).remove(docent);
    return { message: 'Docent removed successfully' };
  }

  private handleError(error: any) {
    if (error instanceof NotFoundException) {
      throw error;
    }

    if (error.code === '23505') {
      const detail = (error.detail as string) || '';

      if (detail.includes('document_number')) {
        throw new ConflictException(
          'A docent with that document number already exists',
        );
      }
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Please contact support');
  }
}
