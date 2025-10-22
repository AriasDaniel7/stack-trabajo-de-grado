import { Docent, DocumentType } from '@database/interfaces/data';
import { BaseEntity } from './base';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { SeminarDocentEntity } from './seminar-docent';

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

  @OneToMany(() => SeminarDocentEntity, (seminarDocent) => seminarDocent.docent)
  seminarDocent: SeminarDocentEntity[];

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
