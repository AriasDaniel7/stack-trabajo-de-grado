import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateMethodologyDto } from './dto/create-methodology.dto';
import { UpdateMethodologyDto } from './dto/update-methodology.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MethodologyEntity } from '@database/entities/methodology';
import { Like, Repository } from 'typeorm';
import { ParamDto } from './dto/param.dto';
import { OrderType, PaginationDto } from '@shared/dtos/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { MethodologyResponse } from './interfaces/methodolody-response';

@Injectable()
export class MethodologyService {
  private readonly logger = new Logger(MethodologyService.name);
  private API_HOST?: string;

  constructor(
    @InjectRepository(MethodologyEntity)
    private readonly methodologyRepository: Repository<MethodologyEntity>,
    private readonly configService: ConfigService,
  ) {
    this.API_HOST = this.configService.get<string>('API_HOST');
  }

  async create(createMethodologyDto: CreateMethodologyDto) {
    try {
      const methodology =
        this.methodologyRepository.create(createMethodologyDto);
      await this.methodologyRepository.save(methodology);
      return methodology;
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
      this.methodologyRepository.find({
        where: { name: Like(`%${name.trim()}%`) },
        order: { name: order },
        take: limit,
        skip: offset,
      }),
      this.methodologyRepository.count(),
    ]);

    return {
      count,
      pages: Math.ceil(count / limit),
      data,
    };
  }

  async findAllExisting(pagination: PaginationDto) {
    const { limit = 10, offset = 0, order = OrderType.ASC } = pagination;

    const url = `${this.API_HOST}/metodologia/findAll`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new InternalServerErrorException(
          'Error fetching methodologies from external service',
        );
      }

      const data: MethodologyResponse[] = await response.json();

      return {
        count: data.length,
        pages: Math.ceil(data.length / limit),
        data: data.slice(offset, offset + limit).map((methodology) => ({
          id: methodology.id,
          description: methodology.descripcion,
          status: methodology.activo,
        })),
      };
    } catch (error) {
      this.logger.error(`Error fetching methodologies: ${error}`);
      throw new InternalServerErrorException(
        'Please contact support regarding methodology retrieval',
      );
    }
  }

  async findOne(id: string) {
    const methodology = await this.methodologyRepository.findOne({
      where: { id },
    });

    if (!methodology) {
      throw new NotFoundException('Methodology not found');
    }

    return methodology;
  }

  async update(id: string, updateMethodologyDto: UpdateMethodologyDto) {
    if (!updateMethodologyDto)
      throw new BadRequestException('No data provided for update');

    const methodology = await this.findOne(id);
    Object.assign(methodology, updateMethodologyDto);

    try {
      await this.methodologyRepository.save(methodology);
      return methodology;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string) {
    const methodology = await this.findOne(id);
    try {
      await this.methodologyRepository.remove(methodology);
      return { message: 'Methodology removed successfully' };
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): void {
    const message = error?.detail || error?.message || '';
    if (error.code === '23505') {
      throw new ConflictException('Methodology already exists');
    }

    if(message.includes('"program_placements"')) {
      throw new ConflictException(
        'Cannot delete methodology with associated program placements.',
      );
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Please contact support');
  }
}
