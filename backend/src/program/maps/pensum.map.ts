import { PensumEntity } from '@database/entities/pensum';
import { PensumExternal } from '../interfaces/pensum-external';

export interface PensumMapResponse {
  id: string | number;
  idPensumExternal?: number;
  description: string;
  startYear: number;
  status: string;
  credits: number;
}

export class PensumMap {
  static toPensumResponseAllInternal(
    pensums: PensumEntity[],
  ): PensumMapResponse[] {
    return pensums.map((p) => ({
      id: p.id,
      idPensumExternal: p.idPensumExternal,
      description: p.name,
      startYear: p.startYear,
      status: p.status,
      credits: p.credits,
    }));
  }

  static toPensumResponseAllExternal(
    pensums: PensumExternal[],
  ): PensumMapResponse[] {
    return pensums.map((p) => ({
      id: p.id,
      description: p.descripcion,
      startYear: +p.anoInicio,
      status: p.estadoPensum,
      credits: +p.creditos,
    }));
  }
}
