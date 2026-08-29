import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import type { Request } from 'express';
import { OrderPaymentsService } from './order-payments.service';
import { FindAllOrderPaymentDto } from './dto/find-all-order-payment.dto';
import { RejectOrderPaymentDto } from './dto/reject-order-payment.dto';
import { JwtAuthGuard } from '../../master/auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/response/decorators/response-message.decorator';
import {
  ApiFindAllOrderPayment,
  ApiFindOneOrderPayment,
  ApiSubmitOrderPaymentProof,
  ApiVerifyOrderPayment,
  ApiRejectOrderPayment,
} from './decorators/order-payments-swagger.decorator';

@ApiTags('Order Payments')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('order-payments')
export class OrderPaymentsController {

  constructor(
    private readonly orderPaymentsService: OrderPaymentsService,
  ) {}

  @Get()
  @ResponseMessage("Success Get All Order Payment")
  @ApiFindAllOrderPayment()
  findAll(
    @Query() query: FindAllOrderPaymentDto,
  ) {
    return this.orderPaymentsService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage("Success Get Order Payment By Id")
  @ApiFindOneOrderPayment()
  findOne(
    @Param('id') id: string,
  ) {
    return this.orderPaymentsService.findOne(id);
  }

  @Put(':id/proof')
  @ResponseMessage("Success Submit Payment Proof")
  @UseInterceptors(FileInterceptor('proof'))
  @ApiConsumes('multipart/form-data')
  @ApiSubmitOrderPaymentProof()
  submitProof(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.orderPaymentsService.submitProof(id, file, user?.userId ?? null);
  }

  @Put(':id/verify')
  @ResponseMessage("Success Verify Order Payment")
  @ApiVerifyOrderPayment()
  verify(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.orderPaymentsService.verify(id, user?.userId ?? null);
  }

  @Put(':id/reject')
  @ResponseMessage("Success Reject Order Payment")
  @ApiRejectOrderPayment()
  reject(
    @Param('id') id: string,
    @Body() dto: RejectOrderPaymentDto,
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.orderPaymentsService.reject(id, dto, user?.userId ?? null);
  }

}
