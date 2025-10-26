import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreatePensumDto,
  CreateProgramDto,
  CreateProgramOfferingDto,
} from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { DataSource, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { OrderType, PaginationDto } from '@shared/dtos/pagination.dto';
import { PensumResponse } from './interfaces/pensum-external';
import { ProgramMap, ProgramMapResponse } from './maps/program.map';
import { ProgramEntity } from '@database/entities/program';
import { ProgramOfferingEntity } from '@database/entities/program-offering';
import { FacultyEntity } from '@database/entities/faculty';
import { MethodologyEntity } from '@database/entities/methodology';
import { ModalityEntity } from '@database/entities/modality';
import { NormalizedUtil } from '@utils/normalized';
import { SmmlvEntity } from '@database/entities/smmlv';
import { PensumEntity } from '@database/entities/pensum';
import { ProgramPlacementEntity } from '@database/entities/program-placement';
import { ParamProgramAllDto } from './dto/param-program-all.dto';
import { ProgramResponse } from './interfaces/program-external';
import { isUUID } from 'class-validator';
import { PensumMap } from './maps/pensum.map';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class ProgramService {
  private API_HOST?: string;
  private logger = new Logger(ProgramService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.API_HOST = this.configService.get<string>('API_HOST');
  }

  async create(createProgramDto: CreateProgramDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const {
        faculty, // Listo
        modality, // Listo
        methodology, // Listo
        idSmmlv, // Listo
        pensum, // Listo
        unity, // Listo
        workday, // Listo
        discounts, // TODO: Falta por implementar
        programOffering, // Listo
        ...programData // Listo
      } = createProgramDto;

      const [modalityEntity, methodologyEntity, facultyEntity, smmlvEntity] =
        await Promise.all([
          this.createProgramModality(queryRunner, modality),
          this.createMethodology(queryRunner, methodology),
          this.createProgramFaculty(queryRunner, faculty),
          this.createSmmlv(queryRunner, idSmmlv),
        ]);

      let program = await queryRunner.manager.findOne(ProgramEntity, {
        where: {
          name: NormalizedUtil.normalizeNameWithoutTilde(programData.name),
        },
        select: {
          id: true,
        },
      });

      if (!program) {
        program = queryRunner.manager.create(ProgramEntity, programData);
        await queryRunner.manager.save(program);
      }

      const pensumEntity = await this.createPensum(
        queryRunner,
        pensum,
        program.id,
      );

      const programPlacementEntity = await this.createProgramPlacement(
        queryRunner,
        program.id,
        unity,
        workday,
        modalityEntity.id,
        facultyEntity,
        methodologyEntity.id,
      );

      const programOfferingEntity = await this.createProgramOfferings(
        queryRunner,
        smmlvEntity.id,
        programPlacementEntity.id,
        pensumEntity.id,
        program.id,
        programOffering,
      );

      programPlacementEntity.offerings = [programOfferingEntity];
      program.pensums = [pensumEntity];
      program.placements = [programPlacementEntity];

      await queryRunner.commitTransaction();
      await this.cacheManager.clear();
      return program;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleError(error);
    } finally {
      await queryRunner.release();
    }
  }

  private async createProgramOfferings(
    queryRunner: QueryRunner,
    idSmmlv: string,
    idProgramPlacement: string,
    idPensum: string,
    idProgram: string,
    programOffering: CreateProgramOfferingDto,
  ) {
    const offering = queryRunner.manager.create(ProgramOfferingEntity, {
      ...programOffering,
      idProgramPlacement,
      idSmmlv,
      idPensum,
      idProgram,
    });

    return await queryRunner.manager.save(offering);
  }

  private async createProgramPlacement(
    queryRunner: QueryRunner,
    idProgram: string,
    unity: string,
    workday: string,
    idModality: string,
    faculty: FacultyEntity | null,
    idMethodology: string,
  ) {
    let programPlacement = await queryRunner.manager.findOne(
      ProgramPlacementEntity,
      {
        where: {
          idProgram,
          unity: NormalizedUtil.normalizeNameWithoutTilde(unity),
          workday: NormalizedUtil.normalizeNameWithoutTilde(workday),
        },
        select: {
          id: true,
        },
      },
    );

    if (!programPlacement) {
      programPlacement = queryRunner.manager.create(ProgramPlacementEntity, {
        idProgram,
        unity,
        workday,
        idModality,
        idFaculty: faculty ? faculty.id : undefined,
        idMethodology,
      });

      return await queryRunner.manager.save(programPlacement);
    }

    return programPlacement;
  }

  private async createProgramFaculty(
    queryRunner: QueryRunner,
    nameFaculty: string | undefined,
  ) {
    if (nameFaculty) {
      let facultyEntity = await queryRunner.manager.findOne(FacultyEntity, {
        where: {
          name: NormalizedUtil.normalizeNameWithoutTilde(nameFaculty),
        },
        select: {
          id: true,
        },
      });

      if (!facultyEntity) {
        facultyEntity = queryRunner.manager.create(FacultyEntity, {
          name: nameFaculty,
        });
        return await queryRunner.manager.save(facultyEntity);
      }

      return facultyEntity;
    }

    return null;
  }

  private async createMethodology(
    queryRunner: QueryRunner,
    nameMethodology: string,
  ) {
    let methodologyEntity = await queryRunner.manager.findOne(
      MethodologyEntity,
      {
        where: {
          name: NormalizedUtil.normalizeNameWithoutTilde(nameMethodology),
        },
        select: {
          id: true,
        },
      },
    );

    if (!methodologyEntity) {
      methodologyEntity = queryRunner.manager.create(MethodologyEntity, {
        name: nameMethodology,
      });
      return await queryRunner.manager.save(methodologyEntity);
    }

    return methodologyEntity;
  }

  private async createProgramModality(
    queryRunner: QueryRunner,
    nameModality: string,
  ) {
    let modality = await queryRunner.manager.findOne(ModalityEntity, {
      where: {
        name: NormalizedUtil.normalizeNameWithoutTilde(nameModality),
      },
      select: {
        id: true,
      },
    });

    if (!modality) {
      modality = queryRunner.manager.create(ModalityEntity, {
        name: nameModality,
      });
      return await queryRunner.manager.save(modality);
    }

    return modality;
  }

  private async createPensum(
    queryRunner: QueryRunner,
    pensum: CreatePensumDto,
    idProgram: string,
  ) {
    let pensumEntity = await queryRunner.manager.findOne(PensumEntity, {
      where: {
        name: NormalizedUtil.normalizeNameWithoutTilde(pensum.name),
        idProgram,
      },
      select: {
        id: true,
      },
    });

    if (!pensumEntity) {
      pensumEntity = queryRunner.manager.create(PensumEntity, {
        ...pensum,
        idProgram,
      });
      return await queryRunner.manager.save(pensumEntity);
    }

    return pensumEntity;
  }

  private async createSmmlv(queryRunner: QueryRunner, idSmmlv: string) {
    let smmlvEntity = await queryRunner.manager.findOne(SmmlvEntity, {
      where: {
        id: idSmmlv,
      },
      select: {
        id: true,
      },
    });

    if (!smmlvEntity) {
      throw new NotFoundException('SMMLV not found');
    }

    return smmlvEntity;
  }

  private generateCacheKey(
    prefix: string,
    params: ParamProgramAllDto,
    includesPagination = true,
  ) {
    const keyParts = [prefix];

    if (params.idEducationalLevel)
      keyParts.push(`idEducationalLevel:${params.idEducationalLevel}`);
    if (params.idMethodology)
      keyParts.push(`idMethodology:${params.idMethodology}`);
    if (params.idModality) keyParts.push(`idModality:${params.idModality}`);
    if (params.filter) keyParts.push(`filter:${params.filter}`);
    if (params.order) keyParts.push(`order:${params.order}`);

    if (includesPagination) {
      if (params.limit !== undefined) keyParts.push(`limit:${params.limit}`);
      if (params.offset !== undefined) keyParts.push(`offset:${params.offset}`);
    }
    return keyParts.join('|');
  }

  async findAll(params: ParamProgramAllDto) {
    const cacheKey = this.generateCacheKey('programs:all', params, false);

    let allPrograms =
      await this.cacheManager.get<ProgramMapResponse[]>(cacheKey);

    if (!allPrograms) {
      const isMethodologyUUID = params.idMethodology
        ? isUUID(params.idMethodology)
        : false;

      const isMethodologyNumber = params.idMethodology
        ? !isNaN(Number(params.idMethodology))
        : false;

      const internalParams = {
        ...params,
        limit: 1000,
        offset: 0,
        idMethodology: isMethodologyUUID ? params.idMethodology : undefined,
      };

      const externalParams = {
        ...params,
        limit: 1000,
        offset: 0,
        idMethodology: isMethodologyNumber ? params.idMethodology : undefined,
      };

      const [internalResults, externalResults] = await Promise.all([
        this.getAllInternal(internalParams),
        this.getAllExternalUrl(externalParams),
      ]);

      const programsMap = new Map<string, ProgramMapResponse>();

      internalResults.data.forEach((program) => {
        const key = NormalizedUtil.normalizeNameWithoutTilde(
          program.idProgramExternal
            ? `external:${program.idProgramExternal}|${program.unity}|${program.workday}|${program.modality}|${program.methodology}|${program.faculty}`
            : `internal:${program.id}|${program.unity}|${program.workday}|${program.modality}|${program.methodology}|${program.faculty}`,
        );
        if (!programsMap.has(key)) {
          programsMap.set(key, program);
        }
      });

      externalResults.data.forEach((program) => {
        const key = NormalizedUtil.normalizeNameWithoutTilde(
          `external:${program.id}|${program.unity}|${program.workday}|${program.modality}|${program.methodology}|${program.faculty}`,
        );

        if (!programsMap.has(key)) {
          programsMap.set(key, program);
        }
      });

      allPrograms = Array.from(programsMap.values()).sort((a, b) =>
        params.order === OrderType.ASC
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name),
      );

      await this.cacheManager.set(cacheKey, allPrograms, 300000); // Cache for 5 minutes
    }

    const { limit = 10, offset = 0 } = params;
    const paginatedPrograms = allPrograms.slice(offset, offset + limit);

    return {
      count: allPrograms.length,
      pages: Math.ceil(allPrograms.length / limit),
      data: paginatedPrograms,
    };
  }

  private async getAllInternal(params: ParamProgramAllDto) {
    const {
      idMethodology,
      idModality,
      filter,
      limit = 10,
      offset = 0,
      order = OrderType.ASC,
    } = params;

    const queryBuilder = this.dataSource
      .getRepository(ProgramPlacementEntity)
      .createQueryBuilder('placement')
      .leftJoin('placement.program', 'program')
      .leftJoin('placement.modality', 'modality')
      .leftJoin('placement.faculty', 'faculty')
      .leftJoin('placement.methodology', 'methodology')
      .select([
        // Placement info
        'placement.id',
        'placement.unity',
        'placement.workday',
        // Program info
        'program.id',
        'program.idProgramExternal',
        'program.name',
        'program.codeCDP',
        // Modality info
        'modality.id',
        'modality.name',
        // Faculty info
        'faculty.id',
        'faculty.name',
        // Methodology info
        'methodology.id',
        'methodology.name',
      ])
      .take(limit)
      .skip(offset)
      .orderBy('program.name', order);

    if (filter) {
      queryBuilder.andWhere('program.name ILIKE :filter', {
        filter: `%${filter}%`,
      });
    }

    if (idModality && isUUID(idModality)) {
      queryBuilder.andWhere('modality.id = :idModality', { idModality });
    }

    if (idMethodology && isUUID(idMethodology)) {
      queryBuilder.andWhere('methodology.id = :idMethodology', {
        idMethodology,
      });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    const programs = ProgramMap.toProgramResponseAll(data);

    return {
      count: total,
      pages: Math.ceil(total / limit),
      data: programs,
    };
  }

  private async getAllExternalUrl(params: ParamProgramAllDto) {
    const {
      idEducationalLevel,
      idMethodology,
      idModality,
      filter,
      limit = 10,
      offset = 0,
      order = OrderType.ASC,
    } = params;

    const queryParams = new URLSearchParams();

    const page = Math.floor(offset / limit);
    const skipInPage = offset % limit;

    queryParams.append('page', page.toString());
    queryParams.append('size', limit.toString());

    if (idEducationalLevel) {
      queryParams.append('idNivelEducativo', idEducationalLevel.toString());
    }

    if (idModality && !isNaN(Number(idModality))) {
      queryParams.append('idModalidad', idModality.toString());
    }

    if (idMethodology && !isNaN(Number(idMethodology))) {
      queryParams.append('idMetodologia', idMethodology.toString());
    }

    if (filter) {
      queryParams.append('filter', filter);
    }

    const url = `${this.API_HOST}/programaCommon/busquedaPrograma?${queryParams.toString()}`;

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
        data: ProgramMap.toProgramResponseAllExternal(
          data.content.slice(skipInPage),
        ).sort((a, b) =>
          order === OrderType.ASC
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name),
        ),
      };
    } catch (error) {
      this.logger.error({ error });
      throw new InternalServerErrorException(
        'Please contact support regarding program retrieval',
      );
    }
  }

  async findAllExisting(params: ParamProgramAllDto) {
    return await this.getAllExternalUrl(params);
  }

  async findPensumByIdProgramExternal(id: number, pagination: PaginationDto) {
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
        data: PensumMap.toPensumResponseAllExternal(
          data.content.slice(skipInPage),
        ).sort((a, b) =>
          order === OrderType.ASC
            ? a.description.localeCompare(b.description)
            : b.description.localeCompare(a.description),
        ),
      };
    } catch (error) {
      this.logger.error(`Error fetching programs: ${error}`);
      throw new InternalServerErrorException(
        'Please contact support regarding pensum retrieval',
      );
    }
  }

  private async findPensumByIdProgramInternal(
    idProgram: string,
    pagination: PaginationDto,
  ) {
    const { limit = 10, offset = 0, order = OrderType.ASC } = pagination;

    const queryBuilder = this.dataSource
      .getRepository(PensumEntity)
      .createQueryBuilder('pensum')
      .where('pensum.idProgram = :idProgram', { idProgram })
      .take(limit)
      .skip(offset)
      .orderBy('pensum.name', order);

    const [data, count] = await queryBuilder.getManyAndCount();

    return {
      count,
      pages: Math.ceil(count / limit),
      data: PensumMap.toPensumResponseAllInternal(data),
    };
  }

  async findPensumByIdProgram(idProgram: string, pagination: PaginationDto) {
    if (isUUID(idProgram)) {
      return await this.findPensumByIdProgramInternal(idProgram, pagination);
    }

    if (!isNaN(Number(idProgram))) {
      return await this.findPensumByIdProgramExternal(
        Number(idProgram),
        pagination,
      );
    }

    throw new BadRequestException(
      'Invalid program ID format is UUID or number',
    );
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

  private handleError(error: any) {
    if (error instanceof NotFoundException) {
      throw error;
    }

    if (error.code === '23505') {
      const message = error.detail as string;

      if (
        message.includes(
          '("idProgramPlacement", "idProgram", cohort, semester, "idPensum")',
        )
      ) {
        throw new ConflictException(
          'Program offering already exists for the given cohort, semester, and pensum',
        );
      }
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Please contact support');
  }
}
