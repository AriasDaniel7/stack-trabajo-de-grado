import { Docent } from './docent';
import { SchoolGrade } from './school-grade';

export enum VinculationType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

export enum PaymentType {
  BONIFICACIONES_PLANTA_ADMIN = 'BONIFICACIONES_PLANTA_ADMIN',
  DOCENTE_EXTERNO_OPS = 'DOCENTE_EXTERNO_OPS',
}

export interface SeminarResponse {
  count: number;
  pages: number;
  data: Seminar[];
}

export interface Seminar {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  credits: number;
  payment_type: string;
  airTransportValue?: number;
  airTransportRoute?: string;
  landTransportValue?: number;
  landTransportRoute?: string;
  foodAndLodgingAid?: number;
  eventStayDays?: number;
  hotelLocation?: string;
  is_active?: boolean;
  dates: DateElement[];
  seminarDocent: SeminarDocent;
}

export interface DateElement {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  date: Date;
}

export interface SeminarDocent {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  vinculation: VinculationType;
  docent: Docent;
  schoolGrade: SchoolGrade;
}

export interface SeminarCreate {
  name: string;
  credits: number;
  docent_id: string;
  docent_vinculation: VinculationType;
  dates: Date[];
  payment_type: PaymentType;
  is_active?: boolean;
}
