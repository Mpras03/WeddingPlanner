import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
  return await this.roleRepository.find();
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

}