import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Otp } from '../entities/otp.entity';
import { MailService } from '../mail/mail.service';
import { OtpPurpose } from './otp-purpose.enum';
import { UsersService } from '../../users/users.service';

const OTP_LENGTH = 6;
const MAX_ATTEMPT_COUNT = 5;

@Injectable()
export class OtpService {

  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  //=========================== GENERATE, SIMPAN, DAN KIRIM OTP VIA EMAIL ===========================
  async sendOtp(userId: number, email: string, purpose: OtpPurpose): Promise<void> {
    await this.generateAndSendOtp(userId, email, purpose, 0);
  }
  //=======================================================================

  //=========================== KIRIM ULANG OTP (RESEND) ===========================
  async resendOtp(email: string, purpose: OtpPurpose): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email tidak ditemukan');
    }

    // OTP lama tidak ditandai is_used di sini - is_used hanya berubah lewat endpoint verify OTP.
    // OTP baru otomatis jadi satu-satunya yang aktif karena findActiveOtp selalu ambil yang terbaru.
    const activeOtp = await this.findActiveOtp(user.id, purpose);
    const nextResendCount = activeOtp ? activeOtp.resendCount + 1 : 0;

    await this.generateAndSendOtp(user.id, user.email, purpose, nextResendCount);
  }
  //=======================================================================

  //=========================== VERIFIKASI OTP ===========================
  async verifyOtp(email: string, otpCode: string, purpose: OtpPurpose): Promise<{ userId: number; email: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email atau kode OTP tidak valid');
    }

    const otp = await this.findActiveOtp(user.id, purpose);

    if (!otp) {
      throw new BadRequestException('Kode OTP tidak ditemukan atau sudah digunakan, silakan minta kode OTP baru');
    }

    if (otp.attemptCount >= MAX_ATTEMPT_COUNT) {
      throw new BadRequestException('Terlalu banyak percobaan yang salah, silakan minta kode OTP baru');
    }

    if (otp.expiredAt.getTime() < Date.now()) {
      throw new BadRequestException('Kode OTP sudah kedaluwarsa, silakan minta kode OTP baru');
    }

    const isMatch = otpCode === otp.otpCode;
    if (!isMatch) {
      await this.otpRepository.update(otp.id, {
        attemptCount: otp.attemptCount + 1,
        modifiedAt: new Date(),
      });
      throw new BadRequestException('Kode OTP salah');
    }

    await this.otpRepository.update(otp.id, {
      isUsed: true,
      verifiedAt: new Date(),
      modifiedAt: new Date(),
    });

    if (purpose === OtpPurpose.REGISTER) {
      await this.usersService.markEmailVerified(user.id);
    }

    return { userId: user.id, email: user.email };
  }
  //=======================================================================

  //=========================== PASTIKAN OTP FORGOT PASSWORD SUDAH TERVERIFIKASI ===========================
  async assertForgotPasswordVerified(email: string): Promise<{ userId: number; email: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email tidak ditemukan');
    }

    const otp = await this.otpRepository.findOne({
      where: {
        userId: user.id,
        purpose: OtpPurpose.FORGOT_PASSWORD,
        isUsed: true,
        verifiedAt: Not(IsNull()),
      },
      order: { verifiedAt: 'DESC' },
    });

    const resetSessionMinutes = Number(this.configService.get('OTP_RESET_SESSION_MINUTES', 10));
    const isWithinResetSession =
      otp?.verifiedAt && otp.verifiedAt.getTime() + resetSessionMinutes * 60 * 1000 >= Date.now();

    if (!isWithinResetSession) {
      throw new BadRequestException(
        'Verifikasi OTP forgot password diperlukan dan belum kedaluwarsa sebelum mengubah password',
      );
    }

    return { userId: user.id, email: user.email };
  }
  //=======================================================================

  //============================ HELPER: CARI OTP AKTIF (BELUM DIPAKAI) ==============================
  private async findActiveOtp(userId: number, purpose: OtpPurpose): Promise<Otp | null> {
    return await this.otpRepository.findOne({
      where: { userId, purpose, isUsed: false },
      order: { createdAt: 'DESC' },
    });
  }
  //=======================================================================

  //============================ HELPER: GENERATE, SIMPAN, DAN KIRIM OTP BARU ==============================
  private async generateAndSendOtp(
    userId: number,
    email: string,
    purpose: OtpPurpose,
    resendCount: number,
  ): Promise<void> {
    const now = new Date();
    const otpCode = this.generateOtpCode();
    const expiresInMinutes = Number(this.configService.get('OTP_EXPIRES_IN_MINUTES', 5));

    const otp = this.otpRepository.create({
      userId,
      otpCode,
      purpose,
      resendCount,
      expiredAt: new Date(now.getTime() + expiresInMinutes * 60 * 1000),
      lastSentAt: now,
      createdAt: now,
      createdBy: email,
    });
    await this.otpRepository.save(otp);

    await this.mailService.sendOtpEmail(email, otpCode, purpose);
  }
  //=======================================================================

  //============================ HELPER: GENERATE KODE OTP NUMERIK ==============================
  private generateOtpCode(): string {
    return crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, '0');
  }
  //=======================================================================
}
