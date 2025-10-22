import { Modality } from '@database/interfaces/data';
import { BaseEntity } from './base';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToOne } from 'typeorm';
import { FeeEntity } from './rates';

@Entity('modalities')
export class ModalityEntity extends BaseEntity implements Modality {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @BeforeInsert()
  beforeInsert() {
    this.name = this.name.trim().toLowerCase();
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.beforeInsert();
  }

  @OneToOne(() => FeeEntity, (fee) => fee.modality)
  fee: FeeEntity;
}
