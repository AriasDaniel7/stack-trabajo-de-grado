import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ParamAllDto } from './dto/param-all.dto';
import { ProgramResponse } from './interfaces/program-response';
import { OrderType, PaginationDto } from '@shared/dtos/pagination.dto';
import { PensumResponse } from './interfaces/pensum-response';
import { programMap } from './maps/program.map';
import { pensumMap } from './maps/pensum.map';

@Injectable()
export class ProgramService {
  private API_HOST: string | undefined = undefined;
  private logger = new Logger(ProgramService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.API_HOST = this.configService.get<string>('API_HOST');
  }

  async create(createProgramDto: CreateProgramDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {}

  async findAllExisting(params: ParamAllDto) {
    const {
      limit = 10,
      offset = 0,
      order = OrderType.ASC,
      filter = '',
      idEducationalLevel = undefined,
      idModality = undefined,
      idMethodology = undefined,
    } = params;

    const queryParams = new URLSearchParams();

    const page = Math.floor(offset / limit);
    const skipInPage = offset % limit;

    queryParams.append('page', page.toString());
    queryParams.append('size', limit.toString());

    if (idEducationalLevel) {
      queryParams.append('idNivelEducativo', idEducationalLevel.toString());
    }

    if (idModality) {
      queryParams.append('idModalidad', idModality.toString());
    }

    if (idMethodology) {
      queryParams.append('idMetodologia', idMethodology.toString());
    }

    queryParams.append('filter', filter);

    const url = `${this.API_HOST}/programaCommon/busquedaPrograma${`?${queryParams.toString()}`}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new InternalServerErrorException(
          `Failed to fetch programs, status: ${response.status}`,
        );
      }

      const data: ProgramResponse = await response.json();

      return {
        count: data.totalElements,
        pages: data.totalPages,
        data: data.content
          .slice(skipInPage)
          .map((program) => programMap(program)),
      };
    } catch (error) {
      this.logger.error(`Error fetching programs: ${error}`);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOneExisting(id: number, pagination: PaginationDto) {
    const { limit = 10, offset = 0, order = OrderType.ASC } = pagination;

    const queryParams = new URLSearchParams();

    const page = Math.floor(offset / limit);
    const skipInPage = offset % limit;

    queryParams.append('idPrograma', id.toString());
    queryParams.append('page', page.toString());
    queryParams.append('size', limit.toString());

    const url = `${this.API_HOST}/pensum/buscarPensumPorPrograma?${queryParams.toString()}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new InternalServerErrorException(
          `Failed to fetch programs, status: ${response.status}`,
        );
      }

      const data: PensumResponse = await response.json();

      return {
        count: data.totalElements,
        pages: data.totalPages,
        data: data.content.slice(skipInPage).map((pensum) => pensumMap(pensum)),
      };
    } catch (error) {
      this.logger.error(`Error fetching programs: ${error}`);
      throw new InternalServerErrorException(
        'Please contact support regarding pensum retrieval',
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} program`;
  }

  update(id: number, updateProgramDto: UpdateProgramDto) {
    return `This action updates a #${id} program`;
  }

  remove(id: number) {
    return `This action removes a #${id} program`;
  }
}
