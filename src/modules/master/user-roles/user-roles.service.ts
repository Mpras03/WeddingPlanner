import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { UserRole } from './entities/user-role.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { FindAllUserRolesDto } from './dto/find-all-user-roles.dto';

@Injectable()
export class UserRolesService {

    constructor(

    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

  ) {}

  //=========================== GET ALL USER ROLES (PAGINATION) ======================================
  async findAll(query: FindAllUserRolesDto) {
    const { filter, pageNumber = 1, pageSize = 10 } = query;

    const [data, total] = await this.userRoleRepository.findAndCount({
      where: filter
        ? [
            { user: { fullname: ILike(`%${filter}%`) } },
            { user: { email: ILike(`%${filter}%`) } },
            { role: { roleName: ILike(`%${filter}%`) } },
          ]
        : {},
      relations: {
        user: true,
        role: true,
      },
      order: {
        id: 'ASC',
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    return {
      data: data.map((item) => ({
        id: item.id,
        userId: item.user.id,
        fullname: item.user.fullname,
        email: item.user.email,
        roleId: item.role.id,
        roleName: item.role.roleName,
        isPrimary: item.isPrimary,
        description: item.description,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt ?? null,
      })),
      total,
      pageNumber,
      pageSize,
    };
  }
  //========================================================================================

  //=========================== CREATE USER ROLE ======================================
  async create(userId: number, dto: CreateUserRoleDto) {

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.roleRepository.findOne({
      where: { id: dto.roleId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const existing = await this.userRoleRepository.findOne({
      where: {
        user: { id: userId },
        role: { id: dto.roleId },
      },
    });
    if (existing) {
      throw new ConflictException('User already has this role');
    }

    // Validasi: isPrimary hanya boleh 1 untuk 1 user -> unset primary lain jika perlu
    if (dto.isPrimary) {
      await this.unsetOtherPrimaryRoles(userId);
    }

    const userRole = this.userRoleRepository.create({
      user,
      role,
      description: role.description,
      isPrimary: dto.isPrimary ?? false,
      createdAt: new Date(),
    });

    const saved = await this.userRoleRepository.save(userRole);

    return {
      id: saved.id,
      userId: user.id,
      fullname: user.fullname,
      email: user.email,
      roleId: role.id,
      roleName: role.roleName,
      isPrimary: saved.isPrimary,
      createdAt: saved.createdAt,
    };
  }
  //========================================================================================

  //============================ FIND ROLE BY USER =========================================
  async findRolesByUser(userId: number) {

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userRoles = await this.userRoleRepository.find({
      where: {
        user: { id: userId },
      },
      relations: {
        role: true,
      },
      order: {
        role: { roleName: 'ASC' },
      },
    });

    return {
      userId: user.id,
      email: user.email,
      fullname: user.fullname,
      roles: userRoles.map((item) => ({
        id: item.role.id,
        roleName: item.role.roleName,
        isPrimary: item.isPrimary,
      })),
    };
  }
  //========================================================================================

  //============================ UPDATE USER ROLE =========================================
  async update(id: number, dto: UpdateUserRoleDto) {

    const userRole = await this.userRoleRepository.findOne({
      where: { id },
      relations: {
        user: true,
        role: true,
      },
    });
    if (!userRole) {
      throw new NotFoundException('User role not found');
    }

    // Resolve target user (pindah ke user lain jika diminta)
    let targetUser = userRole.user;
    if (dto.userId && dto.userId !== userRole.user.id) {
      const newUser = await this.userRepository.findOne({
        where: { id: dto.userId },
      });
      if (!newUser) {
        throw new NotFoundException('User not found');
      }
      targetUser = newUser;
    }

    // Resolve target role (ganti role jika diminta)
    let targetRole = userRole.role;
    if (dto.roleId && dto.roleId !== userRole.role.id) {
      const newRole = await this.roleRepository.findOne({
        where: { id: dto.roleId },
      });
      if (!newRole) {
        throw new NotFoundException('Role not found');
      }
      targetRole = newRole;
    }

    // Cek duplicate assignment (kombinasi user + role sama, selain record ini sendiri)
    const isUserOrRoleChanged =
      (dto.userId && dto.userId !== userRole.user.id) ||
      (dto.roleId && dto.roleId !== userRole.role.id);

    if (isUserOrRoleChanged) {
      const duplicate = await this.userRoleRepository.findOne({
        where: {
          user: { id: targetUser.id },
          role: { id: targetRole.id },
        },
        relations: { user: true, role: true },
      });
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('User already has this role');
      }
    }

    // Validasi: isPrimary hanya boleh 1 untuk 1 user -> unset primary lain jika perlu
    if (dto.isPrimary) {
      await this.unsetOtherPrimaryRoles(targetUser.id, id);
    }

    userRole.user = targetUser;
    userRole.role = targetRole;

    if (dto.isPrimary !== undefined) {
      userRole.isPrimary = dto.isPrimary;
    }

    userRole.updatedAt = new Date();

    const saved = await this.userRoleRepository.save(userRole);

    return {
      id: saved.id,
      userId: targetUser.id,
      fullname: targetUser.fullname,
      email: targetUser.email,
      roleId: targetRole.id,
      roleName: targetRole.roleName,
      isPrimary: saved.isPrimary,
      updatedAt: saved.updatedAt,
    };
  }
  //========================================================================================

  //============================ DELETE USER ROLE BY USER ID and ROLE ID =========================================
  async removeRole(userId: number, roleId: number): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({
      where: {
        user: { id: userId },
        role: { id: roleId },
      },
    });

    if (!userRole) {
      throw new NotFoundException('User role not found');
    }
    await this.userRoleRepository.remove(userRole);
  }
  //========================================================================================

  //============================ HELPER: UNSET PRIMARY ROLE LAIN MILIK USER YANG SAMA =========================================
  private async unsetOtherPrimaryRoles(userId: number, excludeUserRoleId?: number): Promise<void> {
    const primaryRoles = await this.userRoleRepository.find({
      where: {
        user: { id: userId },
        isPrimary: true,
      },
    });

    const toUnset = primaryRoles.filter((item) => item.id !== excludeUserRoleId);
    if (toUnset.length === 0) {
      return;
    }

    const now = new Date();
    toUnset.forEach((item) => {
      item.isPrimary = false;
      item.updatedAt = now;
    });

    await this.userRoleRepository.save(toUnset);
  }
  //========================================================================================

}