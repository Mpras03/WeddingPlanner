import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptographyService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly secretKey: Buffer;

  constructor() {
    const key = process.env.CRYPTO_SECRET_KEY;
    if (!key) {
      throw new InternalServerErrorException(
        'CRYPTO_SECRET_KEY is not defined in environment variables',
      );
    }
    // Normalize key jadi 32 byte (kebutuhan aes-256)
    this.secretKey = crypto.createHash('sha256').update(key).digest();
  }

  encrypt(plainText: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);

    // format: <iv>:<encrypted>, keduanya base64
    return `${iv.toString('base64')}:${encrypted.toString('base64')}`;
  }

  decrypt(cipherText: string): string {
    try {
      const [ivPart, encryptedPart] = cipherText.split(':');
      if (!ivPart || !encryptedPart) {
        throw new Error('Invalid format');
      }

      const iv = Buffer.from(ivPart, 'base64');
      const encrypted = Buffer.from(encryptedPart, 'base64');

      const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv);
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      throw new BadRequestException('Invalid or corrupted cipher text');
    }
  }
}