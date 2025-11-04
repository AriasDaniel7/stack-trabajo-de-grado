import { Docent, DocumentType } from '@database/interfaces/data';
import { BaseEntity } from './base';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { SeminarDocentEntity } from './seminar-docent';
import { SchoolGradeSeminarEntity } from './school-grade-seminar';
import { ProgramOfferingEntity } from './program-offering';

@Entity('docent_seminars')
export class DocentSeminarEntity extends BaseEntity implements Docent {
  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar' })
  nationality: string;

  @Column({ type: 'varchar', enum: DocumentType })
  document_type: DocumentType;

  @Column({ type: 'varchar', unique: true })
  document_number: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'varchar' })
  phone: string;

  @Column({ type: 'uuid', nullable: true })
  idSchoolGrade: string;

  @OneToMany(() => SeminarDocentEntity, (seminarDocent) => seminarDocent.docent)
  seminarDocent: SeminarDocentEntity[];

  @ManyToOne(
    () => SchoolGradeSeminarEntity,
    (schoolGrade) => schoolGrade.docentSeminar,
  )
  @JoinColumn({ name: 'idSchoolGrade' })
  schoolGrade: SchoolGradeSeminarEntity;

  @OneToMany(() => ProgramOfferingEntity, (offering) => offering.docentSeminar)
  offerings: ProgramOfferingEntity[];

  @BeforeInsert()
  beforeInsert() {
    this.name = this.name.toLowerCase().trim();
    this.nationality = this.nationality.toLowerCase().trim();
    this.document_number = this.document_number.toLowerCase().trim();
    this.address = this.address.toLowerCase().trim();
    this.phone = this.phone.toLowerCase().trim();
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.beforeInsert();
  }
}
