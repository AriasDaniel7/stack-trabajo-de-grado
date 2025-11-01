import { PaymentType, Seminar } from '@database/interfaces/data';
import { BaseEntity } from './base';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { SeminarDateEntity } from './seminar-date';
import { SeminarDocentEntity } from './seminar-docent';
import { SeminarProgramOfferingEntity } from './seminar-program-offering';

@Entity('seminaries')
export class SeminarEntity extends BaseEntity implements Seminar {
  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'int' })
  credits: number;

  @Column({ type: 'varchar', enum: PaymentType })
  payment_type: PaymentType;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => SeminarDateEntity, (seminarDate) => seminarDate.seminar)
  dates: SeminarDateEntity[];

  @OneToOne(() => SeminarDocentEntity, (seminarDocent) => seminarDocent.seminar)
  seminarDocent: SeminarDocentEntity;

  @OneToMany(() => SeminarProgramOfferingEntity, (spo) => spo.seminar)
  seminarProgramOfferings: SeminarProgramOfferingEntity[];

  @BeforeInsert()
  beforeInsert() {
    this.name = this.name.toLowerCase().trim();
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.beforeInsert();
  }
}
