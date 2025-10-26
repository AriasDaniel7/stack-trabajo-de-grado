export interface ProgramCreate {
  idProgramExternal?: number;
  name: string;
  faculty?: string;
  modality: string;
  methodology: string;
  unity: string;
  workday: string;
  codeCDP?: string;
  idSmmlv: string;
  pensum: PensumCreate;
  discounts: DiscountCreate[];
  programOffering: ProgramOfferingCreate;
}

export interface ProgramOfferingCreate {
  cohort: number;
  semester: number;
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
