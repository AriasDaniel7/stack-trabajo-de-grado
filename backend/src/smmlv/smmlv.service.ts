import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateSmmlvDto } from './dto/create-smmlv.dto';
import { UpdateSmmlvDto } from './dto/update-smmlv.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SmmlvEntity } from '@database/entities/smmlv';
import { Repository } from 'typeorm';
import { ParamDto } from './dto/param.dto';

@Injectable()
export class SmmlvService {
  private logger = new Logger(SmmlvService.name);

  constructor(
    @InjectRepository(SmmlvEntity)
    private readonly smmlvRepository: Repository<SmmlvEntity>,
  ) {}

  async create(createSmmlvDto: CreateSmmlvDto) {
    try {
      const smmlv = this.smmlvRepository.create(createSmmlvDto);
      await this.smmlvRepository.save(smmlv);
      return smmlv;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(paramDto: ParamDto) {
    const { limit = 10, offset = 0, order = 'DESC', year = '' } = paramDto;

    const queryBuilder = this.smmlvRepository.createQueryBuilder('smmlv');

    if (year.trim()) {
      queryBuilder.where('(CAST(smmlv.year AS TEXT) LIKE :query)', {
        query: `%${year.trim()}%`,
      });
    }

    queryBuilder.orderBy('smmlv.year', order).skip(offset).take(limit);

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
    const smmlv = await this.smmlvRepository.findOneBy({ id });
    if (!smmlv) throw new NotFoundException('Smmlv not found');
    return smmlv;
  }

  async update(id: string, updateSmmlvDto: UpdateSmmlvDto) {
    if (!updateSmmlvDto) {
      throw new BadRequestException('No data provided for update');
    }

    const smmlv = await this.findOne(id);
    Object.assign(smmlv, updateSmmlvDto);

    try {
      await this.smmlvRepository.save(smmlv);
      return smmlv;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string) {
    const smmlv = await this.findOne(id);
    await this.smmlvRepository.remove(smmlv);
    return { message: 'Smmlv removed successfully' };
  }

  private handleError(err: any) {
    if (err.code === '23505') {
      throw new ConflictException('The year already exists');
    }

    this.logger.error(err);
    throw new InternalServerErrorException('Please contact support');
  }
}
