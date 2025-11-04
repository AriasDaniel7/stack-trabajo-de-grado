import { SchoolGrade } from './school-grade';

export interface DocentResponse {
  count: number;
  pages: number;
  data: Docent[];
}

export interface Docent {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  nationality: string;
  document_type: string;
  document_number: string;
  address: string;
  phone: string;
  schoolGrade: SchoolGrade;
}

export interface DocentCreate {
  name: string;
  nationality: string;
  document_type: string;
  document_number: string;
  address: string;
  phone: string;
  id_school_grade: string;
}
