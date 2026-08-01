import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('User_Roles')
export class UserRole {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column({
    name: 'user_name',
  })
  userName: string;

  @ManyToOne(() => Role)
  @JoinColumn({
    name: 'role_id',
  })
  role: Role;

  @Column({
    name: 'role_name',
  })
  roleName: string;

  @Column({
    nullable: true,
  })
  description?: string;

  @Column({
    name: 'created_by',
    nullable: true,
  })
  createdBy?: string;

  @Column({
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    name: 'updated_by',
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
  })
  isPrimary: boolean;

}