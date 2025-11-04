import { SeminarDocent, VinculationType } from '@database/interfaces/data';
import { BaseEntity } from './base';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { SeminarEntity } from './seminar';
import { DocentSeminarEntity } from './docent-seminar';

@Entity('seminar_docents')
export class SeminarDocentEntity extends BaseEntity implements SeminarDocent {
  @Column({ type: 'varchar', enum: VinculationType })
  vinculation: VinculationType;

  @OneToOne(() => SeminarEntity, (seminar) => seminar.seminarDocent)
  @JoinColumn()
  seminar: SeminarEntity;

  @ManyToOne(() => DocentSeminarEntity, (docent) => docent.seminarDocent)
  docent: DocentSeminarEntity;
}
