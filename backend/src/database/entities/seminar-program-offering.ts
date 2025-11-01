import { SeminarProgramOffering } from '@database/interfaces/data';
import { BaseEntity } from './base';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SeminarEntity } from './seminar';
import { ProgramOfferingEntity } from './program-offering';

@Entity('seminar_program_offerings')
export class SeminarProgramOfferingEntity
  extends BaseEntity
  implements SeminarProgramOffering
{
  @Column({ type: 'uuid' })
  idSeminar: string;

  @Column({ type: 'uuid' })
  idProgramOffering: string;

  @ManyToOne(() => SeminarEntity, (seminar) => seminar.seminarProgramOfferings)
  @JoinColumn({ name: 'idSeminar' })
  seminar: SeminarEntity;

  @ManyToOne(() => ProgramOfferingEntity, (po) => po.seminarProgramOfferings)
  @JoinColumn({ name: 'idProgramOffering' })
  programOffering: ProgramOfferingEntity;
}
