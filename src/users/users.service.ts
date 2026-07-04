import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
        order:{
            id:'ASC'
        }
    });
  }

  async findOne(id:number):Promise<User>{
    return await this.getUserOrThrow(id);
  }

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

  async update(id: number, dto: UpdateUserDto,): Promise<User> {
    const user = await this.getUserOrThrow(id);
    if (dto.username && dto.username !== user.username) {
        const existing = await this.findByUsername(dto.username);
        if (existing) {
            throw new ConflictException(
                'Username already exists',
            );
        }
    }
    Object.assign(user, dto);
    user.updatedAt = new Date();
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.getUserOrThrow(id);
    await this.userRepository.remove(user);
  }

  private async getUserOrThrow(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
        where: {
            id,
        },
    });

    if (!user) {
        throw new NotFoundException('User not found');
    }
    return user;
}

}