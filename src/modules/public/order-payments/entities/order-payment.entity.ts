import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  ValueTransformer,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { BankAccount } from '../../../master/bank-accounts/entities/bank-account.entity';

// int8/bigserial & bigint: pg selalu mengembalikan ini sebagai string agar tidak kehilangan presisi,
// jadi dikonversi balik ke number di sisi aplikasi (sama seperti Attachment.referenceId).
const bigintTransformer: ValueTransformer = {
  to: (value?: number) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : parseInt(value, 10),
};

@Entity({ name: 'order_payments', schema: 'public' })
export class OrderPayment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'varchar', length: 20 })
  installment: string;

  @Column({ type: 'bigint', transformer: bigintTransformer })
  amount: number;

  // Rekening tujuan disnapshot sebagai teks (bankName/accountNumber/accountHolderName) supaya
  // instruksi pembayaran historis tetap akurat walau vendor mengubah/menghapus rekeningnya nanti.
  // bank_account_id cuma referensi informatif — ON DELETE SET NULL, tidak pernah menghapus riwayat pembayaran.
  @ManyToOne(() => BankAccount, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount | null;

  @Column({ name: 'bank_name', type: 'varchar', length: 100 })
  bankName: string;

  @Column({ name: 'account_number', type: 'varchar', length: 50 })
  accountNumber: string;

  @Column({ name: 'account_holder_name', type: 'varchar', length: 100 })
  accountHolderName: string;

  @Column({ type: 'varchar', length: 50, default: 'WAITING_PAYMENT' })
  status: string;

  @Column({ name: 'reject_reason', type: 'text', nullable: true })
  rejectReason: string | null;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @Column({
    name: 'verified_by',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  verifiedBy: string | null;

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
