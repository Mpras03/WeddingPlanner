import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../user-roles/entities/user-role.entity';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,

        @InjectRepository(UserRole)
        private readonly userRoleRepository: Repository<UserRole>,
    ) {}

    //============================== VALIDATE USER ===================================
    async validateUser(loginDto: LoginDto) {
        const user = await this.usersService.findByUsername(loginDto.username);
        if (!user) {
            throw new UnauthorizedException(
            'Username atau password salah',
            );
        }

        const isPasswordValid = await bcrypt.compare(
            loginDto.password,
            user.passwordHash,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException(
            'Username atau password salah',
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
            username: user.username,
            name: user.name,
        };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
            id: user.id,
            username: user.username,
            name: user.name,
            },
        };
    }
    //=======================================================================

    //==================== PROFILE ==============================
    async profile(userId: number) {
        const user = await this.usersService.findOne(userId);
        const roles = await this.userRoleRepository.find({
            where: {
                user: {
                    id: userId,
                },
            },
            relations: {
                role: true,
            },
        });
        return {
            id: user.id,
            username: user.username,
            name: user.name,
            roles: roles.map(x => ({
                id: x.role.id,
                roleName: x.role.roleName,
            })),
        };
    }
}
