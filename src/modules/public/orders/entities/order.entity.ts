import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  ValueTransformer,
} from 'typeorm';
import { CustomerProfile } from '../../../master/customer-profile/entities/customer-profile.entity';
import { VendorProfile } from '../../../master/vendor-profile/entities/vendor-profile.entity';
import { VendorProduct } from '../../../master/vendor-products/entities/vendor-product.entity';

// int8/bigserial & bigint: pg selalu mengembalikan ini sebagai string agar tidak kehilangan presisi,
// jadi dikonversi balik ke number di sisi aplikasi (sama seperti Attachment.referenceId).
const bigintTransformer: ValueTransformer = {
  to: (value?: number) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : parseInt(value, 10),
};

// Data transaksi (bukan master data) sengaja ditaruh di schema public, terpisah dari
// tabel-tabel master (users, vendor_profiles, dst).
@Entity({ name: 'orders', schema: 'public' })
export class Order {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'order_number', type: 'varchar', length: 50, unique: true })
  orderNumber: string;

  @ManyToOne(() => CustomerProfile)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerProfile;

  @ManyToOne(() => VendorProfile)
  @JoinColumn({ name: 'vendor_id' })
  vendor: VendorProfile;

  @ManyToOne(() => VendorProduct)
  @JoinColumn({ name: 'vendor_product_id' })
  vendorProduct: VendorProduct;

  // Snapshot data produk pada saat order dibuat — harga & data produk dikunci di sini
  // supaya perubahan/penghapusan vendor_products di kemudian hari tidak mengubah riwayat order.
  @Column({ name: 'product_name', type: 'varchar', length: 200 })
  productName: string;

  @Column({
    name: 'product_price',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  productPrice: number;

  @Column({
    name: 'product_minimum_dp',
    type: 'bigint',
    nullable: true,
    transformer: bigintTransformer,
  })
  productMinimumDp: number | null;

  @Column({ name: 'event_date', type: 'date' })
  eventDate: string;

  @Column({ name: 'event_location', type: 'text' })
  eventLocation: string;

  @Column({ name: 'guest_count', type: 'int', nullable: true })
  guestCount: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'payment_type', type: 'varchar', length: 20 })
  paymentType: string;

  @Column({
    name: 'total_amount',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  totalAmount: number;

  @Column({ type: 'varchar', length: 50, default: 'PENDING_PAYMENT' })
  status: string;

  @Column({ name: 'reject_reason', type: 'text', nullable: true })
  rejectReason: string | null;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

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
