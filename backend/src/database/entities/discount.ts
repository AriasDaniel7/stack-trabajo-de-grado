import { Discount } from '@database/interfaces/data';
import { BaseEntity } from './base';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProgramOfferingEntity } from './program-offering';

@Entity('discounts')
export class DiscountEntity extends BaseEntity implements Discount {
  @Column({ type: 'int' })
  percentage: number;

  @Column({ type: 'int' })
  numberOfApplicants: number;

  @Column({ type: 'uuid', nullable: true })
  idProgramOffering: string;

  @ManyToOne(() => ProgramOfferingEntity, (pp) => pp.discounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idProgramOffering' })
  programOffering: ProgramOfferingEntity;
}
