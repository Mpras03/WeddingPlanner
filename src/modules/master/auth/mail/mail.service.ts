import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { OtpPurpose } from '../otp/otp-purpose.enum';

const OTP_PURPOSE_LABEL: Record<OtpPurpose, string> = {
  [OtpPurpose.REGISTER]: 'verifikasi email registrasi',
  [OtpPurpose.FORGOT_PASSWORD]: 'reset password',
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: Number(this.configService.get('MAIL_PORT', 587)),
      secure: this.configService.get<string>('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('MAIL_USERNAME'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  //=========================== KIRIM EMAIL OTP ===========================
  async sendOtpEmail(to: string, otpCode: string, purpose: OtpPurpose): Promise<void> {
    const expiresInMinutes = this.configService.get('OTP_EXPIRES_IN_MINUTES', 5);
    const purposeLabel = OTP_PURPOSE_LABEL[purpose] ?? purpose;

    const fromName = this.configService.get<string>('MAIL_FROM_NAME', 'Wedding Planner');
    const fromAddress = this.configService.get<string>('MAIL_FROM_ADDRESS', 'no-reply@weddingplanner.com');

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to,
        subject: `Kode OTP untuk ${purposeLabel}`,
        html: `
          <p>Kode OTP Anda untuk ${purposeLabel} adalah:</p>
          <h2 style="letter-spacing: 4px;">${otpCode}</h2>
          <p>Kode ini berlaku selama ${expiresInMinutes} menit. Jangan bagikan kode ini kepada siapa pun.</p>
        `,
      });
    } catch (error: any) {
      // SMTP belum dikonfigurasi (masih pakai mail zeno untuk testing) -> jangan gagalkan alur utama,
      // cukup log agar OTP tetap bisa ditest secara manual dari console/database.
      this.logger.warn(
        `Gagal mengirim email OTP ke ${to} untuk purpose "${purpose}". OTP code: ${otpCode}. Error: ${error.message}`,
      );
    }
  }
  //=======================================================================
}
