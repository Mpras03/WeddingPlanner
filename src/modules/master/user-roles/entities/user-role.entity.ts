import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity({ name: 'user_roles', schema: 'master' })
export class UserRole {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @ManyToOne(() => Role)
  @JoinColumn({
    name: 'role_id',
  })
  role: Role;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    name: 'created_by',
    length: 100,
    nullable: true,
  })
  createdBy?: string;

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
  updatedBy?: string;

  @Column({
    name: 'updated_at',
    nullable: true,
  })
  updatedAt?: Date;

  @Column({
    name: 'is_primary',
    default: false,
  })
  isPrimary: boolean;

}