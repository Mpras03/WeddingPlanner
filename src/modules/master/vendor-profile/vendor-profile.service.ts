import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { VendorProfile } from './entities/vendor-profile.entity';
import { User } from '../users/entities/user.entity';
import { CreateVendorProfileDto } from './dto/create-vendor-profile.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
import { FindAllVendorProfileDto } from './dto/find-all-vendor-profile.dto';
import { SaveVendorProfileDto } from './dto/save-vendor-profile.dto';
import { Status } from '../../../common/enums/status.enum';
import { ContactsService } from '../contacts/contacts.service';
import { BankAccountsService } from '../bank-accounts/bank-accounts.service';
import { VerificationDocumentsService } from '../verification-documents/verification-documents.service';
import { AttachmentService } from '../attachment/attachment.service';

export interface SaveVendorProfileFiles {
  portfolioImages?: Express.Multer.File[];
  verificationDocumentFiles?: Express.Multer.File[];
}

const PORTFOLIO_ATTACHMENT_CATEGORY = 'portfolio';
const LOGO_ATTACHMENT_CATEGORY = 'logo';
const VENDOR_PROFILE_REFERENCE_TABLE = 'vendor_profiles';
const VERIFICATION_DOCUMENT_REFERENCE_TABLE = 'verification_documents';
const VERIFICATION_DOCUMENT_ATTACHMENT_CATEGORY = 'verification_document';

@Injectable()
export class VendorProfileService {

  private readonly logger = new Logger(VendorProfileService.name);

