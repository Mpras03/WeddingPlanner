import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ValueTransformer,
} from 'typeorm';

const bigintTransformer: ValueTransformer = {
  to: (value?: number) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : parseInt(value, 10),
};

@Entity({ name: 'attachments', schema: 'master' })
export class Attachment {
  // int8/bigserial: pg always returns this as a string to avoid precision loss, so keep it string end-to-end.
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'reference_table', type: 'varchar', length: 50 })
  referenceTable: string;

  @Column({
    name: 'reference_id',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  referenceId: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string | null;

  @Column({ name: 'original_name', type: 'varchar', length: 255 })
  originalName: string;

  @Column({ name: 'stored_name', type: 'varchar', length: 255 })
  storedName: string;

  @Column({ name: 'storage_path', type: 'varchar', length: 500 })
  storagePath: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ name: 'size_bytes', type: 'int' })
  sizeBytes: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy: string | null;

  @Column({ name: 'modified_at', type: 'timestamp', nullable: true })
  modifiedAt: Date | null;

  @Column({
    name: 'modified_by',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  modifiedBy: string | null;
}
