import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { CustomerProfile } from '../../../master/customer-profile/entities/customer-profile.entity';
import { VendorProfile } from '../../../master/vendor-profile/entities/vendor-profile.entity';
import { VendorProduct } from '../../../master/vendor-products/entities/vendor-product.entity';

// Data transaksi (bukan master data) sengaja ditaruh di schema public, sama seperti orders/order_payments.
@Entity({ name: 'vendor_product_reviews', schema: 'public' })
export class VendorProductReview {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  // Satu order cuma boleh diulas sekali (order_id UNIQUE di database) — pola "verified purchase",
  // ulasan cuma bisa dibuat dari order milik sendiri yang sudah COMPLETED.
  @OneToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // customer/vendor/vendorProduct disnapshot dari order saat ulasan dibuat (bukan diambil ulang
  // dari body request) supaya query "semua ulasan produk ini" / "semua ulasan vendor ini" tidak
  // perlu join lewat orders setiap saat — sama seperti alasan denormalisasi orders.vendor_id.
  @ManyToOne(() => CustomerProfile)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerProfile;

  @ManyToOne(() => VendorProfile)
  @JoinColumn({ name: 'vendor_id' })
  vendor: VendorProfile;

  @ManyToOne(() => VendorProduct)
  @JoinColumn({ name: 'vendor_product_id' })
  vendorProduct: VendorProduct;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

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
