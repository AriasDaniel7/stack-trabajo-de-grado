import { Base } from '@database/interfaces/data';
import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity as BaseEntityTp,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity extends BaseEntityTp implements Base {
  @ApiProperty({ type: String, format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: Date, format: 'date-time' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ type: Date, format: 'date-time' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty({
    type: Date,
    format: 'date-time',
    required: false,
    nullable: true,
    default: null,
  })
  @DeleteDateColumn({ type: 'timestamptz', select: false })
  deletedAt?: Date | undefined;
}
