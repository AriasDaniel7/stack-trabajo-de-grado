import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateModalityDto } from './dto/create-modality.dto';
import { UpdateModalityDto } from './dto/update-modality.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ModalityEntity } from '@database/entities/modality';
import { Like, Repository } from 'typeorm';
import { ParamDto } from './dto/param.dto';
import { ConfigService } from '@nestjs/config';
import { OrderType, PaginationDto } from '@shared/dtos/pagination.dto';
import { ModalityResponse } from './interfaces/modality-response';

@Injectable()
export class ModalityService {
  private logger = new Logger(ModalityService.name);
  private API_HOST?: string;

  constructor(
    @InjectRepository(ModalityEntity)
    private readonly modalityRepository: Repository<ModalityEntity>,
    private readonly configService: ConfigService,
  ) {
    this.API_HOST = this.configService.get<string>('API_HOST');
  }

  async create(createModalityDto: CreateModalityDto) {
    try {
      const modality = this.modalityRepository.create(createModalityDto);
      await this.modalityRepository.save(modality);
      return modality;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(paramDto: ParamDto) {
    const { limit = 10, offset = 0, order = 'DESC', name = '' } = paramDto;

    const [data, count] = await Promise.all([
      this.modalityRepository.find({
        where: {
          name: Like(`%${name.trim()}%`),
        },
        skip: offset,
        take: limit,
        order: {
          name: order,
        },
      }),
      this.modalityRepository.count(),
    ]);

    return {
      count,
      pages: Math.ceil(count / limit),
      data,
    };
  }

  async findOne(id: string) {
    const modality = await this.modalityRepository.findOneBy({ id });
    if (!modality) throw new NotFoundException('Modality not found');
    return modality;
  }

  async findByIdEducationalLevel(
    idEducationalLevel: number,
    pagination: PaginationDto,
  ) {
    const { limit = 10, offset = 0, order = OrderType.ASC } = pagination;

    const queryParams = new URLSearchParams();

    queryParams.append('idNivelEducativo', idEducationalLevel.toString());
    queryParams.append('page', offset.toString());
    queryParams.append('size', limit.toString());

    const url = `${this.API_HOST}/modalidad/buscarPorNivel?${queryParams.toString()}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new InternalServerErrorException(
          `Failed to fetch modalities, status: ${response.status}`,
        );
      }

      const data: ModalityResponse[] = await response.json();
      return {
        count: data.length,
        pages: Math.ceil(data.length / limit),
        data: data.slice(offset, offset + limit).map((modality) => ({
          id: modality.id,
          description: modality.descripcion,
          idEducationalLevel: modality.nivelEducativoId,
          points: modality.puntos,
          code: modality.codigo,
        })),
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Please contact support regarding modality retrieval',
      );
    }
  }

  async update(id: string, updateModalityDto: UpdateModalityDto) {
    if (!updateModalityDto)
      throw new BadRequestException('No data provided for update');

    const modality = await this.findOne(id);
    Object.assign(modality, updateModalityDto);

    try {
      await this.modalityRepository.save(modality);
      return modality;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string) {
    const modality = await this.findOne(id);
    try {
      await this.modalityRepository.remove(modality);
      return { message: 'Modality removed successfully' };
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(err: any) {
    if (err.code === '23505') {
      throw new ConflictException('Modality already exists');
    }

    if (err.code === '23503') {
      throw new ConflictException(
        'The modality is associated with existing rates',
      );
    }

    this.logger.error(err);
    throw new InternalServerErrorException('Please contact support');
  }
}
