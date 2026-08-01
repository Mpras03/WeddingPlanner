import {Column, Entity, PrimaryGeneratedColumn,} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('Users')
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
  unique: true,
  })
  username: string;

  @Column({
    name: 'password_hash',
  })
  @Exclude()
  passwordHash: string;

  @Column()
  name: string;

  @Column({
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
  })
  updatedAt: Date;
}