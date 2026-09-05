import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { VendorProductReview } from './entities/vendor-product-review.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/order-status.enum';
import { CustomerProfile } from '../../master/customer-profile/entities/customer-profile.entity';
import { CreateVendorProductReviewDto } from './dto/create-vendor-product-review.dto';
import { FindAllVendorProductReviewDto } from './dto/find-all-vendor-product-review.dto';
import { AttachmentService } from '../../master/attachment/attachment.service';

export interface VendorProductReviewFiles {
  images?: Express.Multer.File[];
}

const VENDOR_PRODUCT_REVIEW_REFERENCE_TABLE = 'vendor_product_reviews';
const REVIEW_PHOTO_ATTACHMENT_CATEGORY = 'review_photo';

@Injectable()
export class VendorProductReviewsService {

  private readonly logger = new Logger(VendorProductReviewsService.name);

  constructor(
    @InjectRepository(VendorProductReview)
    private readonly vendorProductReviewRepository: Repository<VendorProductReview>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepository: Repository<CustomerProfile>,

    private readonly attachmentService: AttachmentService,
  ) {}

  //=========================== GET ALL VENDOR PRODUCT REVIEW (PAGINATION) ======================================
  // Ulasan bersifat publik (dipakai buat ditampilkan di halaman detail produk ke semua orang),
  // jadi endpoint ini tidak discope ke caller sendiri — beda dengan orders yang privat. Cuma ulasan
  // active=true yang ditampilkan/dihitung — ulasan yang dinonaktifkan/dimoderasi disembunyikan
  // sepenuhnya (baik dari listing maupun dari ratingBreakdown).
  async findAll(query: FindAllVendorProductReviewDto) {

    const { vendorProductId, vendorId, customerId, orderId, rating, pageNumber = 1, pageSize = 10 } = query;

    const baseWhere: FindOptionsWhere<VendorProductReview> = {
      active: true,
      ...(vendorProductId ? { vendorProduct: { id: String(vendorProductId) } } : {}),
      ...(vendorId ? { vendor: { id: vendorId } } : {}),
      ...(customerId ? { customer: { id: customerId } } : {}),
      ...(orderId ? { order: { id: String(orderId) } } : {}),
    };

    const [data, total] = await this.vendorProductReviewRepository.findAndCount({
      where: { ...baseWhere, ...(rating ? { rating } : {}) },
      relations: {
        order: true,
        customer: true,
        vendor: true,
        vendorProduct: true,
      },
      order: {
        id: 'DESC',
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    const dataWithImages = await Promise.all(
      data.map((review) => this.attachImageIds(review)),
    );

    // ratingBreakdown pakai filter yang sama minus `rating` itu sendiri, supaya breakdown selalu
    // menunjukkan distribusi 1-5 bintang yang selaras dengan hasil listing yang sedang ditampilkan.
    const ratingBreakdown = await this.computeRatingBreakdown(baseWhere);

    return {
      data: dataWithImages,
      total,
      pageNumber,
      pageSize,
      ratingBreakdown,
    };
  }
  //========================================================================================

  //=========================== GET VENDOR PRODUCT REVIEW BY ID (+ image attachment ids) ======================================
  async findOne(id: string) {
    const review = await this.getReviewOrThrow(id);
    return await this.attachImageIds(review);
  }
  //========================================================================================

  //=========================== CREATE VENDOR PRODUCT REVIEW (+ upload gambar) ======================================
  // Pola "verified purchase": ulasan cuma bisa dibuat dari order milik sendiri yang sudah
  // COMPLETED, satu order cuma boleh diulas sekali (order_id UNIQUE). customer/vendor/vendorProduct
  // selalu disnapshot dari order tersebut, tidak pernah dipercaya dari body.
  async create(
    dto: CreateVendorProductReviewDto,
    files: VendorProductReviewFiles,
    requestUserId: number | null,
  ) {
    if (requestUserId === null) {
      throw new NotFoundException('Customer profile not found for this user');
    }

    const customer = await this.customerProfileRepository.findOne({
      where: { user: { id: requestUserId } },
    });
    if (!customer) {
      throw new NotFoundException('Customer profile not found for this user');
    }

    const order = await this.orderRepository.findOne({
      where: { id: String(dto.orderId) },
      relations: { customer: true, vendor: true, vendorProduct: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.customer.id !== customer.id) {
      throw new ForbiddenException('Anda hanya dapat mengulas order milik sendiri');
    }
    if (order.status !== (OrderStatus.COMPLETED as string)) {
      throw new BadRequestException('Order belum selesai, belum bisa diulas');
    }

    const existing = await this.vendorProductReviewRepository.findOne({
      where: { order: { id: order.id } },
    });
    if (existing) {
      throw new ConflictException('Order ini sudah pernah diulas');
    }

    const review = this.vendorProductReviewRepository.create({
      order,
      customer: order.customer,
      vendor: order.vendor,
      vendorProduct: order.vendorProduct,
      rating: dto.rating,
      comment: dto.comment,
      active: true,
      createdBy: String(requestUserId),
      createdAt: new Date(),
    });

    const saved = await this.vendorProductReviewRepository.save(review);

    await this.attachReviewImages(saved.id, files.images ?? [], String(requestUserId));

    return await this.findOne(saved.id);
  }
  //========================================================================================

  //============================ HELPER: UPLOAD GAMBAR ULASAN (multi, create-only, tanpa replace) ==============================
  private async attachReviewImages(
    reviewId: string,
    files: Express.Multer.File[],
    actorUserId: string | null,
  ): Promise<void> {
    for (const [index, file] of files.entries()) {
      try {
        await this.attachmentService.create(
          file,
          {
            referenceTable: VENDOR_PRODUCT_REVIEW_REFERENCE_TABLE,
            referenceId: Number(reviewId),
            category: REVIEW_PHOTO_ATTACHMENT_CATEGORY,
            sortOrder: index,
          },
          actorUserId,
        );
      } catch (error: any) {
        this.logger.warn(
          `Gagal upload gambar ulasan ke-${index}: ${error.message}`,
        );
      }
    }
  }
  //========================================================================================

  //============================ HELPER: HITUNG JUMLAH ULASAN PER BINTANG (1-5) ==============================
  private async computeRatingBreakdown(
    baseWhere: FindOptionsWhere<VendorProductReview>,
  ): Promise<Record<1 | 2 | 3 | 4 | 5, number>> {
    const reviews = await this.vendorProductReviewRepository.find({
      where: baseWhere,
    });

    const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const review of reviews) {
      const rating = review.rating as 1 | 2 | 3 | 4 | 5;
      if (breakdown[rating] !== undefined) {
        breakdown[rating] += 1;
      }
    }
    return breakdown;
  }
  //========================================================================================

  //============================ HELPER: SUSUN REVIEW + IMAGE ATTACHMENT IDS ==============================
  private async attachImageIds(review: VendorProductReview) {
    const images = await this.attachmentService.findAll({
      referenceTable: VENDOR_PRODUCT_REVIEW_REFERENCE_TABLE,
      referenceId: Number(review.id),
      category: REVIEW_PHOTO_ATTACHMENT_CATEGORY,
      pageNumber: 1,
      pageSize: 20,
    });

    return {
      ...review,
      imageAttachmentIds: images.data.map((attachment) => attachment.id),
    };
  }
  //========================================================================================

  private async getReviewOrThrow(id: string): Promise<VendorProductReview> {
    const review = await this.vendorProductReviewRepository.findOne({
      where: { id },
      relations: { order: true, customer: true, vendor: true, vendorProduct: true },
    });

    if (!review) {
      throw new NotFoundException('Vendor product review not found');
    }

    return review;
  }

}
