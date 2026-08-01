import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CryptographyService } from '../cryptography/cryptography.service';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../user-roles/entities/user-role.entity';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly cryptographyService: CryptographyService,

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