import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  ValueTransformer,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

// int8: pg selalu mengembalikan ini sebagai string agar tidak kehilangan presisi,
// jadi dikonversi balik ke number di sisi aplikasi (sama seperti Attachment.referenceId).
const bigintTransformer: ValueTransformer = {
  to: (value?: number) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : parseInt(value, 10),
};

@Entity({ name: 'customer_profiles', schema: 'master' })
export class CustomerProfile {

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column({
    name: 'full_name',
    length: 200,
  })
  fullName: string;

  @Column({
    type: 'smallint',
    nullable: true,
  })
  gender: number;

  @Column({
    name: 'birth_date',
    type: 'date',
    nullable: true,
  })
  birthDate: string;

  @Column({
    name: 'avatar_url',
    type: 'text',
    nullable: true,
  })
  avatarUrl: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  address: string;

  @Column({
    length: 100,
    nullable: true,
  })
  city: string;

  @Column({
    length: 100,
    nullable: true,
  })
  province: string;

  @Column({
    default: true,
  })
  active: boolean;

  @Column({
    type: 'int',
    nullable: true,
  })
  status: number;

  @Column({
    name: 'created_by',
    length: 100,
    nullable: true,
  })
  createdBy: string;

  @Column({
    name: 'created_at',
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

  @Column({
    name: 'wedding_date',
    type: 'date',
    nullable: true,
  })
  weddingDate: string;

  @Column({
    name: 'event_type',
    length: 20,
    nullable: true,
  })
  eventType: string;

  @Column({
    name: 'wedding_province',
    length: 100,
    nullable: true,
  })
  weddingProvince: string;

  @Column({
    name: 'wedding_city',
    length: 100,
    nullable: true,
  })
  weddingCity: string;

  @Column({
    name: 'wedding_location',
    type: 'text',
    nullable: true,
  })
  weddingLocation: string;

  @Column({
    name: 'wedding_theme',
    type: 'text',
    nullable: true,
  })
  weddingTheme: string;

  @Column({
    name: 'estimated_guests',
    type: 'int',
    nullable: true,
  })
  estimatedGuests: number;

  @Column({
    name: 'preferred_vendor_location',
    length: 150,
    nullable: true,
  })
  preferredVendorLocation: string;

  @Column({
    name: 'package_preference',
    length: 20,
    nullable: true,
  })
  packagePreference: string;

  @Column({
    name: 'needed_vendor_categories',
    type: 'jsonb',
    nullable: true,
  })
  neededVendorCategories: string[] | null;

  @Column({
    name: 'estimated_budget',
    type: 'bigint',
    nullable: true,
    transformer: bigintTransformer,
  })
  estimatedBudget: number;

  @Column({
    name: 'budget_range_min',
    type: 'bigint',
    nullable: true,
    transformer: bigintTransformer,
  })
  budgetRangeMin: number;

  @Column({
    name: 'budget_range_max',
    type: 'bigint',
    nullable: true,
    transformer: bigintTransformer,
  })
  budgetRangeMax: number;

  @Column({
    name: 'budget_priorities',
    type: 'jsonb',
    nullable: true,
  })
  budgetPriorities: string[] | null;

}