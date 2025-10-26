import { ProgramPlacementEntity } from '@database/entities/program-placement';
import { Program } from '@program/interfaces/program-external';

export interface ProgramMapResponse {
  id: string | number;
  idUnityProgram: string | number;
  idProgramExternal?: number;
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
}
