import { Methodology } from '@database/interfaces/data';
import { BaseEntity } from './base';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('methodologies')
export class MethodologyEntity extends BaseEntity implements Methodology {
  @ApiProperty({ type: String })
  @Column({ unique: true, type: 'varchar', length: 100 })
  name: string;

  @BeforeInsert()
  beforeInsertActions() {
    this.name = this.name.toLowerCase().trim();
  }

  @BeforeUpdate()
  beforeUpdateActions() {
    this.beforeInsertActions();
  }
}
