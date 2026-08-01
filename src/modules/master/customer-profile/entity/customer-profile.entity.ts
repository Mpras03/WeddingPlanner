import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

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

}