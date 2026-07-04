import { ConflictException, Injectable, NotFoundException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './entities/user-role.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserRoleDto } from './dto/create-user-role.dto';

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

  //=========================== CREATE USER ROLE ======================================
  async create(userId: number, dto: CreateUserRoleDto,): Promise<UserRole> {
  // Cari user
  const user = await this.userRepository.findOne({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Cari role
  const role = await this.roleRepository.findOne({
    where: {
      id: dto.roleId,
    },
  });
  if (!role) {
    throw new NotFoundException('Role not found');
  }

  // Cek duplicate
  const existing = await this.userRoleRepository.findOne({
    where: {
      user: {
        id: userId,
      },
      role: {
        id: dto.roleId,
      },
    },
    relations: {
    user: true,
    role: true,
  },
  });

  if (existing) {
    throw new ConflictException(
      'User already has this role',
    );
  }

  // Buat entity
  const userRole = this.userRoleRepository.create({
    user,
    userName: user.username,
    role,
    roleName: role.roleName,
    description: role.description,
    createdAt: new Date(),
  });
  return await this.userRoleRepository.save(userRole);
}
//========================================================================================

//============================ FIND ROLE BY USER =========================================
  async findRolesByUser(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userRoles = await this.userRoleRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        role: true,
      },
      order: {
        roleName: 'ASC',
      },
    });

    return {
      userId: user.id,
      username: user.username,
      name: user.name,
      roles: userRoles.map((item) => ({
        id: item.role.id,
        roleName: item.role.roleName,
      })),
    };

  }
//========================================================================================

//============================ DELETE USER ROLE BY USER ID and ROLE ID =========================================
  async removeRole(userId: number, roleId: number, ): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        role: {
          id: roleId,
        },
      },
    });

    if (!userRole) {
      throw new NotFoundException(
        'User role not found',
      );
    }
    await this.userRoleRepository.remove(userRole);
  }
//========================================================================================

}
