import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { CustomerProfile } from '../customer-profile/entities/customer-profile.entity';
import { VendorProfile } from '../vendor-profile/entities/vendor-profile.entity';
import { CryptographyService } from '../cryptography/cryptography.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { RegisterVendorDto } from './dto/register-vendor.dto';

const ROLE_ID_CUSTOMER = 2;
const ROLE_ID_VENDOR = 3;

// minimal 8 karakter, minimal 1 huruf besar, minimal 1 angka, minimal 1 simbol
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

@Injectable()
export class RegisterService {

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly cryptographyService: CryptographyService,
  ) {}

  //=========================== REGISTER CUSTOMER ======================================
  async registerCustomer(dto: RegisterCustomerDto) {

    const plainPassword = this.decryptPassword(dto.password);
    const plainConfirmPassword = this.decryptPassword(dto.confirmPassword);

    this.validatePasswordMatch(plainPassword, plainConfirmPassword);
    this.validatePasswordStrength(plainPassword);

    return await this.dataSource.transaction(async (manager) => {

      await this.ensureEmailAndPhoneAvailable(manager, dto.email, dto.phoneNumber);

      // 1. buat user
      const userRepo = manager.getRepository(User);
      const user = userRepo.create({
        fullname: dto.fullname,
        email: dto.email.toLowerCase(),
        phoneNumber: dto.phoneNumber,
        passwordHash: dto.password, // cipherText asli, tidak perlu di-encrypt ulang
        active: true,
        createdAt: new Date(),
      });
      const savedUser = await userRepo.save(user);

      // 2. assign role Customer sebagai primary
      const role = await manager.getRepository(Role).findOne({
        where: { id: ROLE_ID_CUSTOMER },
      });
      if (!role) {
        throw new BadRequestException('Role Customer tidak ditemukan');
      }

      const userRole = manager.getRepository(UserRole).create({
        user: savedUser,
        role,
        isPrimary: true,
        createdAt: new Date(),
      });
      await manager.getRepository(UserRole).save(userRole);

      // 3. buat customer profile
      const profile = manager.getRepository(CustomerProfile).create({
        user: savedUser,
        fullName: dto.fullname,
        createdAt: new Date(),
      });
      const savedProfile = await manager.getRepository(CustomerProfile).save(profile);

      return {
        user: {
          id: savedUser.id,
          fullname: savedUser.fullname,
          email: savedUser.email,
        },
        profile: savedProfile,
      };
    });
  }
  //========================================================================================

  //=========================== REGISTER VENDOR ======================================
  async registerVendor(dto: RegisterVendorDto) {

    const plainPassword = this.decryptPassword(dto.password);
    const plainConfirmPassword = this.decryptPassword(dto.confirmPassword);

    this.validatePasswordMatch(plainPassword, plainConfirmPassword);
    this.validatePasswordStrength(plainPassword);

    return await this.dataSource.transaction(async (manager) => {

      await this.ensureEmailAndPhoneAvailable(manager, dto.email, dto.businessPhone);

      // 1. buat user
      const userRepo = manager.getRepository(User);
      const user = userRepo.create({
        fullname: dto.ownerName,
        email: dto.email.toLowerCase(),
        phoneNumber: dto.businessPhone,
        passwordHash: dto.password, // cipherText asli, tidak perlu di-encrypt ulang
        active: true,
        createdAt: new Date(),
      });
      const savedUser = await userRepo.save(user);

      // 2. assign role Vendor sebagai primary
      const role = await manager.getRepository(Role).findOne({
        where: { id: ROLE_ID_VENDOR },
      });
      if (!role) {
        throw new BadRequestException('Role Vendor tidak ditemukan');
      }

      const userRole = manager.getRepository(UserRole).create({
        user: savedUser,
        role,
        isPrimary: true,
        createdAt: new Date(),
      });
      await manager.getRepository(UserRole).save(userRole);

      // 3. buat vendor profile
      const profile = manager.getRepository(VendorProfile).create({
        user: savedUser,
        businessName: dto.businessName,
        ownerName: dto.ownerName,
        businessEmail: dto.email.toLowerCase(),
        businessPhone: dto.businessPhone,
        businessAddress: dto.businessAddress,
        isVerified: false,
        active: true,
        createdAt: new Date(),
      });
      const savedProfile = await manager.getRepository(VendorProfile).save(profile);

      return {
        user: {
          id: savedUser.id,
          fullname: savedUser.fullname,
          email: savedUser.email,
        },
        profile: savedProfile,
      };
    });
  }
  //========================================================================================

  //============================ HELPER: DECRYPT PASSWORD DARI FRONTEND ==============================
  private decryptPassword(cipherText: string): string {
    try {
      return this.cryptographyService.decrypt(cipherText);
    } catch {
      throw new BadRequestException('Format password tidak valid');
    }
  }
  //========================================================================================

  //============================ HELPER: VALIDASI PASSWORD SAMA DENGAN KONFIRMASI ==============================
  private validatePasswordMatch(password: string, confirmPassword: string): void {
    if (password !== confirmPassword) {
      throw new BadRequestException('Password dan konfirmasi password tidak sama');
    }
  }
  //========================================================================================

  //============================ HELPER: VALIDASI KEKUATAN PASSWORD ==============================
  private validatePasswordStrength(password: string): void {
    if (!PASSWORD_REGEX.test(password)) {
      throw new BadRequestException(
        'Password minimal 8 karakter dan harus mengandung minimal 1 huruf besar, 1 angka, dan 1 simbol',
      );
    }
  }
  //========================================================================================

  //============================ HELPER: CEK EMAIL & NOMOR HP BELUM TERPAKAI ==============================
  private async ensureEmailAndPhoneAvailable(
    manager: EntityManager,
    email: string,
    phoneNumber: string,
  ): Promise<void> {

    const userRepo = manager.getRepository(User);

    const existingEmail = await userRepo.findOne({
      where: { email: email.toLowerCase() },
    });
    if (existingEmail) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const existingPhone = await userRepo.findOne({
      where: { phoneNumber },
    });
    if (existingPhone) {
      throw new ConflictException('Nomor HP sudah terdaftar');
    }
  }
  //========================================================================================

}