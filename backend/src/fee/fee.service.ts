import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateFeeDto } from './dto/create-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FeeEntity } from '@database/entities/rates';
import { Like, Repository } from 'typeorm';
import { PaginationDto } from '@shared/dtos/pagination.dto';
import { ModalityService } from '@modality/modality.service';
import { ParamDto } from './dto/param.dto';

@Injectable()
export class FeeService {
  private logger = new Logger(FeeService.name);

  constructor(
    @InjectRepository(FeeEntity)
    private readonly feeRepository: Repository<FeeEntity>,
    private readonly modalityService: ModalityService,
  ) {}

  async create(createFeeDto: CreateFeeDto) {
    try {
      const { modality_id, ...feeData } = createFeeDto;
      const newFee = this.feeRepository.create(feeData);
      newFee.modality = await this.assignmentModality(modality_id);
      await this.feeRepository.save(newFee);
      return newFee;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(paramDto: ParamDto) {
    const {
      limit = 10,
      offset = 0,
      order = 'DESC',
      modality_name = '',
    } = paramDto;

    const [data, count] = await Promise.all([
      this.feeRepository.find({
        where: {
          modality: {
            name: Like(`%${modality_name.trim()}%`),
          },
        },
        skip: offset,
        take: limit,
        order: {
          modality: {
            name: order,
          },
        },
        relations: {
          modality: true,
        },
      }),
      this.feeRepository.count(),
    ]);

    return {
      count,
      pages: Math.ceil(count / limit),
      data,
    };
  }

  async findOne(id: string) {
    const fee = await this.feeRepository.findOne({
      where: { id },
      relations: { modality: true },
    });
    if (!fee) throw new NotFoundException(`Fee not found`);
    return fee;
  }

  async update(id: string, updateFeeDto: UpdateFeeDto) {
    if (!updateFeeDto)
      throw new BadRequestException('No data provided for update');

    const { modality_id, ...feeData } = updateFeeDto;

    const fee = await this.findOne(id);
    Object.assign(fee, feeData);

    try {
      if (modality_id) {
        fee.modality = await this.assignmentModality(modality_id);
      }

      await this.feeRepository.save(fee);
      return fee;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string) {
    const fee = await this.findOne(id);
    await this.feeRepository.remove(fee);
    return { message: 'Fee removed successfully' };
  }

  private async assignmentModality(modality_id: string) {
    const modality = await this.modalityService.findOne(modality_id);
    return modality;
  }

  private handleError(err: any) {
    if (err.code === '23505') {
      throw new ConflictException('The rate with this modality already exists');
    }

    if (err instanceof NotFoundException) throw err;

    this.logger.error(err);
    throw new InternalServerErrorException('Please contact support');
  }
}
