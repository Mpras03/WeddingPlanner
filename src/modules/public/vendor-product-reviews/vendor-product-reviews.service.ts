import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  // jadi endpoint ini tidak discope ke caller sendiri — beda dengan orders yang privat.
  async findAll(query: FindAllVendorProductReviewDto) {

    const { vendorProductId, vendorId, customerId, rating, pageNumber = 1, pageSize = 10 } = query;

    const [data, total] = await this.vendorProductReviewRepository.findAndCount({
      where: {
        ...(vendorProductId ? { vendorProduct: { id: String(vendorProductId) } } : {}),
        ...(vendorId ? { vendor: { id: vendorId } } : {}),
        ...(customerId ? { customer: { id: customerId } } : {}),
        ...(rating ? { rating } : {}),
      },
      relations: {
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

    return {
      data: dataWithImages,
      total,
      pageNumber,
      pageSize,
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
      relations: { customer: true, vendor: true, vendorProduct: true },
    });

    if (!review) {
      throw new NotFoundException('Vendor product review not found');
    }

    return review;
  }

}
