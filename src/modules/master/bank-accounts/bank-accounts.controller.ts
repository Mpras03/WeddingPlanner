import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { FindAllBankAccountDto } from './dto/find-all-bank-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/response/decorators/response-message.decorator';
import {
  ApiGetAllBankAccount,
  ApiGetBankAccountById,
  ApiCreateBankAccount,
  ApiUpdateBankAccount,
  ApiDeleteBankAccount,
} from './decorators/bank-accounts-swagger.decorator';

@ApiTags('Bank Accounts')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Get('user/:userId')
  @ResponseMessage('Success Get All Bank Account')
  @ApiGetAllBankAccount()
  findAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: FindAllBankAccountDto,
  ) {
    return this.bankAccountsService.findAllByUser(userId, query);
  }

  @Get(':id')
  @ResponseMessage('Success Get Bank Account By Id')
  @ApiGetBankAccountById()
  findOne(@Param('id') id: string) {
    return this.bankAccountsService.findOne(id);
  }

  @Post('user/:userId')
  @ResponseMessage('Success Create Bank Account')
  @ApiCreateBankAccount()
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateBankAccountDto,
  ) {
    return this.bankAccountsService.create(userId, dto);
  }

  @Put(':id')
  @ResponseMessage('Success Update Bank Account')
  @ApiUpdateBankAccount()
  update(@Param('id') id: string, @Body() dto: UpdateBankAccountDto) {
    return this.bankAccountsService.update(id, dto);
  }

  @Delete(':id')
  @ResponseMessage('Success Delete Bank Account')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteBankAccount()
  remove(@Param('id') id: string) {
    return this.bankAccountsService.remove(id);
  }
}
