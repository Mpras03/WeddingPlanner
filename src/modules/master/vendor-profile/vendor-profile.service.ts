import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { VendorProfile } from './entities/vendor-profile.entity';
import { User } from '../users/entities/user.entity';
import { CreateVendorProfileDto } from './dto/create-vendor-profile.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
import { FindAllVendorProfileDto } from './dto/find-all-vendor-profile.dto';

@Injectable()
export class VendorProfileService {

  constructor(
    @InjectRepository(VendorProfile)
    private readonly vendorProfileRepository: Repository<VendorProfile>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //=========================== GET ALL VENDOR PROFILE (PAGINATION) ======================================
  async findAll(query: FindAllVendorProfileDto) {

    const { filter, pageNumber = 1, pageSize = 10 } = query;

    const [data, total] = await this.vendorProfileRepository.findAndCount({
      where: filter
        ? [
            { businessName: ILike(`%${filter}%`) },
            { ownerName: ILike(`%${filter}%`) },
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

  //=========================== GET VENDOR PROFILE BY ID ======================================
  async findOne(id: number): Promise<VendorProfile> {
    return await this.getProfileOrThrow(id);
  }
  //========================================================================================

  //=========================== CREATE VENDOR PROFILE ======================================
  async create(dto: CreateVendorProfileDto): Promise<VendorProfile> {

    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.vendorProfileRepository.findOne({
      where: { user: { id: dto.userId } },
    });
    if (existing) {
      throw new ConflictException('User already has a vendor profile');
    }

    const profile = this.vendorProfileRepository.create({
      user,
      businessName: dto.businessName,
      ownerName: dto.ownerName,
      businessEmail: dto.businessEmail,
      businessPhone: dto.businessPhone,
      businessAddress: dto.businessAddress,
      city: dto.city,
      province: dto.province,
      latitude: dto.latitude,
      longitude: dto.longitude,
      description: dto.description,
      serviceArea: dto.serviceArea,
      logoUrl: dto.logoUrl,
      status: dto.status,
      isVerified: dto.isVerified ?? false,
      active: dto.active ?? true,
      createdAt: new Date(),
    });

    return await this.vendorProfileRepository.save(profile);
  }
  //========================================================================================

  //=========================== UPDATE VENDOR PROFILE ======================================
  async update(id: number, dto: UpdateVendorProfileDto): Promise<VendorProfile> {

    const profile = await this.getProfileOrThrow(id);

    Object.assign(profile, dto);
    profile.updatedAt = new Date();

    return await this.vendorProfileRepository.save(profile);
  }
  //========================================================================================

  //=========================== DELETE VENDOR PROFILE ======================================
  async remove(id: number): Promise<void> {
    const profile = await this.getProfileOrThrow(id);
    await this.vendorProfileRepository.remove(profile);
  }
  //========================================================================================

  private async getProfileOrThrow(id: number): Promise<VendorProfile> {

    const profile = await this.vendorProfileRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!profile) {
      throw new NotFoundException('Vendor profile not found');
    }

    return profile;
  }

}