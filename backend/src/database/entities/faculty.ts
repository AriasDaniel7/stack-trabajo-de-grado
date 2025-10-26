import { Faculty } from '@database/interfaces/data';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base';
import { NormalizedUtil } from '@utils/normalized';
import { ProgramPlacementEntity } from './program-placement';

@Entity('faculties')
export class FacultyEntity extends BaseEntity implements Faculty {
  @Column({ type: 'varchar', length: 150, unique: true })
  name: string;

  @OneToMany(() => ProgramPlacementEntity, (pp) => pp.faculty)
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
