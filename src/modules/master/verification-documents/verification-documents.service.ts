import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { VerificationDocument } from './entities/verification-document.entity';
import { User } from '../users/entities/user.entity';
import { CreateVerificationDocumentDto } from './dto/create-verification-document.dto';
import { UpdateVerificationDocumentDto } from './dto/update-verification-document.dto';
import { FindAllVerificationDocumentDto } from './dto/find-all-verification-document.dto';
import { Status } from '../../../common/enums/status.enum';
import { AttachmentService } from '../attachment/attachment.service';

@Injectable()
export class VerificationDocumentsService {
  constructor(
    @InjectRepository(VerificationDocument)
    private readonly verificationDocumentRepository: Repository<VerificationDocument>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly attachmentService: AttachmentService,
  ) {}

  //=========================== GET ALL VERIFICATION DOCUMENT BY USER (PAGINATION) ======================================
  async findAllByUser(userId: number, query: FindAllVerificationDocumentDto) {
    const { pageNumber = 1, pageSize = 10 } = query;

    const [data, total] =
      await this.verificationDocumentRepository.findAndCount({
        where: { user: { id: userId } },
        order: { id: 'DESC' },
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

  //=========================== GET VERIFICATION DOCUMENT BY ID ======================================
  async findOne(id: string): Promise<VerificationDocument> {
    return await this.getDocumentOrThrow(id);
  }
  //========================================================================================

  //=========================== CREATE VERIFICATION DOCUMENT (+ upload file via centralized attachment) ======================================
  async create(
    userId: number,
    dto: CreateVerificationDocumentDto,
    file: Express.Multer.File | undefined,
    actorUserId: string | null,
  ): Promise<VerificationDocument> {
    const user = await this.getUserOrThrow(userId);

    const document = this.verificationDocumentRepository.create({
      user,
      documentType: dto.documentType,
      documentNumber: dto.documentNumber,
      status: Status.PENDING_VERIFICATION,
      active: true,
      createdAt: new Date(),
    });

    const saved = await this.verificationDocumentRepository.save(document);

    if (file) {
      await this.attachmentService.create(
        file,
        {
          referenceTable: 'verification_documents',
          referenceId: Number(saved.id),
          category: 'verification_document',
        },
        actorUserId,
      );
    }

    return saved;
  }
  //========================================================================================

  //=========================== UPDATE VERIFICATION DOCUMENT (mis. review status oleh admin) ======================================
  async update(
    id: string,
    dto: UpdateVerificationDocumentDto,
  ): Promise<VerificationDocument> {
    const document = await this.getDocumentOrThrow(id);

    Object.assign(document, dto);
    document.modifiedAt = new Date();

    return await this.verificationDocumentRepository.save(document);
  }
  //========================================================================================

  //=========================== DELETE VERIFICATION DOCUMENT ======================================
  async remove(id: string): Promise<void> {
    const document = await this.getDocumentOrThrow(id);
    await this.verificationDocumentRepository.remove(document);
  }
  //========================================================================================

  //=========================== CREATE BANYAK DOKUMEN MILIK USER (dipakai vendor-profile save-draft/submit) ======================================
  async createManyForUser(
    userId: number,
    items: { documentType: string; documentNumber?: string }[],
    manager: EntityManager,
  ): Promise<VerificationDocument[]> {
    if (!items.length) {
      return [];
    }

    const repo = manager.getRepository(VerificationDocument);

    const documents = items.map((item) =>
      repo.create({
        user: { id: userId } as User,
        documentType: item.documentType,
        documentNumber: item.documentNumber,
        status: Status.PENDING_VERIFICATION,
        active: true,
        createdAt: new Date(),
      }),
    );

    return await repo.save(documents);
  }
  //========================================================================================

  private async getDocumentOrThrow(id: string): Promise<VerificationDocument> {
    const document = await this.verificationDocumentRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!document) {
      throw new NotFoundException('Verification document not found');
    }

    return document;
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
