import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { CustomerProfile } from './entities/customer-profile.entity';
import { User } from '../users/entities/user.entity';
import { CreateCustomerProfileDto } from './dto/create-customer-profile.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { FindAllCustomerProfileDto } from './dto/find-all-customer-profile.dto';
import { SaveCustomerProfileDto } from './dto/save-customer-profile.dto';
import { Status } from '../../../common/enums/status.enum';
import { AttachmentService } from '../attachment/attachment.service';

export interface SaveCustomerProfileFiles {
  avatarPhoto?: Express.Multer.File[];
}

const CUSTOMER_PROFILE_REFERENCE_TABLE = 'customer_profiles';
const AVATAR_ATTACHMENT_CATEGORY = 'profile_photo';

@Injectable()
export class CustomerProfileService {

  private readonly logger = new Logger(CustomerProfileService.name);

  constructor(
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectDataSource()
    private readonly dataSource: DataSource,

    private readonly attachmentService: AttachmentService,
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

  //=========================== GET CUSTOMER PROFILE BY ID (+ avatar attachment id) ======================================
  async findOne(id: number) {
    const profile = await this.getProfileOrThrow(id);
    return await this.buildAggregatedProfile(profile);
  }
  //========================================================================================

  //=========================== GET CUSTOMER PROFILE BY USER ID (+ avatar attachment id) ======================================
  async findByUserId(userId: number) {

    const profile = await this.customerProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });

    if (!profile) {
      throw new NotFoundException('Customer profile not found for this user');
    }

    return await this.buildAggregatedProfile(profile);
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

  //=========================== SAVE DRAFT CUSTOMER PROFILE (status selalu Draft) ======================================
  async saveDraft(
    dto: SaveCustomerProfileDto,
    files: SaveCustomerProfileFiles,
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

  //=========================== SUBMIT CUSTOMER PROFILE (status selalu Pending Verification) ======================================
  async submit(
    dto: SaveCustomerProfileDto,
    files: SaveCustomerProfileFiles,
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
  // Upsert customer_profiles (data pribadi, alamat, detail pernikahan) dalam satu transaksi.
  // Upload foto profil dilakukan setelah transaksi commit, karena AttachmentService menulis
  // file fisik ke storage di luar unit-of-work database — kegagalan upload tidak boleh
  // membatalkan data profile yang sudah berhasil tersimpan (sama seperti pola di vendor-profile).
  private async saveOrSubmit(
    dto: SaveCustomerProfileDto,
    status: Status,
    files: SaveCustomerProfileFiles,
    actorUserId: string | null,
  ) {
    const profile = await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const user = await userRepo.findOne({ where: { id: dto.userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const customerProfileRepo = manager.getRepository(CustomerProfile);
      let customerProfile = await customerProfileRepo.findOne({
        where: { user: { id: dto.userId } },
      });

      const fields = {
        fullName: dto.fullName,
        gender: dto.gender,
        birthDate: dto.birthDate,
        address: dto.address,
        city: dto.city,
        province: dto.province,
        weddingDate: dto.weddingDate,
        eventType: dto.eventType,
        weddingProvince: dto.weddingProvince,
        weddingCity: dto.weddingCity,
        weddingLocation: dto.weddingLocation,
        weddingTheme: dto.weddingTheme,
        estimatedGuests: dto.estimatedGuests,
        preferredVendorLocation: dto.preferredVendorLocation,
        packagePreference: dto.packagePreference,
        neededVendorCategories: dto.neededVendorCategories,
        estimatedBudget: dto.estimatedBudget,
        budgetRangeMin: dto.budgetRangeMin,
        budgetRangeMax: dto.budgetRangeMax,
        budgetPriorities: dto.budgetPriorities,
      };

      if (!customerProfile) {
        customerProfile = customerProfileRepo.create({
          user,
          ...fields,
          status,
          active: true,
          createdAt: new Date(),
        });
      } else {
        Object.assign(
          customerProfile,
          Object.fromEntries(
            Object.entries(fields).filter(([, value]) => value !== undefined),
          ),
        );
        customerProfile.status = status;
        customerProfile.modifiedAt = new Date();
      }

      return await customerProfileRepo.save(customerProfile);
    });

    await this.replaceAvatarAttachment(
      profile.id,
      files.avatarPhoto?.[0],
      actorUserId,
    );

    return await this.findByUserId(dto.userId);
  }
  //========================================================================================

  //============================ HELPER: GANTI FOTO PROFIL (AVATAR) ==============================
  // Mengikuti pola replacePortfolioAttachments di vendor-profile: attachment lama untuk kategori
  // ini dihapus, lalu file baru diupload lewat AttachmentService (generic, referenceTable/referenceId/category).
  // Id attachment-nya baru didapat lewat buildAggregatedProfile (avatarAttachmentId), bukan disimpan
  // sebagai URL di kolom avatarUrl — sama seperti logoUrl vendor yang tidak disentuh oleh upload logo.
  private async replaceAvatarAttachment(
    customerProfileId: number,
    file: Express.Multer.File | undefined,
    actorUserId: string | null,
  ): Promise<void> {
    if (!file) {
      return;
    }

    const existing = await this.attachmentService.findAll({
      referenceTable: CUSTOMER_PROFILE_REFERENCE_TABLE,
      referenceId: customerProfileId,
      category: AVATAR_ATTACHMENT_CATEGORY,
      pageNumber: 1,
      pageSize: 10,
    });

    for (const attachment of existing.data) {
      try {
        await this.attachmentService.remove(attachment.id);
      } catch (error: any) {
        this.logger.warn(
          `Gagal menghapus foto profil lama ${attachment.id}: ${error.message}`,
        );
      }
    }

    try {
      await this.attachmentService.create(
        file,
        {
          referenceTable: CUSTOMER_PROFILE_REFERENCE_TABLE,
          referenceId: customerProfileId,
          category: AVATAR_ATTACHMENT_CATEGORY,
          sortOrder: 0,
        },
        actorUserId,
      );
    } catch (error: any) {
      this.logger.warn(`Gagal upload foto profil: ${error.message}`);
    }
  }
  //========================================================================================

  //============================ HELPER: SUSUN PROFILE + AVATAR ATTACHMENT ID ==============================
  // Attachment foto profil cuma dikirim sebagai id — file aslinya di-load terpisah dari frontend
  // lewat GET /attachments/:id/file (blob), bukan di-embed di sini. Dipakai bersama oleh findOne
  // (by id) dan findByUserId agar bentuk responsnya konsisten dan selaras dengan field yang
  // diterima save-draft/submit.
  private async buildAggregatedProfile(profile: CustomerProfile) {
    const avatarAttachments = await this.attachmentService.findAll({
      referenceTable: CUSTOMER_PROFILE_REFERENCE_TABLE,
      referenceId: profile.id,
      category: AVATAR_ATTACHMENT_CATEGORY,
      pageNumber: 1,
      pageSize: 1,
    });

    return {
      ...profile,
      avatarAttachmentId: avatarAttachments.data[0]?.id ?? null,
    };
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