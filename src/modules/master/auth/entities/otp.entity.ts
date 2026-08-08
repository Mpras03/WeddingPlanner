import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'otp', schema: 'master' })
export class Otp {

  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'user_id',
    type: 'bigint',
  })
  userId: number;

  @Column({
    name: 'otp_code',
    length: 100,
  })
  otpCode: string;

  @Column({
    length: 100,
  })
  purpose: string;

  @Column({
    name: 'attempt_count',
    default: 0,
  })
  attemptCount: number;

  @Column({
    name: 'resend_count',
    default: 0,
  })
  resendCount: number;

  @Column({
    name: 'is_used',
    default: false,
  })
  isUsed: boolean;

  @Column({
    name: 'expired_at',
  })
  expiredAt: Date;

  @Column({
    name: 'verified_at',
    nullable: true,
  })
  verifiedAt: Date;

  @Column({
    name: 'last_sent_at',
  })
  lastSentAt: Date;

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
}
