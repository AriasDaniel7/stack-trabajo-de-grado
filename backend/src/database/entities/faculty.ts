import { Faculty } from '@database/interfaces/data';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { BaseEntity } from './base';

@Entity('faculties')
export class FacultyEntity extends BaseEntity implements Faculty {
  @Column({ type: 'varchar', length: 150, unique: true })
  name: string;

  @BeforeInsert()
  beforeInsert() {
    this.name = this.name.trim().toLowerCase();
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.beforeInsert();
  }
}
