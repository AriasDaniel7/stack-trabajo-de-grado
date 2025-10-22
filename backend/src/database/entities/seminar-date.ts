import { BaseEntity } from './base';
import { Column, Entity, ManyToOne } from 'typeorm';
import { SeminarEntity } from './seminar';
import { SeminarDate } from '@database/interfaces/data';

@Entity('seminar_dates')
export class SeminarDateEntity extends BaseEntity implements SeminarDate {
  @Column({ type: 'timestamptz' })
  date: Date;

  @ManyToOne(() => SeminarEntity, (seminar) => seminar.dates)
  seminar: SeminarEntity;
}
