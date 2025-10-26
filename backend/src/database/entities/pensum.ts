import { Pensum } from '@database/interfaces/data';
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
import { NormalizedUtil } from '@utils/normalized';
import { ProgramEntity } from './program';

@Entity('pensums')
@Unique('UQ_PENSUM_PROGRAM', ['idProgram', 'id'])
@Unique('UQ_pensum_startYear', ['startYear', 'idProgram'])
export class PensumEntity extends BaseEntity implements Pensum {
  @Column({ type: 'int', nullable: true })
  idPensumExternal?: number | undefined;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'int' })
  startYear: number;

  @Column({ type: 'varchar', default: 'en oferta' })
  status: string;

  @Column({ type: 'int' })
  credits: number;

  @Column({ type: 'uuid', nullable: true })
  idProgram: string;

  @ManyToOne(() => ProgramEntity, (program) => program.pensums)
  @JoinColumn({ name: 'idProgram' })
  program: ProgramEntity;

  @BeforeInsert()
  beforeInsert() {
    this.name = NormalizedUtil.normalizeNameWithoutTilde(this.name);
    this.status = NormalizedUtil.normalizeNameWithoutTilde(this.status);
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.beforeInsert();
  }
}
