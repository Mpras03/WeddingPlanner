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
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import type { Request } from 'express';
import { VerificationDocumentsService } from './verification-documents.service';
import { CreateVerificationDocumentDto } from './dto/create-verification-document.dto';
import { UpdateVerificationDocumentDto } from './dto/update-verification-document.dto';
import { FindAllVerificationDocumentDto } from './dto/find-all-verification-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from '../../../common/response/decorators/response-message.decorator';
import {
  ApiGetAllVerificationDocument,
  ApiGetVerificationDocumentById,
  ApiCreateVerificationDocument,
  ApiUpdateVerificationDocument,
  ApiDeleteVerificationDocument,
} from './decorators/verification-documents-swagger.decorator';

@ApiTags('Verification Documents')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('verification-documents')
export class VerificationDocumentsController {
  constructor(
    private readonly verificationDocumentsService: VerificationDocumentsService,
  ) {}

  @Get('user/:userId')
  @ResponseMessage('Success Get All Verification Document')
  @ApiGetAllVerificationDocument()
  findAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: FindAllVerificationDocumentDto,
  ) {
    return this.verificationDocumentsService.findAllByUser(userId, query);
  }

  @Get(':id')
  @ResponseMessage('Success Get Verification Document By Id')
  @ApiGetVerificationDocumentById()
  findOne(@Param('id') id: string) {
    return this.verificationDocumentsService.findOne(id);
  }

  @Post('user/:userId')
  @ResponseMessage('Success Create Verification Document')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiCreateVerificationDocument()
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateVerificationDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.verificationDocumentsService.create(
      userId,
      dto,
      file,
      user?.userId ?? null,
    );
  }

  @Put(':id')
  @ResponseMessage('Success Update Verification Document')
  @ApiUpdateVerificationDocument()
  update(@Param('id') id: string, @Body() dto: UpdateVerificationDocumentDto) {
    return this.verificationDocumentsService.update(id, dto);
  }

  @Delete(':id')
  @ResponseMessage('Success Delete Verification Document')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteVerificationDocument()
  remove(@Param('id') id: string) {
    return this.verificationDocumentsService.remove(id);
  }
}
