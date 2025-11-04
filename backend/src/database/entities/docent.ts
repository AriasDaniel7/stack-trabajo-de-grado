import { Docent, DocumentType } from '@database/interfaces/data';
import { BaseEntity } from './base';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';
import { SchoolGradeEntity } from './school-grade';
import { ApiProperty } from '@nestjs/swagger';

@Entity('docents')
export class DocentEntity extends BaseEntity implements Docent {
  @ApiProperty({ type: String })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({ type: String })
  @Column({ type: 'varchar' })
  nationality: string;

  @ApiProperty({ type: String, enum: DocumentType })
  @Column({ type: 'varchar', enum: DocumentType })
  document_type: DocumentType;

  @ApiProperty({ type: String, uniqueItems: true })
  @Column({ type: 'varchar', unique: true })
  document_number: string;

  @ApiProperty({ type: String })
  @Column({ type: 'varchar' })
  address: string;

  @ApiProperty({ type: String })
  @Column({ type: 'varchar' })
  phone: string;

  @ManyToOne(() => SchoolGradeEntity, (schoolGrade) => schoolGrade.docents)
  schoolGrade: SchoolGradeEntity;

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
