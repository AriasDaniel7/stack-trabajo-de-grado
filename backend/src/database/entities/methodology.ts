import { Methodology } from '@database/interfaces/data';
import { BaseEntity } from './base';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { NormalizedUtil } from '@utils/normalized';
import { ProgramOfferingEntity } from './program-offering';
import { ProgramPlacementEntity } from './program-placement';

@Entity('methodologies')
export class MethodologyEntity extends BaseEntity implements Methodology {
  @ApiProperty({ type: String })
  @Column({ unique: true, type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => ProgramPlacementEntity, (pp) => pp.methodology)
  placements: ProgramPlacementEntity[];

  @BeforeInsert()
  beforeInsertActions() {
    this.name = NormalizedUtil.normalizeNameWithoutTilde(this.name);
  }

  @BeforeUpdate()
  beforeUpdateActions() {
    this.beforeInsertActions();
  }
}
