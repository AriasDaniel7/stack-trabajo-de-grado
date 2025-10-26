import { Modality } from '@database/interfaces/data';
import { BaseEntity } from './base';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { FeeEntity } from './rates';
import { NormalizedUtil } from '@utils/normalized';
import { ProgramEntity } from './program';
import { ProgramPlacementEntity } from './program-placement';

@Entity('modalities')
export class ModalityEntity extends BaseEntity implements Modality {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @OneToOne(() => FeeEntity, (fee) => fee.modality)
  fee: FeeEntity;

  @OneToMany(() => ProgramPlacementEntity, (pp) => pp.modality)
  placements: ProgramPlacementEntity[];

  @BeforeInsert()
  beforeInsert() {
    this.name = NormalizedUtil.normalizeNameWithoutTilde(this.name);
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.beforeInsert();
  }
}
