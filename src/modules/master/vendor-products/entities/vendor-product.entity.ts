import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  ValueTransformer,
} from 'typeorm';
import { VendorProfile } from '../../vendor-profile/entities/vendor-profile.entity';

// int8/bigserial & bigint: pg selalu mengembalikan ini sebagai string agar tidak kehilangan presisi,
// jadi dikonversi balik ke number di sisi aplikasi (sama seperti Attachment.referenceId).
const bigintTransformer: ValueTransformer = {
  to: (value?: number) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : parseInt(value, 10),
};

@Entity({ name: 'vendor_products', schema: 'master' })
export class VendorProduct {
  // int8/bigserial: pg selalu mengembalikan ini sebagai string agar tidak kehilangan presisi.
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @ManyToOne(() => VendorProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendor_id' })
  vendor: VendorProfile;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'bigint', transformer: bigintTransformer })
  price: number;

  @Column({
    name: 'minimum_dp',
    type: 'bigint',
    nullable: true,
    transformer: bigintTransformer,
  })
  minimumDp: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  duration: string | null;

  @Column({ name: 'guest_capacity', type: 'int', nullable: true })
  guestCapacity: number | null;

  @Column({ name: 'service_area', type: 'text', nullable: true })
  serviceArea: string | null;

  @Column({ type: 'text', nullable: true })
  terms: string | null;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

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
