import { Fee } from '@database/interfaces/data';
import { BaseEntity } from './base';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { ModalityEntity } from './modality';

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
}
