import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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