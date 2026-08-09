import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'contacts', schema: 'master' })
export class Contact {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'contact_type',
    length: 50,
  })
  contactType: string;

  @Column({
    name: 'contact_value',
    length: 255,
  })
  contactValue: string;

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
