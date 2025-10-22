import { Program } from '@database/interfaces/data';
import { BaseEntity } from './base';
import { Column, Entity } from 'typeorm';

@Entity('programs')
export class ProgramEntity extends BaseEntity implements Program {
  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'int' })
  cohort: number;

  @Column({ type: 'int' })
  semester: number;

  @Column({ type: 'varchar', length: 100 })
  city: string;
}
