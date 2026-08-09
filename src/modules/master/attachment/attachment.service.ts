import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Readable } from 'stream';
import { IsNull, Repository } from 'typeorm';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { FindAllAttachmentDto } from './dto/find-all-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { Attachment } from './entities/attachment.entity';
import { STORAGE_PROVIDER } from './storage/storage-provider.interface';
import type { IStorageProvider } from './storage/storage-provider.interface';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
  ) {}

  async create(
    file: Express.Multer.File,
    dto: CreateAttachmentDto,
    userId: string | null,
  ): Promise<Attachment> {
    if (!file) {
      throw new BadRequestException('File attachment wajib diisi');
    }

    const { storedName, storagePath } = await this.storageProvider.save({
      buffer: file.buffer,
      originalName: file.originalname,
      referenceTable: dto.referenceTable,
      referenceId: dto.referenceId,
    });

    const attachment = this.attachmentRepository.create({
      referenceTable: dto.referenceTable,
      referenceId: dto.referenceId,
      category: dto.category ?? null,
      originalName: file.originalname,
      storedName,
      storagePath,
      url: '',
      mimeType: file.mimetype,
      sizeBytes: file.size,
      sortOrder: dto.sortOrder ?? 0,
      description: dto.description ?? null,
      active: true,
      createdBy: userId,
      createdAt: new Date(),
    });

    const saved = await this.attachmentRepository.save(attachment);
    saved.url = this.buildFileUrl(saved.id);
    return await this.attachmentRepository.save(saved);
  }

  async findAll(query: FindAllAttachmentDto) {
    const {
      referenceTable,
      referenceId,
      category,
      pageNumber = 1,
      pageSize = 10,
    } = query;
    const [data, total] = await this.attachmentRepository.findAndCount({
      where: {
        ...(referenceTable ? { referenceTable } : {}),
        ...(referenceId ? { referenceId } : {}),
        ...(category ? { category } : {}),
        deletedAt: IsNull(),
      },
      order: { sortOrder: 'ASC', id: 'DESC' },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });
    return { data, total, pageNumber, pageSize };
  }

  async findOne(id: string): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }
    return attachment;
  }

  async update(
    id: string,
    dto: UpdateAttachmentDto,
    userId: string | null,
  ): Promise<Attachment> {
    const attachment = await this.findOne(id);
    Object.assign(attachment, dto);
    attachment.modifiedBy = userId;
    attachment.modifiedAt = new Date();
    return await this.attachmentRepository.save(attachment);
  }

  async remove(id: string): Promise<void> {
    const attachment = await this.findOne(id);
    await this.storageProvider.delete(attachment.storagePath);
    await this.attachmentRepository.remove(attachment);
  }

  async getFileStream(
    id: string,
  ): Promise<{ attachment: Attachment; stream: Readable }> {
    const attachment = await this.findOne(id);
    const stream = await this.storageProvider.getStream(attachment.storagePath);
    return { attachment, stream };
  }

  private buildFileUrl(id: string): string {
    return `/attachments/${id}/file`;
  }
}
