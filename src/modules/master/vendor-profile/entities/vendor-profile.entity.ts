import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'vendor_profiles', schema: 'master' })
export class VendorProfile {

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column({
    name: 'business_name',
    length: 100,
    nullable: true,
  })
  businessName: string;

  @Column({
    name: 'owner_name',
    length: 100,
    nullable: true,
  })
  ownerName: string;

  @Column({
    name: 'business_email',
    length: 100,
    nullable: true,
  })
  businessEmail: string;

  @Column({
    name: 'business_phone',
    length: 100,
    nullable: true,
  })
  businessPhone: string;

  @Column({
    name: 'business_address',
    type: 'text',
    nullable: true,
  })
  businessAddress: string;

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
    type: 'numeric',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  latitude: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  longitude: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    name: 'service_area',
    type: 'text',
    nullable: true,
  })
  serviceArea: string;

  @Column({
    name: 'logo_url',
    type: 'text',
    nullable: true,
  })
  logoUrl: string;

  @Column({
    type: 'int',
    nullable: true,
  })
  status: number;

  @Column({
    name: 'reject_reason',
    type: 'text',
    nullable: true,
  })
  rejectReason: string;

  @Column({
    name: 'is_verified',
    default: false,
  })
  isVerified: boolean;

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
    name: 'updated_by',
    length: 100,
    nullable: true,
  })
  updatedBy: string;

  @Column({
    name: 'updated_at',
    nullable: true,
  })
  updatedAt: Date;

}