import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

import { BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
  return await this.userRepository.findOne({
    where: {
      username,
    },
  });
  }

  async create(dto: CreateUserDto): Promise<User> {

  const existingUser = await this.findByUsername(dto.username);

  if (existingUser) {
    throw new BadRequestException('Username already exists');
  }

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const user = this.userRepository.create({
    username: dto.username,
    name: dto.name,
    passwordHash: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return await this.userRepository.save(user);
}

}