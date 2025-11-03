import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Like, QueryRunner } from 'typeorm';
import { CreateSeminarDto } from './dto/create-seminary.dto';
import { SeminarEntity } from '@database/entities/seminar';
import { UpdateSeminarDto } from './dto/update-seminary.dto';
import { DocentSeminarEntity } from '@database/entities/docent-seminar';
import { DocentService } from '@docent/docent.service';
import { VinculationType } from '@database/interfaces/data';
import { SeminarDocentEntity } from '@database/entities/seminar-docent';
import { SchoolGradeSeminarEntity } from '@database/entities/school-grade-seminar';
import { SeminarDateEntity } from '@database/entities/seminar-date';
import { ParamDto } from './dto/param.dto';
import { OrderType } from '@shared/dtos/pagination.dto';

@Injectable()
export class SeminarService {
  private logger = new Logger(SeminarService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly docentService: DocentService,
  ) {}

  async create(createSeminaryDto: CreateSeminarDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { docent_id, docent_vinculation, dates, ...seminarData } =
        createSeminaryDto;

      const seminar = queryRunner.manager.create(SeminarEntity, seminarData);

      seminar.seminarDocent = await this.assignDocent(
        queryRunner,
        docent_id,
        docent_vinculation,
      );

      seminar.dates = await this.assignDates(queryRunner, dates);

      await queryRunner.manager.save(seminar);
      await queryRunner.commitTransaction();
      return seminar;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleError(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paramDto: ParamDto) {
    const {
      limit = 10,
      offset = 0,
      order = OrderType.ASC,
      name = '',
      docent_name = '',
      docent_document_number = '',
      id_school_grade = '',
    } = paramDto;

    const [data, count] = await Promise.all([
      this.dataSource.getRepository(SeminarEntity).find({
        where: {
          name: Like(`%${name.trim()}%`),
          seminarDocent: {
            docent: {
              name: Like(`%${docent_name.trim()}%`),
              document_number: docent_document_number
                ? docent_document_number.trim()
                : undefined,
            },
            schoolGrade: {
              id: id_school_grade ? id_school_grade.trim() : undefined,
            },
          },
        },
        skip: offset,
        take: limit,
        order: {
          name: order,
        },
        relations: {
          seminarDocent: {
            docent: true,
            schoolGrade: true,
          },
          dates: true,
        },
      }),
      this.dataSource.getRepository(SeminarEntity).count(),
    ]);

    return {
      count,
      pages: Math.ceil(count / limit),
      data,
    };
  }

  async findOne(id: string) {
    const seminar = await this.dataSource.getRepository(SeminarEntity).findOne({
      where: { id },
      relations: {
        seminarDocent: {
          docent: true,
          schoolGrade: true,
        },
        dates: true,
      },
    });

    if (!seminar) throw new NotFoundException('Seminary not found');

    return seminar;
  }

  async update(id: string, updateSeminaryDto: UpdateSeminarDto) {
    if (!updateSeminaryDto)
      throw new ConflictException('No data provided for update');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const seminar = await this.findOne(id);
    const { docent_id, docent_vinculation, dates, ...seminarData } =
      updateSeminaryDto;
    try {
      Object.assign(seminar, seminarData);

      if (docent_id && docent_vinculation) {
        await this.removeSeminarDocent(queryRunner, seminar.id);
        seminar.seminarDocent = await this.assignDocent(
          queryRunner,
          docent_id,
          docent_vinculation,
        );
      }

      if (dates) {
        await this.removeSeminarDates(queryRunner, seminar.id);
        seminar.dates = await this.assignDates(queryRunner, dates);
      }

      await queryRunner.manager.save(seminar);

      await queryRunner.commitTransaction();
      return seminar;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleError(error);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const seminar = await this.findOne(id);

      await Promise.all([
        this.removeSeminarDates(queryRunner, seminar.id),
        this.removeSeminarDocent(queryRunner, seminar.id),
        queryRunner.manager.remove(seminar),
      ]);

      await queryRunner.commitTransaction();
      return { message: 'Seminar removed successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleError(error);
    } finally {
      await queryRunner.release();
    }
  }

  private handleError(err: any) {
    const message: string = err?.detail || err?.message || '';

    if (err instanceof NotFoundException) throw err;

    if (err.code === '23505') {
      throw new ConflictException('Seminary with that name already exists');
    }

    if (message.includes('"seminar_program_offerings"')) {
      throw new ConflictException(
        'Cannot delete seminar with associated program offerings.',
      );
    }

    this.logger.error(err);
    throw new InternalServerErrorException('Please contact support');
  }

  private async assignDocent(
    queryRunner: QueryRunner,
    docent_id: string,
    docent_vinculation: VinculationType,
  ) {
    const { school_grade, ...docent } =
      await this.docentService.findOne(docent_id);

    let docentSeminar = await queryRunner.manager.findOneBy(
      DocentSeminarEntity,
      {
        id: docent.id,
      },
    );

    if (!docentSeminar) {
      docentSeminar = queryRunner.manager.create(DocentSeminarEntity, {
        ...docent,
      });
      await queryRunner.manager.save(docentSeminar);
    }

    let schoolGradeSeminar = await queryRunner.manager.findOneBy(
      SchoolGradeSeminarEntity,
      { id: school_grade.id },
    );

    if (!schoolGradeSeminar) {
      schoolGradeSeminar = queryRunner.manager.create(
        SchoolGradeSeminarEntity,
        {
          ...school_grade,
        },
      );
      await queryRunner.manager.save(schoolGradeSeminar);
    }

    const seminarDocent = queryRunner.manager.create(SeminarDocentEntity, {
      vinculation: docent_vinculation,
      docent: docentSeminar,
      schoolGrade: schoolGradeSeminar,
    });

    await queryRunner.manager.save(seminarDocent);

    return seminarDocent;
  }

  private async assignDates(queryRunner: QueryRunner, dates: Date[]) {
    const seminarDates = dates.map((date) => {
      return queryRunner.manager.create(SeminarDateEntity, { date });
    });

    return await queryRunner.manager.save(seminarDates);
  }

  private async removeSeminarDates(
    queryRunner: QueryRunner,
    seminarId: string,
  ) {
    await queryRunner.manager.getRepository(SeminarDateEntity).delete({
      seminar: { id: seminarId },
    });
  }

  private async removeSeminarDocent(
    queryRunner: QueryRunner,
    seminarId: string,
  ) {
    await queryRunner.manager.getRepository(SeminarDocentEntity).delete({
      seminar: { id: seminarId },
    });
  }
}
