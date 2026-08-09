import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BankAccount } from './entities/bank-account.entity';
import { User } from '../users/entities/user.entity';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { FindAllBankAccountDto } from './dto/find-all-bank-account.dto';

@Injectable()
export class BankAccountsService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //=========================== GET ALL BANK ACCOUNT BY USER (PAGINATION) ======================================
  async findAllByUser(userId: number, query: FindAllBankAccountDto) {
    const { pageNumber = 1, pageSize = 10 } = query;

    const [data, total] = await this.bankAccountRepository.findAndCount({
      where: { user: { id: userId } },
      order: { id: 'ASC' },
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

  //=========================== GET BANK ACCOUNT BY ID ======================================
  async findOne(id: string): Promise<BankAccount> {
    return await this.getBankAccountOrThrow(id);
  }
  //========================================================================================

  // Rekening pencairan: API saat ini hanya mendukung satu rekening utama (is_primary) per user.
  //=========================== CREATE BANK ACCOUNT ======================================
  async create(
    userId: number,
    dto: CreateBankAccountDto,
  ): Promise<BankAccount> {
    const user = await this.getUserOrThrow(userId);

    const existing = await this.bankAccountRepository.findOne({
      where: { user: { id: userId }, active: true },
    });
    if (existing) {
      throw new ConflictException(
        'User already has a primary bank account, use update instead',
      );
    }

    const bankAccount = this.bankAccountRepository.create({
      user,
      bankName: dto.bankName,
      accountNumber: dto.accountNumber,
      accountHolderName: dto.accountHolderName,
      isPrimary: true,
      active: true,
      createdAt: new Date(),
    });

    return await this.bankAccountRepository.save(bankAccount);
  }
  //========================================================================================

  //=========================== UPDATE BANK ACCOUNT ======================================
  async update(id: string, dto: UpdateBankAccountDto): Promise<BankAccount> {
    const bankAccount = await this.getBankAccountOrThrow(id);

    Object.assign(bankAccount, dto);
    bankAccount.modifiedAt = new Date();

    return await this.bankAccountRepository.save(bankAccount);
  }
  //========================================================================================

  //=========================== DELETE BANK ACCOUNT ======================================
  async remove(id: string): Promise<void> {
    const bankAccount = await this.getBankAccountOrThrow(id);
    await this.bankAccountRepository.remove(bankAccount);
  }
  //========================================================================================

  //=========================== UPSERT REKENING UTAMA MILIK USER (dipakai vendor-profile save-draft/submit) ======================================
  async upsertPrimaryForUser(
    userId: number,
    item: {
      bankName: string;
      accountNumber: string;
      accountHolderName: string;
    },
    manager: EntityManager,
  ): Promise<BankAccount> {
    const repo = manager.getRepository(BankAccount);

    const existing = await repo.findOne({
      where: { user: { id: userId }, active: true },
    });

    if (existing) {
      Object.assign(existing, item);
      existing.modifiedAt = new Date();
      return await repo.save(existing);
    }

    const bankAccount = repo.create({
      user: { id: userId } as User,
      bankName: item.bankName,
      accountNumber: item.accountNumber,
      accountHolderName: item.accountHolderName,
      isPrimary: true,
      active: true,
      createdAt: new Date(),
    });

    return await repo.save(bankAccount);
  }
  //========================================================================================

  private async getBankAccountOrThrow(id: string): Promise<BankAccount> {
    const bankAccount = await this.bankAccountRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!bankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    return bankAccount;
  }

  private async getUserOrThrow(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
