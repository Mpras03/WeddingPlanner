import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CryptographyService } from '../cryptography/cryptography.service';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../user-roles/entities/user-role.entity';
import { OtpService } from './otp/otp.service';
import { OtpPurpose } from './otp/otp-purpose.enum';

// minimal 8 karakter, minimal 1 huruf besar, minimal 1 angka, minimal 1 simbol
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly cryptographyService: CryptographyService,
        private readonly otpService: OtpService,

        @InjectRepository(UserRole)
        private readonly userRoleRepository: Repository<UserRole>,
    ) {}

    //============================== VALIDATE USER ===================================
    async validateUser(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException(
            'Email atau password salah',
            );
        }

        // decrypt password yang dikirim client (cipherText -> plainText)
        let incomingPassword: string;
        try {
            incomingPassword = this.cryptographyService.decrypt(loginDto.password);
        } catch {
            throw new UnauthorizedException(
            'Email atau password salah',
            );
        }

        // decrypt password yang tersimpan di database
        let storedPassword: string;
        try {
            storedPassword = this.cryptographyService.decrypt(user.passwordHash);
        } catch {
            throw new UnauthorizedException(
            'Email atau password salah',
            );
        }

        if (incomingPassword !== storedPassword) {
            throw new UnauthorizedException(
            'Email atau password salah',
            );
        }

        return user;
    }
    //=======================================================================

    //=========================== LOGIN =====================================
    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto);
        const payload = {
            sub: user.id,
            email: user.email,
            fullname: user.fullname,
        };

        const { roles, listRoles } = await this.getUserRoles(user.id);

        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
            id: user.id,
            email: user.email,
            fullname: user.fullname,
            phoneNumber: user.phoneNumber,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            },
            roles,
            listRoles,
        };
    }
    //=======================================================================

    //============================= LOGOUT ==================================
    logout() {
        return null;
    }
    //=======================================================================

    //========================== VERIFY OTP =================================
    async verifyOtp(dto: VerifyOtpDto) {
        const result = await this.otpService.verifyOtp(dto.email, dto.otpCode, dto.purpose);

        return {
            email: result.email,
            purpose: dto.purpose,
            verified: true,
        };
    }
    //=======================================================================

    //========================== RESEND OTP =================================
    async resendOtp(dto: ResendOtpDto) {
        await this.otpService.resendOtp(dto.email, dto.purpose);

        return {
            email: dto.email,
            purpose: dto.purpose,
            sent: true,
        };
    }
    //=======================================================================

    //========================== FORGOT PASSWORD =================================
    async forgotPassword(dto: ForgotPasswordDto) {
        // pakai mekanisme resend: OTP aktif sebelumnya (kalau ada) dinonaktifkan dulu sebelum kode baru dikirim
        await this.otpService.resendOtp(dto.email, OtpPurpose.FORGOT_PASSWORD);

        return {
            email: dto.email,
            purpose: OtpPurpose.FORGOT_PASSWORD,
            sent: true,
        };
    }
    //=======================================================================

    //========================== CHANGE PASSWORD (SETELAH OTP FORGOT PASSWORD TERVERIFIKASI) ====
    async changePassword(dto: ChangePasswordDto) {
        const { userId, email } = await this.otpService.assertForgotPasswordVerified(dto.email);

        const newPassword = this.decryptPassword(dto.newPassword);
        const confirmNewPassword = this.decryptPassword(dto.confirmNewPassword);

        this.validatePasswordMatch(newPassword, confirmNewPassword);
        this.validatePasswordStrength(newPassword);

        // simpan cipherText asli, tidak perlu di-encrypt ulang (konsisten dengan alur register/login)
        await this.usersService.updatePasswordHash(userId, dto.newPassword);

        return {
            email,
            changed: true,
        };
    }
    //=======================================================================

    //============================ HELPER: DECRYPT PASSWORD DARI FRONTEND ==============================
    private decryptPassword(cipherText: string): string {
        try {
            return this.cryptographyService.decrypt(cipherText);
        } catch {
            throw new BadRequestException('Format password tidak valid');
        }
    }
    //=======================================================================

    //============================ HELPER: VALIDASI PASSWORD SAMA DENGAN KONFIRMASI ==============================
    private validatePasswordMatch(password: string, confirmPassword: string): void {
        if (password !== confirmPassword) {
            throw new BadRequestException('Password dan konfirmasi password tidak sama');
        }
    }
    //=======================================================================

    //============================ HELPER: VALIDASI KEKUATAN PASSWORD ==============================
    private validatePasswordStrength(password: string): void {
        if (!PASSWORD_REGEX.test(password)) {
            throw new BadRequestException(
                'Password minimal 8 karakter dan harus mengandung minimal 1 huruf besar, 1 angka, dan 1 simbol',
            );
        }
    }
    //=======================================================================

    //==================== PROFILE ==============================
    async profile(userId: number) {
        const user = await this.usersService.findOne(userId);
        const { roles, listRoles } = await this.getUserRoles(userId);

        return {
            id: user.id,
            email: user.email,
            fullname: user.fullname,
            roles,
            listRoles,
        };
    }
    //=======================================================================

    //==================== GET USER ROLES (roles primary + listRoles) ==============================
    private async getUserRoles(userId: number) {
        const userRoles = await this.userRoleRepository.find({
            where: {
                user: {
                    id: userId,
                },
            },
            relations: {
                role: true,
            },
        });

        const listRoles = userRoles.map(x => ({
            id: x.role.id,
            roleName: x.role.roleName,
        }));

        const primary = userRoles.find(x => x.isPrimary);
        const roles = primary
            ? { id: primary.role.id, roleName: primary.role.roleName }
            : null;

        return { roles, listRoles };
    }
    //=======================================================================
}