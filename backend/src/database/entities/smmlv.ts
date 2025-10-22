import { Smmlv } from '@database/interfaces/data';
import { BaseEntity } from './base';
import { Column, Entity } from 'typeorm';

@Entity('smmlvs')
export class SmmlvEntity extends BaseEntity implements Smmlv {
  @Column({ type: 'int', unique: true })
  year: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  value: number;
}
