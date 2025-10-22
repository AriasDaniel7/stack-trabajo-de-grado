import { Modality } from './modality';

export interface FeeResponse {
  count: number;
  pages: number;
  data: Fee[];
}

export interface Fee {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  factor_smmlv: number;
  credit_value_smmlv: number;
  modality: Modality;
}

export interface FeeCreate {
  modality_id: string;
  factor_smmlv: number;
  credit_value_smmlv: number;
}
