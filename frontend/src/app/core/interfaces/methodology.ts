export interface MethodologyResponse {
  count: number;
  pages: number;
  data: Methodology[];
}

export interface MethodologyExistingResponse {
  count: number;
  pages: number;
  data: MethodologyExisting[];
}

export interface Methodology {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
}

export interface MethodologyExisting {
  id: number;
  description: string;
  status: string;
}

export interface MethodologyCreate {
  name: string;
}
