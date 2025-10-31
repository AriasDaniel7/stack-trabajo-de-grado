import { Fee } from '@database/interfaces/data';
import { BaseEntity } from './base';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { ModalityEntity } from './modality';
import { ProgramOfferingEntity } from './program-offering';

@Entity('rates')
export class FeeEntity extends BaseEntity implements Fee {
  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  factor_smmlv: number;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  credit_value_smmlv: number;

  @OneToOne(() => ModalityEntity, (modality) => modality.fee)
  @JoinColumn()
  modality: ModalityEntity;

  @OneToMany(() => ProgramOfferingEntity, (offering) => offering.fee)
  offerings: ProgramOfferingEntity[];
}
