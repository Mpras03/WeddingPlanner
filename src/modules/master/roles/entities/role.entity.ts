import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'roles', schema: 'master' })
export class Role {

  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'role_name',
    length: 100,
  })
  roleName: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    default: false,
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