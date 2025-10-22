export interface ProgramExistingResponse {
  count: number;
  pages: number;
  data: ProgramExisting[];
}

export interface ProgramExisting {
  id: number;
  unity: string;
  workday: string;
  modality: string;
  methodology: string;
  educationalLevel: string;
  status: string;
  name: string;
  code: string;
  faculty: null | string;
  credits: string;
  pensum: string;
}
