import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CustomerProfile } from './entities/customer-profile.entity';
import { User } from '../users/entities/user.entity';
import { CreateCustomerProfileDto } from './dto/create-customer-profile.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { FindAllCustomerProfileDto } from './dto/find-all-customer-profile.dto';

@Injectable()
export class CustomerProfileService {

  constructor(
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //=========================== GET ALL CUSTOMER PROFILE (PAGINATION) ======================================
  async findAll(query: FindAllCustomerProfileDto) {

    const { filter, pageNumber = 1, pageSize = 10 } = query;

    const [data, total] = await this.customerProfileRepository.findAndCount({
      where: filter
        ? [
            { fullName: ILike(`%${filter}%`) },
            { city: ILike(`%${filter}%`) },
            { province: ILike(`%${filter}%`) },
          ]
        : {},
      relations: {
        user: true,
      },
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
  //========================================================================================

  //=========================== GET CUSTOMER PROFILE BY ID ======================================
  async findOne(id: number): Promise<CustomerProfile> {
    return await this.getProfileOrThrow(id);
  }
  //========================================================================================

  //=========================== GET CUSTOMER PROFILE BY USER ID ======================================
  async findByUserId(userId: number): Promise<CustomerProfile> {

    const profile = await this.customerProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });

    if (!profile) {
      throw new NotFoundException('Customer profile not found for this user');
    }

    return profile;
  }
  //========================================================================================

  //=========================== CREATE CUSTOMER PROFILE ======================================
  async create(dto: CreateCustomerProfileDto): Promise<CustomerProfile> {

    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.customerProfileRepository.findOne({
      where: { user: { id: dto.userId } },
    });
    if (existing) {
      throw new ConflictException('User already has a customer profile');
    }

    const profile = this.customerProfileRepository.create({
      user,
      fullName: dto.fullName,
      gender: dto.gender,
      birthDate: dto.birthDate,
      avatarUrl: dto.avatarUrl,
      address: dto.address,
      city: dto.city,
      province: dto.province,
      active: dto.active ?? true,
      status: dto.status,
      createdAt: new Date(),
    });

    return await this.customerProfileRepository.save(profile);
  }
  //========================================================================================

  //=========================== UPDATE CUSTOMER PROFILE ======================================
  async update(id: number, dto: UpdateCustomerProfileDto): Promise<CustomerProfile> {

    const profile = await this.getProfileOrThrow(id);

    Object.assign(profile, dto);
    profile.modifiedAt = new Date();

    return await this.customerProfileRepository.save(profile);
  }
  //========================================================================================

  //=========================== DELETE CUSTOMER PROFILE ======================================
  async remove(id: number): Promise<void> {
    const profile = await this.getProfileOrThrow(id);
    await this.customerProfileRepository.remove(profile);
  }
  //========================================================================================

  private async getProfileOrThrow(id: number): Promise<CustomerProfile> {

    const profile = await this.customerProfileRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!profile) {
      throw new NotFoundException('Customer profile not found');
    }

    return profile;
  }

}