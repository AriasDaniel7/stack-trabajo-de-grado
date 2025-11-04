import { ProgramOffering } from '@database/interfaces/data';
import { BaseEntity } from './base';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { SmmlvEntity } from './smmlv';
import { PensumEntity } from './pensum';
import { ProgramPlacementEntity } from './program-placement';
import { FeeEntity } from './rates';
import { DiscountEntity } from './discount';
import { SeminarProgramOfferingEntity } from './seminar-program-offering';
import { DocentSeminarEntity } from './docent-seminar';

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
  idDocent: string;

  @Column({ type: 'uuid', nullable: true })
  idFee: string;

  @Column({ type: 'uuid', nullable: true })
  idProgram: string;

  @Column({ type: 'int' })
  cohort: number;

  @Column({ type: 'int' })
  semester: number;

  @Column({ type: 'varchar', nullable: true })
  codeCDP?: string | undefined;

  @ManyToOne(() => SmmlvEntity, (smmlv) => smmlv.offerings)
  @JoinColumn({ name: 'idSmmlv' })
  smmlv: SmmlvEntity;

  @ManyToOne(() => DocentSeminarEntity, (ds) => ds.offerings)
  @JoinColumn({ name: 'idDocent' })
  docentSeminar: DocentSeminarEntity;

  @ManyToOne(() => ProgramPlacementEntity, (pp) => pp.offerings, {
    onDelete: 'CASCADE',
  })
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

  @ManyToOne(() => FeeEntity, (fee) => fee.offerings)
  @JoinColumn({ name: 'idFee' })
  fee: FeeEntity;

  @OneToMany(() => DiscountEntity, (discount) => discount.programOffering)
  discounts: DiscountEntity[];

  @OneToMany(() => SeminarProgramOfferingEntity, (spo) => spo.programOffering)
  seminarProgramOfferings: SeminarProgramOfferingEntity[];

  @BeforeInsert()
  beforeInsert() {
    if (this.codeCDP) {
      this.codeCDP = this.codeCDP.trim();
    }
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.beforeInsert();
  }
}
