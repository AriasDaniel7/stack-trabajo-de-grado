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
  CreateDiscountDto,
  CreatePensumDto,
  CreateProgramDto,
  CreateProgramOfferingDto,
  CreateSeminarProgramOfferingDto,
} from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { DataSource, In, QueryRunner } from 'typeorm';
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
import { FeeEntity } from '@database/entities/rates';
import { ParamProgramAllInternalDto } from './dto/param-program-all-internal.dto';
import { ParamOfferingDto } from './dto/param-offering.dto';
import { DiscountEntity } from '@database/entities/discount';
import { SeminarEntity } from '@database/entities/seminar';
import { SeminarProgramOfferingEntity } from '@database/entities/seminar-program-offering';

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
        faculty,
        modality,
        methodology,
        idSmmlv,
        idFee,
        pensum,
        unity,
        workday,
        discounts,
        programOffering,
        seminars,
        ...programData
      } = createProgramDto;

      const [
        modalityEntity,
        methodologyEntity,
        facultyEntity,
        smmlvEntity,
        feeEntity,
      ] = await Promise.all([
        this.createProgramModality(queryRunner, modality),
        this.createMethodology(queryRunner, methodology),
        this.createProgramFaculty(queryRunner, faculty),
        this.createSmmlv(queryRunner, idSmmlv),
        this.createFee(queryRunner, idFee),
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
        feeEntity.id,
        programOffering,
      );

      const [discountsEntity, seminarProgramOfferings] = await Promise.all([
        this.createDiscounts(queryRunner, discounts, programOfferingEntity.id),
        this.assingSeminarProgramOfferings(
          queryRunner,
          seminars,
          programOfferingEntity.id,
        ),
      ]);

      programOfferingEntity.discounts = discountsEntity;

      programOfferingEntity.seminarProgramOfferings = seminarProgramOfferings;

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

  private async createDiscounts(
    queryRunner: QueryRunner,
    discounts: CreateDiscountDto[],
    idProgramOffering: string,
  ) {
    const discountEntities = discounts.map((discount) => {
      return queryRunner.manager.create(DiscountEntity, {
        ...discount,
        idProgramOffering,
      });
    });

    return await queryRunner.manager.save(discountEntities);
  }

  private async assingSeminarProgramOfferings(
    queryRunner: QueryRunner,
    seminars: CreateSeminarProgramOfferingDto[],
    idProgramOffering: string,
  ) {
    const idsSeminars = seminars.map((seminar) => seminar.idSeminar);

    const seminarsEntities = await queryRunner.manager
      .getRepository(SeminarEntity)
      .find({
        where: {
          id: In(idsSeminars),
        },
        select: {
          id: true,
        },
      });

    if (seminarsEntities.length !== idsSeminars.length) {
      throw new NotFoundException('One or more seminars not found');
    }

    const seminarProgramOfferings = seminarsEntities.map((seminar) => {
      return queryRunner.manager
        .getRepository(SeminarProgramOfferingEntity)
        .create({
          idSeminar: seminar.id,
          idProgramOffering,
        });
    });

    return await queryRunner.manager.save(seminarProgramOfferings);
  }

  private async createProgramOfferings(
    queryRunner: QueryRunner,
    idSmmlv: string,
    idProgramPlacement: string,
    idPensum: string,
    idProgram: string,
    idFee: string,
    programOffering: CreateProgramOfferingDto,
  ) {
    const offering = queryRunner.manager.create(ProgramOfferingEntity, {
      ...programOffering,
      idProgramPlacement,
      idSmmlv,
      idPensum,
      idProgram,
      idFee,
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

  private async createFee(queryRunner: QueryRunner, idFee: string) {
    let feeEntity = await queryRunner.manager.findOne(FeeEntity, {
      where: {
        id: idFee,
      },
      select: {
        id: true,
      },
    });

    if (!feeEntity) {
      throw new NotFoundException('Fee not found');
    }

    return feeEntity;
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
        this.getAllExternal(externalParams),
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

  async findAllInternal(params: ParamProgramAllInternalDto) {
    const {
      idMethodology,
      idModality,
      idFaculty,
      name,
      workday,
      unity,
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
        'placement.id',
        'placement.unity',
        'placement.workday',
        // Program info
        'program.id',
        'program.idProgramExternal',
        'program.name',
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
      .orderBy('program.name', order)
      .take(limit)
      .skip(offset);

    if (idMethodology) {
      queryBuilder.andWhere('methodology.id = :idMethodology', {
        idMethodology,
      });
    }

    if (idModality) {
      queryBuilder.andWhere('modality.id = :idModality', { idModality });
    }

    if (idFaculty) {
      queryBuilder.andWhere('faculty.id = :idFaculty', { idFaculty });
    }

    if (name) {
      queryBuilder.andWhere('program.name ILIKE :name', { name: `%${name}%` });
    }

    if (unity) {
      queryBuilder.andWhere('placement.unity ILIKE :unity', {
        unity: `%${unity}%`,
      });
    }

    if (workday) {
      queryBuilder.andWhere('placement.workday ILIKE :workday', {
        workday: `%${workday}%`,
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

  async findOneByIdProgramPlacement(idProgramPlacement: string) {
    const queryBuilder = this.dataSource
      .getRepository(ProgramEntity)
      .createQueryBuilder('program')
      .leftJoin('program.placements', 'placement')
      .where('placement.id = :idProgramPlacement', { idProgramPlacement })
      .leftJoin('placement.modality', 'modality')
      .leftJoin('placement.faculty', 'faculty')
      .leftJoin('placement.methodology', 'methodology')
      .select([
        'placement.id',
        'placement.unity',
        'placement.workday',
        // Program info
        'program.id',
        'program.idProgramExternal',
        'program.name',
        // Modality info
        'modality.name',
        // Faculty info
        'faculty.name',
        // Methodology info
        'methodology.name',
      ]);

    const program = await queryBuilder.getOne();

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    return ProgramMap.toProgramResponseByIdProgramPlacement(program);
  }

  async findOneByIdOffering(idOffering: string) {
    const queryBuilder = this.dataSource
      .createQueryBuilder(ProgramOfferingEntity, 'offering')
      .where('offering.id = :idOffering', { idOffering })
      .leftJoin('offering.programPlacement', 'programPlacement')
      .leftJoin('offering.smmlv', 'smmlv')
      .leftJoin('offering.discounts', 'discounts')
      .leftJoin('offering.fee', 'fee')
      .leftJoin('programPlacement.program', 'program')
      .leftJoin('programPlacement.modality', 'modality')
      .leftJoin('programPlacement.faculty', 'faculty')
      .leftJoin('programPlacement.methodology', 'methodology')
      .leftJoin('offering.pensum', 'pensum')
      .leftJoin('offering.seminarProgramOfferings', 'seminarProgramOfferings')
      .leftJoin('seminarProgramOfferings.seminar', 'seminar')
      .leftJoin('seminar.seminarDocent', 'seminarDocent')
      .leftJoin('seminarDocent.docent', 'docent')
      .leftJoin('seminarDocent.schoolGrade', 'schoolGrade')
      .select([
        'offering.id',
        'offering.cohort',
        'offering.semester',
        'offering.codeCDP',
        'offering.createdAt',
        'offering.updatedAt',
        // Program Placement info
        'programPlacement.id',
        'programPlacement.unity',
        'programPlacement.workday',
        // Program info
        'program.id',
        'program.idProgramExternal',
        'program.name',
        // Modality info
        'modality.id',
        'modality.name',
        // Faculty info
        'faculty.id',
        'faculty.name',
        // Methodology info
        'methodology.id',
        'methodology.name',
        // SMMLV info
        'smmlv.id',
        'smmlv.year',
        'smmlv.value',
        // Fee info
        'fee.id',
        'fee.factor_smmlv',
        'fee.credit_value_smmlv',
        // Discounts info
        'discounts.id',
        'discounts.percentage',
        'discounts.numberOfApplicants',
        // Pensum info
        'pensum.id',
        'pensum.name',
        'pensum.idPensumExternal',
        'pensum.startYear',
        'pensum.status',
        'pensum.credits',
        // Seminar info
        'seminarProgramOfferings.id',
        'seminar.id',
        'seminar.name',
        'seminar.createdAt',
        'seminar.updatedAt',
        'seminar.credits',
        'seminar.payment_type',
        'seminar.is_active',
        'seminar.airTransportValue',
        'seminar.airTransportRoute',
        'seminar.landTransportValue',
        'seminar.landTransportRoute',
        'seminar.foodAndLodgingAid',
        'seminar.eventStayDays',
        'seminar.hotelLocation',
        // Seminar Docent info
        'seminarDocent.id',
        'seminarDocent.vinculation',
        'seminarDocent.createdAt',
        'seminarDocent.updatedAt',
        // Docent info
        'docent.id',
        'docent.name',
        'docent.nationality',
        'docent.document_type',
        'docent.document_number',
        'docent.address',
        'docent.phone',
        'docent.createdAt',
        'docent.updatedAt',
        // School Grade info
        'schoolGrade.id',
        'schoolGrade.name',
        'schoolGrade.level',
        'schoolGrade.createdAt',
        'schoolGrade.updatedAt',
      ]);

    const offering = await queryBuilder.getOne();

    if (!offering) {
      throw new NotFoundException('Program offering not found');
    }

    return ProgramMap.toProgramResponseByIdOffering(offering);
  }

  async findOfferingsByIdProgramPlacement(
    idProgramPlacement: string,
    params: ParamOfferingDto,
  ) {
    const {
      limit = 10,
      offset = 0,
      order = OrderType.ASC,
      cohort,
      semester,
    } = params;

    const queryBuilder = this.dataSource
      .getRepository(ProgramOfferingEntity)
      .createQueryBuilder('offering')
      .where('offering.idProgramPlacement = :idProgramPlacement', {
        idProgramPlacement,
      })
      .select([
        'offering.id',
        'offering.createdAt',
        'offering.updatedAt',
        'offering.cohort',
        'offering.semester',
        'offering.codeCDP',
      ])
      .orderBy('offering.cohort', order)
      .take(limit)
      .skip(offset);

    if (cohort) {
      queryBuilder.andWhere('offering.cohort = :cohort', { cohort });
    }

    if (semester) {
      queryBuilder.andWhere('offering.semester = :semester', { semester });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      count: total,
      pages: Math.ceil(total / limit),
      data: data,
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

  private async getAllExternal(params: ParamProgramAllDto) {
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

  async findAllExternal(params: ParamProgramAllDto) {
    return await this.getAllExternal(params);
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
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name),
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

  async updateOffering(id: string, updateProgramDto: UpdateProgramDto) {
    if (!updateProgramDto) {
      throw new BadRequestException('No data provided for update');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { seminars, discounts, idFee, idSmmlv, programOffering } =
        updateProgramDto;

      const offering = await queryRunner.manager.findOne(
        ProgramOfferingEntity,
        {
          where: { id },
        },
      );

      if (!offering) {
        throw new NotFoundException('Program offering not found');
      }

      if (idFee) {
        const feeEntity = await this.createFee(queryRunner, idFee);
        offering.idFee = feeEntity.id;
      }

      if (idSmmlv) {
        const smmlvEntity = await this.createSmmlv(queryRunner, idSmmlv);
        offering.idSmmlv = smmlvEntity.id;
      }

      if (programOffering) {
        Object.assign(offering, programOffering);
      }

      if (discounts) {
        // Remove existing discounts
        await queryRunner.manager.getRepository(DiscountEntity).delete({
          idProgramOffering: offering.id,
        });

        const discountsEntity = await this.createDiscounts(
          queryRunner,
          discounts,
          offering.id,
        );

        offering.discounts = discountsEntity;
      }

      if (seminars) {
        // Remove existing seminar program offerings
        await queryRunner.manager
          .getRepository(SeminarProgramOfferingEntity)
          .delete({
            idProgramOffering: offering.id,
          });

        const seminarProgramOfferings =
          await this.assingSeminarProgramOfferings(
            queryRunner,
            seminars,
            offering.id,
          );
        offering.seminarProgramOfferings = seminarProgramOfferings;
      }
      await queryRunner.manager.save(offering);
      await queryRunner.commitTransaction();
      return offering;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleError(error);
    } finally {
      await queryRunner.release();
    }
  }

  update(id: number, updateProgramDto: UpdateProgramDto) {
    return `This action updates a #${id} program`;
  }

  remove(id: number) {
    return `This action removes a #${id} program`;
  }

  async removePlacement(id: string) {
    const placement = await this.dataSource
      .getRepository(ProgramPlacementEntity)
      .findOne({
        where: { id },
      });

    if (!placement) {
      throw new NotFoundException('Program placement not found');
    }

    await this.dataSource
      .getRepository(ProgramPlacementEntity)
      .remove(placement);

    return { message: 'Program placement removed successfully' };
  }

  async removeOffering(id: string) {
    const offering = await this.dataSource
      .getRepository(ProgramOfferingEntity)
      .findOne({
        where: { id },
      });

    if (!offering) {
      throw new NotFoundException('Program offering not found');
    }

    await this.dataSource.getRepository(ProgramOfferingEntity).remove(offering);
    return { message: 'Program offering removed successfully' };
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
