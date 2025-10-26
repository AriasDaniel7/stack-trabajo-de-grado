import { ProgramOffering } from '@database/interfaces/data';
import { BaseEntity } from './base';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { SmmlvEntity } from './smmlv';
import { PensumEntity } from './pensum';
import { ProgramPlacementEntity } from './program-placement';

@Entity('program_offerings')
@Unique('UQ_PROGRAM_COHORT_SEMESTER_PENSUM', [
  'idProgramPlacement',
  'idProgram',
  'cohort',
  'semester',
  'idPensum',
])
export class ProgramOfferingEntity
  extends BaseEntity
  implements ProgramOffering
{
  @Column({ type: 'uuid', nullable: true })
  idProgramPlacement: string;

  @Column({ type: 'uuid', nullable: true })
  idPensum: string;

  @Column({ type: 'uuid', nullable: true })
  idSmmlv: string;

  @Column({ type: 'uuid', nullable: true })
  idProgram: string;

  @Column({ type: 'int' })
  cohort: number;

  @Column({ type: 'int' })
  semester: number;

  @ManyToOne(() => SmmlvEntity, (smmlv) => smmlv.offerings)
  @JoinColumn({ name: 'idSmmlv' })
  smmlv: SmmlvEntity;

  @ManyToOne(() => ProgramPlacementEntity, (pp) => pp.offerings)
  @JoinColumn([
    {
      name: 'idProgramPlacement',
      referencedColumnName: 'id',
    },
    {
      name: 'idProgram',
      referencedColumnName: 'idProgram',
    },
  ])
  programPlacement: ProgramPlacementEntity;

  @ManyToOne(() => PensumEntity)
  @JoinColumn([
    { name: 'idPensum', referencedColumnName: 'id' },
    {
      name: 'idProgram',
      referencedColumnName: 'idProgram',
    },
  ])
  pensum: PensumEntity;
}
