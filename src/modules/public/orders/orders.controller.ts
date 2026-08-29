import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { FindAllOrderDto } from './dto/find-all-order.dto';
import { RejectOrderDto } from './dto/reject-order.dto';
import { JwtAuthGuard } from '../../master/auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/response/decorators/response-message.decorator';
import {
  ApiFindAllOrder,
  ApiFindOneOrder,
  ApiCreateOrder,
  ApiConfirmOrder,
  ApiRejectOrder,
} from './decorators/orders-swagger.decorator';

@ApiTags('Orders')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {

  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  @Get()
  @ResponseMessage("Success Get All Order")
  @ApiFindAllOrder()
  findAll(
    @Query() query: FindAllOrderDto,
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.ordersService.findAll(query, user?.userId ?? null);
  }

  @Get(':id')
  @ResponseMessage("Success Get Order By Id")
  @ApiFindOneOrder()
  findOne(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.ordersService.findOne(id, user?.userId ?? null);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage("Success Create Order")
  @ApiCreateOrder()
  create(
    @Body() dto: CreateOrderDto,
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.ordersService.create(dto, user?.userId ?? null);
  }

  @Put(':id/confirm')
  @ResponseMessage("Success Confirm Order")
  @ApiConfirmOrder()
  confirm(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.ordersService.confirm(id, user?.userId ?? null);
  }

  @Put(':id/reject')
  @ResponseMessage("Success Reject Order")
  @ApiRejectOrder()
  reject(
    @Param('id') id: string,
    @Body() dto: RejectOrderDto,
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.ordersService.reject(id, dto, user?.userId ?? null);
  }

}
