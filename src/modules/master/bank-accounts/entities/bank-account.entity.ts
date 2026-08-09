import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'bank_accounts', schema: 'master' })
export class BankAccount {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'bank_name',
    length: 100,
  })
  bankName: string;

  @Column({
    name: 'account_number',
    length: 50,
  })
  accountNumber: string;

  @Column({
    name: 'account_holder_name',
    length: 100,
  })
  accountHolderName: string;

  @Column({
    name: 'is_primary',
    default: true,
  })
  isPrimary: boolean;

  @Column({
    default: true,
  })
  active: boolean;

  @Column({
    name: 'created_by',
    length: 100,
    nullable: true,
  })
  createdBy: string;

  @Column({
    name: 'created_at',
    nullable: true,
  })
  createdAt: Date;

  @Column({
    name: 'modified_by',
    length: 100,
    nullable: true,
  })
  modifiedBy: string;

  @Column({
    name: 'modified_at',
    nullable: true,
  })
  modifiedAt: Date;
}
