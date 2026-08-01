import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ILike, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FindAllRoleDto } from './dto/find-all-role.dto';

@Injectable()
export class RolesService {

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(query: FindAllRoleDto) {

    const { filter, pageNumber = 1, pageSize = 10 } = query;

    const [data, total] = await this.roleRepository.findAndCount({
      where: filter ? { roleName: ILike(`%${filter}%`) } : {},
      order: { id: 'DESC' },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    return {
      data,
      total,
      pageNumber,
      pageSize,
    };
  }

  async create(dto: CreateRoleDto): Promise<Role> {

    const role = this.roleRepository.create({
        roleName: dto.roleName,
        description: dto.description,
        active: dto.active,
        createdAt: new Date(),
    });

    return await this.roleRepository.save(role);
  }

  async update(
    id: number,
    dto: UpdateRoleDto,
    ): Promise<Role> {

    const role = await this.findOne(id);

    Object.assign(role, dto);

    role.updatedAt = new Date();

    return await this.roleRepository.save(role);

  }

  async remove(id: number): Promise<void> {

    const role = await this.findOne(id);
    await this.roleRepository.remove(role);

  }

  async findOne(id: number): Promise<Role> {

  const role = await this.roleRepository.findOne({
        where: {
        id,
        },
    });

    if (!role) {
        throw new NotFoundException('Role not found');
    }

    return role;
  }

}