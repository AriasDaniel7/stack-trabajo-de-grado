export interface Base {
  id: string; // uuid
  createdAt: Date; // Fecha de creación
  updatedAt: Date; // Fecha de actualización
  deletedAt?: Date; // Fecha de eliminación
}

export enum Rol {
  ADMIN = 'admin', // Administrador
  USER = 'user', // Usuario
}

export interface User {
  email: string; // Correo electrónico
  password?: string; // Contraseña
  name: string; // Nombre
  isActive: boolean; // Estado del usuario
  role: Rol; // Rol del usuario
}

export interface SchoolGrade {
  level: number; // Nivel en número (ej: 1, 2, 3...)
  name: string; // Nombre del grado (ej: "Especializacion", "Doctorado", etc.)
}

export interface Docent {
  name: string; // Nombre del docente
  nationality: string; // Nacionalidad
  document_type: DocumentType; // Tipo de documento
  document_number: string; // Número de documento
  address: string; // Dirección
  phone: string; // Teléfono
}

export enum DocumentType {
  CC = 'cc', // Cédula de ciudadanía
  CE = 'ce', // Cédula de extranjería
  TI = 'ti', // Tarjeta de identidad
  PP = 'pp', // Pasaporte
}

export interface Smmlv {
  year: number; // Año
  value: number; // Valor del SMMLV
}

export interface Fee {
  factor_smmlv: number; // Factor del SMMLV
  credit_value_smmlv: number; // Valor del crédito en SMMLV
}

export enum VinculationType {
  INTERNAL = 'INTERNAL', // Interno
  EXTERNAL = 'EXTERNAL', // Externo
}

export enum PaymentType {
  BONIFICACIONES_PLANTA_ADMIN = 'BONIFICACIONES_PLANTA_ADMIN', // Bonificaciones planta administrativa
  DOCENTE_EXTERNO_OPS = 'DOCENTE_EXTERNO_OPS', // Docente externo OPS
}

export interface SeminarDate {
  date: Date; // Fecha del seminario
}

export interface Seminar {
  name: string; // Nombre del seminario
  credits: number; // Créditos del seminario
  payment_type: PaymentType; // Tipo de pago
  is_active?: boolean; // Estado del seminario
}

export interface SeminarDocent {
  vinculation: VinculationType; // Tipo de vinculación
}

export interface Modality {
  name: string; // Nombre de la modalidad
}

export interface Methodology {
  name: string; // Nombre de la metodología
}

export interface Faculty {
  name: string; // Nombre de la facultad
}

export interface Program {
  name: string; // Nombre del programa
  cohort: number; // Cohorte del programa
  semester: number; // Semestre del programa
  city: string; // Ciudad del programa
}
