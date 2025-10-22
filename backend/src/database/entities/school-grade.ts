import { SchoolGrade } from '@database/interfaces/data';
import { BaseEntity } from './base';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { DocentEntity } from './docent';
import { ApiProperty } from '@nestjs/swagger';

@Entity('school_grades')
export class SchoolGradeEntity extends BaseEntity implements SchoolGrade {
  @ApiProperty({ type: 'integer' })
  @Column({ type: 'int', unique: true })
  level: number;

  @ApiProperty({ type: String })
  @Column({ type: 'varchar', unique: true })
  name: string;

  @OneToMany(() => DocentEntity, (docent) => docent.school_grade)
  docents: DocentEntity[];

  @BeforeInsert()
  beforeInsert() {
    this.name = this.name.toLowerCase().trim();
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.beforeInsert();
  }
}
