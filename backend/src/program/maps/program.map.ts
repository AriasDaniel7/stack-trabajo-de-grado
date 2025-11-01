import { ProgramEntity } from '@database/entities/program';
import { ProgramOfferingEntity } from '@database/entities/program-offering';
import { ProgramPlacementEntity } from '@database/entities/program-placement';
import { Program } from '@program/interfaces/program-external';

export interface ProgramMapResponse {
  id: string | number;
  idUnityProgram: string | number;
  idProgramExternal?: number;
  idProgramPlacement?: string;
  unity: string;
  workday: string;
  modality: string;
  methodology: string;
  educationalLevel: string;
  name: string;
  faculty: string | null;
}

export class ProgramMap {
  static toProgramResponseAll(
    program: ProgramPlacementEntity[],
  ): ProgramMapResponse[] {
    return program.map((p) => ({
      id: p.program.id,
      idUnityProgram: p.id,
      idProgramPlacement: p.id,
      idProgramExternal: p.program.idProgramExternal,
      unity: p.unity,
      workday: p.workday,
      modality: p.modality.name,
      methodology: p.methodology.name,
      educationalLevel: 'postgrado',
      name: p.program.name,
      faculty: p.faculty ? p.faculty.name : null,
    }));
  }

  static toProgramResponseAllExternal(
    program: Program[],
  ): ProgramMapResponse[] {
    return program.map((p) => ({
      id: p.id,
      idUnityProgram: p.idUnidadPrograma,
      unity: p.unidad,
      workday: p.jornada,
      modality: p.modalidad,
      methodology: p.metodologia,
      educationalLevel: p.nivelEducativo,
      name: p.nombre,
      faculty: p.facultad,
    }));
  }

  static toProgramResponseByIdProgramPlacement(program: ProgramEntity) {
    return {
      id: program.id,
      idUnityProgram: program.placements[0].id,
      idProgramPlacement: program.placements[0].id,
      idProgramExternal: program.idProgramExternal,
      unity: program.placements[0].unity,
      workday: program.placements[0].workday,
      modality: program.placements[0].modality.name,
      methodology: program.placements[0].methodology.name,
      name: program.name,
      faculty: program.placements[0].faculty
        ? program.placements[0].faculty.name
        : null,
    };
  }

  static toProgramResponseByIdOffering(offering: ProgramOfferingEntity) {
    return {
      id: offering.id,
      createdAt: offering.createdAt,
      updatedAt: offering.updatedAt,
      cohort: offering.cohort,
      semester: offering.semester,
      codeCDP: offering.codeCDP,
      program: {
        id: offering.programPlacement.program.id,
        idUnityProgram: offering.programPlacement.id,
        idProgramPlacement: offering.programPlacement.id,
        idProgramExternal: offering.programPlacement.program.idProgramExternal,
        unity: offering.programPlacement.unity,
        workday: offering.programPlacement.workday,
        modality: offering.programPlacement.modality.name,
        methodology: offering.programPlacement.methodology.name,
        name: offering.programPlacement.program.name,
        faculty: offering.programPlacement.faculty
          ? offering.programPlacement.faculty.name
          : null,
      },
      fee: offering.fee,
      discounts: offering.discounts,
      pensum: offering.pensum,
      smmlv: offering.smmlv,
      seminars: offering.seminarProgramOfferings.map((spo) => spo.seminar),
    };
  }
}
