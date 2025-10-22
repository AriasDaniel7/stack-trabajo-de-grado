export interface ModalityResponse {
  count: number;
  pages: number;
  data: Modality[];
}

export interface ModalityExistingResponse {
  count: number;
  pages: number;
  data: ModalityExisting[];
}

export interface Modality {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
}

export interface ModalityExisting {
  id: number;
  description: string;
  idEducationalLevel: number;
  points: string | null;
  code: string | null;
}

export interface ModalityCreate {
  name: string;
}
