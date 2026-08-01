import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users', schema: 'master' })
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 255,
  })
  fullname: string;

  @Column({
    unique: true,
    length: 255,
  })
  email: string;

  @Column({
    name: 'phone_number',
    length: 20,
    nullable: true,
  })
  phoneNumber: string;

  @Column({
    name: 'is_email_verified',
    default: false,
  })
  isEmailVerified: boolean;

  @Column({
    name: 'is_phone_verified',
    default: false,
  })
  isPhoneVerified: boolean;

  @Column({
    name: 'password_hash',
    type: 'text',
    nullable: true,
  })
  @Exclude()
  passwordHash: string;

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
    name: 'last_login_at',
    nullable: true,
  })
  lastLoginAt: Date;

  @Column({
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt: Date;
}