import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { CryptographyService } from '../cryptography/cryptography.service';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cryptographyService: CryptographyService,
  ) {}

  async findAll(query: FindAllUsersDto) {
    const { filter, pageNumber = 1, pageSize = 10 } = query;

    const [data, totalItems] = await this.userRepository.findAndCount({
      where: filter
        ? [
            { username: ILike(`%${filter}%`) },
            { name: ILike(`%${filter}%`) },
          ]
        : {},
      order: {
        id: 'ASC',
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    return {
      items: data,
      meta: {
        totalItems,
        totalPages,
        pageNumber,
        pageSize,
      },
    };
  }

  async findOne(id:number):Promise<User>{
    return await this.getUserOrThrow(id);
  }

  async findByUsername(username: string): Promise<User | null> {
  return await this.userRepository.findOne({
    where: {
      username: username.toLowerCase(),
    },
  });
  }

  async create(dto: CreateUserDto): Promise<User> {
  const normalizedUsername = dto.username.toLowerCase();
  const existingUser = await this.findByUsername(normalizedUsername);
  if (existingUser) {
    throw new BadRequestException('Username already exists');
  }
  const encryptedPassword = this.cryptographyService.encrypt(dto.password);
  const user = this.userRepository.create({
    username: normalizedUsername,
    name: dto.name,
    passwordHash: encryptedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return await this.userRepository.save(user);
  }

  async update(id: number, dto: UpdateUserDto,): Promise<User> {
    const user = await this.getUserOrThrow(id);
    const normalizedUsername = dto.username ? dto.username.toLowerCase() : undefined;

    if (normalizedUsername && normalizedUsername !== user.username) {
        const existing = await this.findByUsername(normalizedUsername);
        if (existing) {
            throw new ConflictException(
                'Username already exists',
            );
        }
    }

    const { password, username, ...rest } = dto as UpdateUserDto & { password?: string };
    Object.assign(user, rest);

    if (normalizedUsername) {
        user.username = normalizedUsername;
    }

    if (password) {
        user.passwordHash = this.cryptographyService.encrypt(password);
    }

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