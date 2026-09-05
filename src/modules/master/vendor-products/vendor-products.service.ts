import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { VendorProduct } from './entities/vendor-product.entity';
import { VendorProfile } from '../vendor-profile/entities/vendor-profile.entity';
import { Order } from '../../public/orders/entities/order.entity';
import { OrderStatus } from '../../public/orders/order-status.enum';
import { VendorProductReview } from '../../public/vendor-product-reviews/entities/vendor-product-review.entity';
import { CreateVendorProductDto } from './dto/create-vendor-product.dto';
import { UpdateVendorProductDto } from './dto/update-vendor-product.dto';
import { FindAllVendorProductDto } from './dto/find-all-vendor-product.dto';
import { AttachmentService } from '../attachment/attachment.service';

export interface VendorProductFiles {
  images?: Express.Multer.File[];
}

const VENDOR_PRODUCT_REFERENCE_TABLE = 'vendor_products';
const PRODUCT_IMAGE_ATTACHMENT_CATEGORY = 'product_image';

@Injectable()
export class VendorProductsService {

  private readonly logger = new Logger(VendorProductsService.name);

  constructor(
    @InjectRepository(VendorProduct)
    private readonly vendorProductRepository: Repository<VendorProduct>,

    @InjectRepository(VendorProfile)
    private readonly vendorProfileRepository: Repository<VendorProfile>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(VendorProductReview)
    private readonly vendorProductReviewRepository: Repository<VendorProductReview>,

    private readonly attachmentService: AttachmentService,
  ) {}

