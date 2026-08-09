import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'verification_documents', schema: 'master' })
export class VerificationDocument {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'document_type',
    length: 50,
  })
  documentType: string;

  @Column({
    name: 'document_number',
    length: 100,
    nullable: true,
  })
  documentNumber: string;

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
