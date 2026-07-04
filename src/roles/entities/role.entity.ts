import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Roles')
export class Role {

  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'role_name'
  })
  roleName: string;

  @Column({
    nullable: true
  })
  description: string;

  @Column({
    nullable: true
  })
  active: boolean;

  @Column({
    name: 'created_by',
    nullable: true
  })
  createdBy: string;

  @Column({
    name: 'created_at',
    nullable: true
  })
  createdAt: Date;

  @Column({
    name: 'updated_by',
    nullable: true
  })
  updatedBy: string;

  @Column({
    name: 'updated_at',
    nullable: true
  })
  updatedAt: Date;
}