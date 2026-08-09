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
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { FindAllContactDto } from './dto/find-all-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/response/decorators/response-message.decorator';
import {
  ApiGetAllContact,
  ApiGetContactById,
  ApiCreateContact,
  ApiUpdateContact,
  ApiDeleteContact,
} from './decorators/contacts-swagger.decorator';

@ApiTags('Contacts')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get('user/:userId')
  @ResponseMessage('Success Get All Contact')
  @ApiGetAllContact()
  findAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: FindAllContactDto,
  ) {
    return this.contactsService.findAllByUser(userId, query);
  }

  @Get(':id')
  @ResponseMessage('Success Get Contact By Id')
  @ApiGetContactById()
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Post('user/:userId')
  @ResponseMessage('Success Create Contact')
  @ApiCreateContact()
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateContactDto,
  ) {
    return this.contactsService.create(userId, dto);
  }

  @Put(':id')
  @ResponseMessage('Success Update Contact')
  @ApiUpdateContact()
  update(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.contactsService.update(id, dto);
  }

  @Delete(':id')
  @ResponseMessage('Success Delete Contact')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteContact()
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }
}