  constructor(
    @InjectRepository(VendorProfile)
    private readonly vendorProfileRepository: Repository<VendorProfile>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectDataSource()
    private readonly dataSource: DataSource,

    private readonly contactsService: ContactsService,
    private readonly bankAccountsService: BankAccountsService,
    private readonly verificationDocumentsService: VerificationDocumentsService,
    private readonly attachmentService: AttachmentService,
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

  //=========================== GET VENDOR PROFILE BY ID (+ contacts, bank accounts, verification documents, portfolio & logo attachment ids) ======================================
  async findOne(id: number) {
    const profile = await this.getProfileOrThrow(id);
    return await this.buildAggregatedProfile(profile);
  }
  //========================================================================================

  //=========================== GET VENDOR PROFILE BY USER ID (+ contacts, bank accounts, verification documents, portfolio & logo attachment ids) ======================================
  async findByUserId(userId: number) {
    return await this.getAggregatedProfile(userId);
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

  //=========================== SAVE DRAFT VENDOR PROFILE (status selalu Draft) ======================================
  async saveDraft(
    dto: SaveVendorProfileDto,
    files: SaveVendorProfileFiles,
    actorUserId: string | null,
  ) {
    return await this.saveOrSubmit(
      dto,
      Status.DRAFT,
      files,
      actorUserId,
    );
  }
  //========================================================================================

  //=========================== SUBMIT VENDOR PROFILE (status selalu Pending Verification) ======================================
  async submit(
    dto: SaveVendorProfileDto,
    files: SaveVendorProfileFiles,
    actorUserId: string | null,
  ) {
    return await this.saveOrSubmit(
      dto,
      Status.PENDING_VERIFICATION,
      files,
      actorUserId,
    );
  }
  //========================================================================================

  //============================ HELPER: ORKESTRASI SAVE DRAFT / SUBMIT ==============================
  // Menyimpan vendor_profiles + categories + logoUrl + status dalam satu transaksi, sekaligus
  // me-replace contacts, meng-upsert rekening utama, dan menambahkan dokumen verifikasi baru
  // (kontak/rekening ditaruh di module users sesuai aturan main). Upload file (portfolio image
  // & dokumen verifikasi) dilakukan setelah transaksi commit, karena AttachmentService menulis
  // file fisik ke storage di luar unit-of-work database — kegagalan upload tidak boleh
  // membatalkan data profile yang sudah berhasil tersimpan (sama seperti pola kirim OTP di RegisterService).
  private async saveOrSubmit(
    dto: SaveVendorProfileDto,
    status: Status,
    files: SaveVendorProfileFiles,
    actorUserId: string | null,
  ) {
    const { profile, verificationDocuments } =
      await this.dataSource.transaction(async (manager) => {
        const userRepo = manager.getRepository(User);
        const user = await userRepo.findOne({ where: { id: dto.userId } });
        if (!user) {
          throw new NotFoundException('User not found');
        }

        const vendorProfileRepo = manager.getRepository(VendorProfile);
        let vendorProfile = await vendorProfileRepo.findOne({
          where: { user: { id: dto.userId } },
        });

        const fields = {
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
          categories: dto.categories?.length
            ? dto.categories.join(',')
            : undefined,
        };

        if (!vendorProfile) {
          vendorProfile = vendorProfileRepo.create({
            user,
            ...fields,
            status,
            isVerified: false,
            active: true,
            createdAt: new Date(),
          });
        } else {
          Object.assign(
            vendorProfile,
            Object.fromEntries(
              Object.entries(fields).filter(([, value]) => value !== undefined),
            ),
          );
          vendorProfile.status = status;
          vendorProfile.updatedAt = new Date();
        }

        const savedProfile = await vendorProfileRepo.save(vendorProfile);

        await this.contactsService.replaceForUser(
          dto.userId,
          dto.contacts ?? [],
          manager,
        );

        if (dto.bankAccount) {
          await this.bankAccountsService.upsertPrimaryForUser(
            dto.userId,
            dto.bankAccount,
            manager,
          );
        }

        const savedDocuments =
          await this.verificationDocumentsService.createManyForUser(
            dto.userId,
            dto.verificationDocuments ?? [],
            manager,
          );

        return { profile: savedProfile, verificationDocuments: savedDocuments };
      });

    await this.replacePortfolioAttachments(
      profile.id,
      files.portfolioImages ?? [],
      actorUserId,
    );
    await this.attachVerificationDocumentFiles(
      verificationDocuments,
      files.verificationDocumentFiles ?? [],
      actorUserId,
    );

    return await this.getAggregatedProfile(dto.userId);
  }
  //========================================================================================

  //============================ HELPER: GANTI SEMUA ATTACHMENT PORTOFOLIO ==============================
  private async replacePortfolioAttachments(
    vendorProfileId: number,
    files: Express.Multer.File[],
    actorUserId: string | null,
  ): Promise<void> {
    if (!files.length) {
      return;
    }

    const existing = await this.attachmentService.findAll({
      referenceTable: VENDOR_PROFILE_REFERENCE_TABLE,
      referenceId: vendorProfileId,
      category: PORTFOLIO_ATTACHMENT_CATEGORY,
      pageNumber: 1,
      pageSize: 100,
    });

    for (const attachment of existing.data) {
      try {
        await this.attachmentService.remove(attachment.id);
      } catch (error: any) {
        this.logger.warn(
          `Gagal menghapus attachment portofolio lama ${attachment.id}: ${error.message}`,
        );
      }
    }

    for (const [index, file] of files.entries()) {
      try {
        await this.attachmentService.create(
          file,
          {
            referenceTable: VENDOR_PROFILE_REFERENCE_TABLE,
            referenceId: vendorProfileId,
            category: PORTFOLIO_ATTACHMENT_CATEGORY,
            sortOrder: index,
          },
          actorUserId,
        );
      } catch (error: any) {
        this.logger.warn(
          `Gagal upload gambar portofolio ke-${index}: ${error.message}`,
        );
      }
    }
  }
  //========================================================================================

  //============================ HELPER: LAMPIRKAN FILE DOKUMEN VERIFIKASI ==============================
  private async attachVerificationDocumentFiles(
    documents: { id: string }[],
    files: Express.Multer.File[],
    actorUserId: string | null,
  ): Promise<void> {
    for (const [index, file] of files.entries()) {
      const document = documents[index];
      if (!document) {
        continue;
      }
      try {
        await this.attachmentService.create(
          file,
          {
            referenceTable: VERIFICATION_DOCUMENT_REFERENCE_TABLE,
            referenceId: Number(document.id),
            category: VERIFICATION_DOCUMENT_ATTACHMENT_CATEGORY,
          },
          actorUserId,
        );
      } catch (error: any) {
        this.logger.warn(
          `Gagal upload file dokumen verifikasi ke-${index}: ${error.message}`,
        );
      }
    }
  }
  //========================================================================================

  //============================ HELPER: AGREGASI PROFILE + CONTACTS + BANK ACCOUNTS + VERIFICATION DOCUMENTS + PORTFOLIO (by user id) ==============================
  private async getAggregatedProfile(userId: number) {
    const profile = await this.getProfileEntityByUserId(userId);
    return await this.buildAggregatedProfile(profile);
  }
  //========================================================================================

  //============================ HELPER: SUSUN PROFILE + CONTACTS + BANK ACCOUNTS + VERIFICATION DOCUMENTS + PORTFOLIO + LOGO ==============================
  // Attachment (portfolio, logo, & dokumen verifikasi) cuma dikirim sebagai id — file aslinya
  // di-load terpisah dari frontend lewat GET /attachments/:id/file (blob), bukan di-embed di sini.
  // Dipakai bersama oleh findOne (by id) dan findByUserId agar bentuk responsnya konsisten dan
  // sejalan dengan field yang diterima save-draft/submit (categories, contacts, bankAccount, verificationDocuments).
  private async buildAggregatedProfile(profile: VendorProfile) {
    const userId = profile.user.id;

    const [
      contacts,
      bankAccounts,
      verificationDocuments,
      portfolioAttachments,
      logoAttachments,
    ] = await Promise.all([
      this.contactsService.findAllByUser(userId, {
        pageNumber: 1,
        pageSize: 100,
      }),
      this.bankAccountsService.findAllByUser(userId, {
        pageNumber: 1,
        pageSize: 100,
      }),
      this.verificationDocumentsService.findAllByUser(userId, {
        pageNumber: 1,
        pageSize: 100,
      }),
      this.attachmentService.findAll({
        referenceTable: VENDOR_PROFILE_REFERENCE_TABLE,
        referenceId: profile.id,
        category: PORTFOLIO_ATTACHMENT_CATEGORY,
        pageNumber: 1,
        pageSize: 100,
      }),
      this.attachmentService.findAll({
        referenceTable: VENDOR_PROFILE_REFERENCE_TABLE,
        referenceId: profile.id,
        category: LOGO_ATTACHMENT_CATEGORY,
        pageNumber: 1,
        pageSize: 1,
      }),
    ]);

    const verificationDocumentsWithAttachment = await Promise.all(
      verificationDocuments.data.map(async (document) => {
        const documentAttachments = await this.attachmentService.findAll({
          referenceTable: VERIFICATION_DOCUMENT_REFERENCE_TABLE,
          referenceId: Number(document.id),
          category: VERIFICATION_DOCUMENT_ATTACHMENT_CATEGORY,
          pageNumber: 1,
          pageSize: 1,
        });

        return {
          ...document,
          attachmentId: documentAttachments.data[0]?.id ?? null,
        };
      }),
    );

    return {
      ...profile,
      categories: profile.categories ? profile.categories.split(',') : [],
      contacts: contacts.data,
      bankAccounts: bankAccounts.data,
      verificationDocuments: verificationDocumentsWithAttachment,
      portfolioAttachmentIds: portfolioAttachments.data.map((attachment) => attachment.id),
      logoAttachmentId: logoAttachments.data[0]?.id ?? null,
    };
  }
  //========================================================================================

  private async getProfileEntityByUserId(userId: number): Promise<VendorProfile> {

    const profile = await this.vendorProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });

    if (!profile) {
      throw new NotFoundException('Vendor profile not found for this user');
    }

    return profile;
  }

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
