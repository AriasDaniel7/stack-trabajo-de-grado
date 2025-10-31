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
