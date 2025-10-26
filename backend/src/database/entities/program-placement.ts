import { ProgramPlacement } from '@database/interfaces/data';
import { BaseEntity } from './base';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { ProgramEntity } from './program';
import { MethodologyEntity } from './methodology';
import { FacultyEntity } from './faculty';
import { ModalityEntity } from './modality';
import { ProgramOfferingEntity } from './program-offering';
import { NormalizedUtil } from '@utils/normalized';

@Entity('program_placements')
@Unique('UQ_PROGRAM', ['id', 'idProgram'])
export class ProgramPlacementEntity
  extends BaseEntity
  implements ProgramPlacement
{
  @Column({ type: 'uuid', nullable: true })
  idProgram: string;

  @Column({ type: 'uuid', nullable: true })
  idMethodology: string;

  @Column({ type: 'uuid', nullable: true })
  idFaculty: string;

  @Column({ type: 'uuid', nullable: true })
  idModality: string;

  @Index()
  @Column({ type: 'varchar' })
  unity: string;

  @Index()
  @Column({ type: 'varchar' })
  workday: string;

  @ManyToOne(() => ProgramEntity, (p) => p.placements)
  @JoinColumn({ name: 'idProgram' })
  program: ProgramEntity;

  @ManyToOne(() => MethodologyEntity, (m) => m.placements)
  @JoinColumn({ name: 'idMethodology' })
  methodology: MethodologyEntity;

  @ManyToOne(() => FacultyEntity, (f) => f.placements)
  @JoinColumn({ name: 'idFaculty' })
  faculty: FacultyEntity;

  @ManyToOne(() => ModalityEntity, (md) => md.placements)
  @JoinColumn({ name: 'idModality' })
  modality: ModalityEntity;

  @OneToMany(() => ProgramOfferingEntity, (po) => po.programPlacement)
  offerings: ProgramOfferingEntity[];

  @BeforeInsert()
  beforeInsert() {
    this.unity = NormalizedUtil.normalizeNameWithoutTilde(this.unity);
    this.workday = NormalizedUtil.normalizeNameWithoutTilde(this.workday);
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.beforeInsert();
  }
}
