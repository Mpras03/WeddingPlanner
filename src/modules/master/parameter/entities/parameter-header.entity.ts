import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ParameterDetail } from './parameter-detail.entity';

@Entity({ name: 'parameter_header', schema: 'master' })
export class ParameterHeader {
  // int8/bigserial: pg always returns this as a string to avoid precision loss, so keep it string end-to-end.
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  code: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ name: 'created_by', type: 'varchar', length: 200, nullable: true })
  createdBy: string | null;

  @Column({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @Column({ name: 'modified_by', type: 'varchar', length: 200, nullable: true })
  modifiedBy: string | null;

  @Column({ name: 'modified_at', type: 'timestamp', nullable: true })
  modifiedAt: Date | null;

  @OneToMany(() => ParameterDetail, (detail) => detail.header, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  details: ParameterDetail[];
}