  //=========================== GET ALL VENDOR PRODUCT (PAGINATION) ======================================
  async findAll(query: FindAllVendorProductDto) {

    const { filter, vendorId, status, pageNumber = 1, pageSize = 10 } = query;

    const extraWhere = {
      ...(vendorId ? { vendor: { id: vendorId } } : {}),
      ...(status ? { status } : {}),
    };

    const [data, total] = await this.vendorProductRepository.findAndCount({
      where: filter
        ? [
            { ...extraWhere, name: ILike(`%${filter}%`) },
            { ...extraWhere, category: ILike(`%${filter}%`) },
          ]
        : extraWhere,
      relations: {
        vendor: true,
      },
      order: {
        id: 'DESC',
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    const aggregatedData = await Promise.all(
      data.map((product) => this.aggregateProduct(product)),
    );

    return {
      data: aggregatedData,
      total,
      pageNumber,
      pageSize,
    };
  }
  //========================================================================================

  //=========================== GET VENDOR PRODUCT BY ID (+ image attachment ids) ======================================
  async findOne(id: string) {
    const product = await this.getProductOrThrow(id);
    return await this.aggregateProduct(product);
  }
  //========================================================================================

  //=========================== CREATE VENDOR PRODUCT (+ upload gambar) ======================================
  async create(
    dto: CreateVendorProductDto,
    files: VendorProductFiles,
    actorUserId: string | null,
  ) {
    const vendor = await this.vendorProfileRepository.findOne({
      where: { id: dto.vendorId },
    });
    if (!vendor) {
      throw new NotFoundException('Vendor profile not found');
    }

    const product = this.vendorProductRepository.create({
      vendor,
      category: dto.category,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      minimumDp: dto.minimumDp,
      duration: dto.duration,
      guestCapacity: dto.guestCapacity,
      serviceArea: dto.serviceArea,
      terms: dto.terms,
      status: dto.status,
      active: dto.active ?? true,
      createdBy: actorUserId,
      createdAt: new Date(),
    });

    const saved = await this.vendorProductRepository.save(product);

    await this.replaceProductImages(saved.id, files.images ?? [], actorUserId);

    return await this.findOne(saved.id);
  }
  //========================================================================================

  //=========================== UPDATE VENDOR PRODUCT (+ ganti gambar) ======================================
  async update(
    id: string,
    dto: UpdateVendorProductDto,
    files: VendorProductFiles,
    actorUserId: string | null,
  ) {
    const product = await this.getProductOrThrow(id);

    const fields = {
      category: dto.category,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      minimumDp: dto.minimumDp,
      duration: dto.duration,
      guestCapacity: dto.guestCapacity,
      serviceArea: dto.serviceArea,
      terms: dto.terms,
      status: dto.status,
      active: dto.active,
    };

    Object.assign(
      product,
      Object.fromEntries(
        Object.entries(fields).filter(([, value]) => value !== undefined),
      ),
    );
    product.modifiedBy = actorUserId;
    product.modifiedAt = new Date();

    await this.vendorProductRepository.save(product);

    await this.replaceProductImages(product.id, files.images ?? [], actorUserId);

    return await this.findOne(product.id);
  }
  //========================================================================================

  //=========================== DELETE VENDOR PRODUCT ======================================
  // Produk yang sudah punya riwayat pemesanan tidak boleh dihapus — harga/data produk di order
  // sudah di-snapshot, tapi baris vendor_products-nya sendiri harus tetap ada (juga dijaga oleh
  // FK orders.vendor_product_id di database, tapi dicek lebih dulu di sini supaya errornya jelas).
  async remove(id: string): Promise<void> {
    const product = await this.getProductOrThrow(id);

    const orderCount = await this.orderRepository.count({
      where: { vendorProduct: { id } },
    });
    if (orderCount > 0) {
      throw new ConflictException(
        'Produk ini tidak dapat dihapus karena sudah memiliki riwayat pemesanan',
      );
    }

    await this.vendorProductRepository.remove(product);
  }
  //========================================================================================

  //============================ HELPER: GANTI SEMUA GAMBAR PRODUK ==============================
  // Mengikuti pola replaceAvatarAttachment di customer-profile: attachment lama untuk kategori
  // ini dihapus, lalu semua file baru diupload lewat AttachmentService (generic, referenceTable/
  // referenceId/category) — bedanya di sini mendukung banyak gambar sekaligus (sama seperti
  // replacePortfolioAttachments di vendor-profile). Tidak mengubah apa pun kalau tidak ada file baru.
  private async replaceProductImages(
    vendorProductId: string,
    files: Express.Multer.File[],
    actorUserId: string | null,
  ): Promise<void> {
    if (!files.length) {
      return;
    }

    const existing = await this.attachmentService.findAll({
      referenceTable: VENDOR_PRODUCT_REFERENCE_TABLE,
      referenceId: Number(vendorProductId),
      category: PRODUCT_IMAGE_ATTACHMENT_CATEGORY,
      pageNumber: 1,
      pageSize: 100,
    });

    for (const attachment of existing.data) {
      try {
        await this.attachmentService.remove(attachment.id);
      } catch (error: any) {
        this.logger.warn(
          `Gagal menghapus gambar produk lama ${attachment.id}: ${error.message}`,
        );
      }
    }

    for (const [index, file] of files.entries()) {
      try {
        await this.attachmentService.create(
          file,
          {
            referenceTable: VENDOR_PRODUCT_REFERENCE_TABLE,
            referenceId: Number(vendorProductId),
            category: PRODUCT_IMAGE_ATTACHMENT_CATEGORY,
            sortOrder: index,
          },
          actorUserId,
        );
      } catch (error: any) {
        this.logger.warn(
          `Gagal upload gambar produk ke-${index}: ${error.message}`,
        );
      }
    }
  }
  //========================================================================================

  //============================ HELPER: SUSUN PRODUCT + IMAGE ATTACHMENT IDS + STATISTIK ULASAN/PENJUALAN ==============================
  // Attachment gambar produk cuma dikirim sebagai id — file aslinya di-load terpisah dari frontend
  // lewat GET /attachments/:id/file (blob), bukan di-embed di sini. averageRating/reviewCount cuma
  // dihitung dari ulasan yang active=true (ulasan yang dinonaktifkan/dimoderasi tidak ikut dihitung).
  // soldCount dihitung dari order berstatus COMPLETED untuk produk ini. Dipakai bersama oleh
  // findAll, findOne, create, dan update supaya bentuk responsnya selalu konsisten.
  private async aggregateProduct(product: VendorProduct) {
    const [images, activeReviews, soldCount] = await Promise.all([
      this.attachmentService.findAll({
        referenceTable: VENDOR_PRODUCT_REFERENCE_TABLE,
        referenceId: Number(product.id),
        category: PRODUCT_IMAGE_ATTACHMENT_CATEGORY,
        pageNumber: 1,
        pageSize: 100,
      }),
      this.vendorProductReviewRepository.find({
        where: { vendorProduct: { id: product.id }, active: true },
      }),
      this.orderRepository.count({
        where: { vendorProduct: { id: product.id }, status: OrderStatus.COMPLETED },
      }),
    ]);

    const reviewCount = activeReviews.length;
    const averageRating =
      reviewCount > 0
        ? Number(
            (
              activeReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
            ).toFixed(2),
          )
        : 0;

    return {
      ...product,
      imageAttachmentIds: images.data.map((attachment) => attachment.id),
      averageRating,
      reviewCount,
      soldCount,
    };
  }
  //========================================================================================

  private async getProductOrThrow(id: string): Promise<VendorProduct> {

    const product = await this.vendorProductRepository.findOne({
      where: { id },
      relations: { vendor: true },
    });

    if (!product) {
      throw new NotFoundException('Vendor product not found');
    }

    return product;
  }

}
