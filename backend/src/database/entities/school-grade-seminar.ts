import { SchoolGrade } from '@database/interfaces/data';
import { BaseEntity } from './base';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { SeminarDocentEntity } from './seminar-docent';

@Entity('school_grade_seminars')
export class SchoolGradeSeminarEntity
  extends BaseEntity
  implements SchoolGrade
{
  @Column({ type: 'int', unique: true })
  level: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @OneToMany(
    () => SeminarDocentEntity,
    (seminarDocent) => seminarDocent.schoolGrade,
  )
  seminarDocent: SeminarDocentEntity[];

  @BeforeInsert()
  beforeInsert() {
    this.name = this.name.toLowerCase().trim();
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.beforeInsert();
  }
}
