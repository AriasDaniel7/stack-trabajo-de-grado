export interface FacultyResponse {
  count: number;
  pages: number;
  data: Faculty[];
}

export interface Faculty {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
}

export interface FacultyCreate {
  name: string;
}
