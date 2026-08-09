import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { User } from '../users/entities/user.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { FindAllContactDto } from './dto/find-all-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //=========================== GET ALL CONTACT BY USER (PAGINATION) ======================================
  async findAllByUser(userId: number, query: FindAllContactDto) {
    const { pageNumber = 1, pageSize = 10 } = query;

    const [data, total] = await this.contactRepository.findAndCount({
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

  //=========================== GET CONTACT BY ID ======================================
  async findOne(id: string): Promise<Contact> {
    return await this.getContactOrThrow(id);
  }
  //========================================================================================

  //=========================== CREATE CONTACT ======================================
  async create(userId: number, dto: CreateContactDto): Promise<Contact> {
    const user = await this.getUserOrThrow(userId);

    const contact = this.contactRepository.create({
      user,
      contactType: dto.contactType,
      contactValue: dto.contactValue,
      active: dto.active ?? true,
      createdAt: new Date(),
    });

    return await this.contactRepository.save(contact);
  }
  //========================================================================================

  //=========================== UPDATE CONTACT ======================================
  async update(id: string, dto: UpdateContactDto): Promise<Contact> {
    const contact = await this.getContactOrThrow(id);

    Object.assign(contact, dto);
    contact.modifiedAt = new Date();

    return await this.contactRepository.save(contact);
  }
  //========================================================================================

  //=========================== DELETE CONTACT ======================================
  async remove(id: string): Promise<void> {
    const contact = await this.getContactOrThrow(id);
    await this.contactRepository.remove(contact);
  }
  //========================================================================================

  //=========================== REPLACE ALL CONTACT MILIK USER (dipakai vendor-profile save-draft/submit) ======================================
  async replaceForUser(
    userId: number,
    items: { contactType: string; contactValue: string }[],
    manager: EntityManager,
  ): Promise<Contact[]> {
    const repo = manager.getRepository(Contact);

    await repo.delete({ user: { id: userId } });

    if (!items.length) {
      return [];
    }

    const contacts = items.map((item) =>
      repo.create({
        user: { id: userId } as User,
        contactType: item.contactType,
        contactValue: item.contactValue,
        active: true,
        createdAt: new Date(),
      }),
    );

    return await repo.save(contacts);
  }
  //========================================================================================

  private async getContactOrThrow(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
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
