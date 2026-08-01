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

    const [data, total] = await this.userRepository.findAndCount({
      where: filter
        ? [
            { fullname: ILike(`%${filter}%`) },
            { email: ILike(`%${filter}%`) },
          ]
        : {},
      order: {
        id: 'ASC',
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    return {
      data,
      total,
      pageNumber,
      pageSize,
    };
  }

  async findOne(id: number): Promise<User> {
    return await this.getUserOrThrow(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async create(dto: CreateUserDto): Promise<User> {

    const normalizedEmail = dto.email.toLowerCase();
    const existingUser = await this.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const encryptedPassword = this.cryptographyService.encrypt(dto.password);

    const user = this.userRepository.create({
      fullname: dto.fullname,
      email: normalizedEmail,
      phoneNumber: dto.phoneNumber,
      passwordHash: encryptedPassword,
      active: dto.active ?? true,
      createdAt: new Date(),
    });

    return await this.userRepository.save(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {

    const user = await this.getUserOrThrow(id);
    const normalizedEmail = dto.email ? dto.email.toLowerCase() : undefined;

    if (normalizedEmail && normalizedEmail !== user.email) {
      const existing = await this.findByEmail(normalizedEmail);
      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }

    const { password, email, ...rest } = dto;
    Object.assign(user, rest);

    if (normalizedEmail) {
      user.email = normalizedEmail;
    }

    if (password) {
      user.passwordHash = this.cryptographyService.encrypt(password);
    }

    user.modifiedAt = new Date();

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