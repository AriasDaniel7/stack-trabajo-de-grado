import { Fee } from './fee';
import { Pensum } from './pensum';
import { Smmlv } from './smmlv';

export interface ProgramResponse {
  count: number;
  pages: number;
  data: Program[];
}

export interface Program {
  id: number | string;
  idUnityProgram: number | string;
  idProgramPlacement?: string;
  unity: string;
  workday: string;
  modality: string;
  methodology: string;
  educationalLevel: string;
  name: string;
  faculty: string | null;
  idProgramExternal?: number;
}

export interface ProgramCreate {
  idProgramExternal?: number;
  name: string;
  faculty?: string;
  modality: string;
  methodology: string;
  unity: string;
  workday: string;
  idSmmlv: string;
  idFee: string;
  pensum: PensumCreate;
  discounts: DiscountCreate[];
  programOffering: ProgramOfferingCreate;
  seminars: SeminarProgramOfferingCreate[];
}

export interface ProgramOfferingCreate {
  cohort: number;
  semester: number;
  codeCDP?: string;
}

export interface PensumCreate {
  idPensumExternal?: number;
  name: string;
  startYear: number;
  status: string;
  credits: number;
}

export interface DiscountCreate {
  percentage: number;
  numberOfApplicants: number;
}

export interface SeminarProgramOfferingCreate {
  idSeminar: string;
}

export interface OfferingResponse {
  count: number;
  pages: number;
  data: Offering[];
}

export interface Offering {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  cohort: number;
  semester: number;
  codeCDP: null | string;
  program: Program;
  fee: Fee;
  discounts: Discount[];
  pensum: Pensum;
  smmlv: Smmlv;
}

export interface Discount {
  id: string;
  percentage: number;
  numberOfApplicants: number;
}
