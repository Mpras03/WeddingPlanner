import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ResponseMessage } from '../../../common/response/decorators/response-message.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttachmentService } from './attachment.service';
import {
  ApiCreateAttachment,
  ApiDeleteAttachment,
  ApiFindAllAttachment,
  ApiFindOneAttachment,
  ApiGetAttachmentFile,
  ApiUpdateAttachment,
} from './decorators/attachment-swagger.decorator';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { FindAllAttachmentDto } from './dto/find-all-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';

@ApiTags('Attachments')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Get()
  @ResponseMessage('Success Get All Attachment')
  @ApiFindAllAttachment()
  findAll(@Query() query: FindAllAttachmentDto) {
    return this.attachmentService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage('Success Get Attachment By Id')
  @ApiFindOneAttachment()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attachmentService.findOne(String(id));
  }

  @Get(':id/file')
  @ApiGetAttachmentFile()
  async getFile(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const { attachment, stream } = await this.attachmentService.getFileStream(
      String(id),
    );
    res.set({
      'Content-Type': attachment.mimeType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(attachment.originalName)}"`,
      'Content-Length': attachment.sizeBytes,
    });
    stream.pipe(res);
  }

  @Post()
  @ResponseMessage('Success Upload Attachment')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiCreateAttachment()
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateAttachmentDto,
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.attachmentService.create(file, dto, user?.userId ?? null);
  }

  @Put(':id')
  @ResponseMessage('Success Update Attachment')
  @ApiUpdateAttachment()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttachmentDto,
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.attachmentService.update(String(id), dto, user?.userId ?? null);
  }

  @Delete(':id')
  @ResponseMessage('Success Delete Attachment')
  @ApiDeleteAttachment()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attachmentService.remove(String(id));
  }
}
