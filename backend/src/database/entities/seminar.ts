import { PaymentType, Seminar } from '@database/interfaces/data';
import { BaseEntity } from './base';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { SeminarDateEntity } from './seminar-date';
import { SeminarDocentEntity } from './seminar-docent';
import { SeminarProgramOfferingEntity } from './seminar-program-offering';

@Entity('seminaries')
export class SeminarEntity extends BaseEntity implements Seminar {
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
    nullable: true,
  })
  airTransportValue?: number;

  @Column({ type: 'varchar', nullable: true })
  airTransportRoute?: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
    nullable: true,
  })
  landTransportValue?: number;

  @Column({ type: 'varchar', nullable: true })
  landTransportRoute?: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
    nullable: true,
  })
  foodAndLodgingAid?: number;

  @Column({ type: 'int', nullable: true })
  eventStayDays?: number;

  @Column({ type: 'varchar', nullable: true })
  hotelLocation?: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'int' })
  credits: number;

  @Column({ type: 'varchar', enum: PaymentType })
  payment_type: PaymentType;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => SeminarDateEntity, (seminarDate) => seminarDate.seminar)
  dates: SeminarDateEntity[];

  @OneToOne(() => SeminarDocentEntity, (seminarDocent) => seminarDocent.seminar)
  seminarDocent: SeminarDocentEntity;

  @OneToMany(() => SeminarProgramOfferingEntity, (spo) => spo.seminar)
  seminarProgramOfferings: SeminarProgramOfferingEntity[];

  @BeforeInsert()
  beforeInsert() {
    this.name = this.name.toLowerCase().trim();
    if (this.airTransportRoute) {
      this.airTransportRoute = this.airTransportRoute?.toLowerCase().trim();
    }
    if (this.landTransportRoute) {
      this.landTransportRoute = this.landTransportRoute?.toLowerCase().trim();
    }
    if (this.hotelLocation) {
      this.hotelLocation = this.hotelLocation?.toLowerCase().trim();
    }
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.beforeInsert();
  }
}
