import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CryptographyService } from './cryptography.service';
import { EncryptDataDto } from './dto/encrypt-data.dto';
import { DecryptDataDto } from './dto/decrypt-data.dto';
import { ResponseMessage } from '../common/response/decorators/response-message.decorator';
import { ApiEncryptData, ApiDecryptData } from './decorators/cryptography-swagger.decorator';

@ApiTags('Cryptography')
@Controller('cryptography')
export class CryptographyController {
  constructor(private readonly cryptographyService: CryptographyService) {}

  @Post('encrypt')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Success Encrypt Data')
  @ApiEncryptData()
  encrypt(@Body() dto: EncryptDataDto) {
    const cipherText = this.cryptographyService.encrypt(dto.plainText);
    return { cipherText };
  }

  @Post('decrypt')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Success Decrypt Data')
  @ApiDecryptData()
  decrypt(@Body() dto: DecryptDataDto) {
    const plainText = this.cryptographyService.decrypt(dto.cipherText);
    return { plainText };
  }
}