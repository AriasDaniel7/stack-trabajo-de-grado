import { Rol, User } from '@database/interfaces/data';
import { BaseEntity } from './base';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class UserEntity extends BaseEntity implements User {
  @ApiProperty({ type: String })
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', select: false })
  password?: string | undefined;

  @ApiProperty({ type: String })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({ type: Boolean, default: true })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ type: String, enum: Rol, default: Rol.USER })
  @Column({ type: 'enum', enum: Rol, default: Rol.USER })
  role: Rol;

  @BeforeInsert()
  beforeInsert() {
    if (this.email) {
      this.email = this.email.toLowerCase().trim();
    }
    if (this.name) {
      this.name = this.name.toLowerCase().trim();
    }
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.beforeInsert();
  }
}
