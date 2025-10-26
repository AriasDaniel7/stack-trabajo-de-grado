import { Program } from '@database/interfaces/data';
import { BaseEntity } from './base';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { NormalizedUtil } from '@utils/normalized';
import { PensumEntity } from './pensum';
import { ProgramPlacementEntity } from './program-placement';

@Entity('programs')
export class ProgramEntity extends BaseEntity implements Program {
  @Column({ type: 'int', nullable: true })
  idProgramExternal?: number;

  @Column({ type: 'varchar', nullable: true })
  codeCDP?: string | undefined;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @OneToMany(() => PensumEntity, (p) => p.program)
  pensums: PensumEntity[];

  @OneToMany(() => ProgramPlacementEntity, (pp) => pp.program)
  placements: ProgramPlacementEntity[];

  @BeforeInsert()
  beforeInsert() {
    this.name = NormalizedUtil.normalizeNameWithoutTilde(this.name);
    if (this.codeCDP) {
      this.codeCDP = NormalizedUtil.normalizeNameWithoutTilde(this.codeCDP);
    }
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.beforeInsert();
  }
}
