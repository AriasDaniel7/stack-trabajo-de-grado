export interface SchoolGradeResponse {
  count: number;
  pages: number;
  data: SchoolGrade[];
}

export interface SchoolGrade {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  level: number;
  name: string;
}

export interface SchoolGradeExistingResponse {
  count: number;
  pages: number;
  data: SchoolGradeExisting[];
}

export interface SchoolGradeExisting {
  id: number;
  description: string;
  forIes: string;
  observation: string | null;
}

export interface SchoolGradeCreate {
  level: number;
  name: string;
}
