import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ILike, Repository } from 'typeorm';
import { ParameterHeader } from './entities/parameter-header.entity';
import { ParameterDetail } from './entities/parameter-detail.entity';
import { CreateParameterDto } from './dto/create-parameter.dto';
import { UpdateParameterDto } from './dto/update-parameter.dto';
import { FindAllParameterDto } from './dto/find-all-parameter.dto';

@Injectable()
export class ParameterService {
  constructor(
    @InjectRepository(ParameterHeader)
    private readonly parameterHeaderRepository: Repository<ParameterHeader>,
    @InjectRepository(ParameterDetail)
    private readonly parameterDetailRepository: Repository<ParameterDetail>,
  ) {}

  async findAll(query: FindAllParameterDto) {
    const { filter, pageNumber = 1, pageSize = 10 } = query;

    const [data, total] = await this.parameterHeaderRepository.findAndCount({
      where: filter ? { code: ILike(`%${filter}%`) } : {},
      relations: { details: true },
      order: { id: 'DESC', details: { ordering: 'ASC' } },
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

  async findOne(id: string): Promise<ParameterHeader> {
    const parameterHeader = await this.parameterHeaderRepository.findOne({
      where: { id },
      relations: { details: true },
      order: { details: { ordering: 'ASC' } },
    });

    if (!parameterHeader) {
      throw new NotFoundException('Parameter not found');
    }

    return parameterHeader;
  }

  async findOneDetail(id: string): Promise<ParameterDetail> {
    const parameterDetail = await this.parameterDetailRepository.findOne({
      where: { id },
    });

    if (!parameterDetail) {
      throw new NotFoundException('Parameter detail not found');
    }

    return parameterDetail;
  }

  async create(dto: CreateParameterDto): Promise<ParameterHeader> {
    const parameterHeader = this.parameterHeaderRepository.create({
      code: dto.code,
      description: dto.description ?? null,
      active: dto.active ?? true,
      createdAt: new Date(),
      details: (dto.details ?? []).map((item) =>
        this.parameterDetailRepository.create({
          code: item.code,
          description: item.description ?? null,
          ordering: item.ordering,
          active: item.active ?? true,
          createdAt: new Date(),
        }),
      ),
    });

    return await this.parameterHeaderRepository.save(parameterHeader);
  }

  async update(id: string, dto: UpdateParameterDto): Promise<ParameterHeader> {
    const parameterHeader = await this.findOne(id);
    const { details, ...headerFields } = dto;

    Object.assign(parameterHeader, headerFields);
    parameterHeader.modifiedAt = new Date();

    if (details) {
      const existingById = new Map(
        parameterHeader.details.map((detail) => [detail.id, detail]),
      );

      parameterHeader.details = details.map((item) => {
        const existing = item.id ? existingById.get(item.id) : undefined;
        const parameterDetail =
          existing ??
          this.parameterDetailRepository.create({ createdAt: new Date() });

        parameterDetail.code = item.code;
        parameterDetail.description = item.description ?? null;
        parameterDetail.ordering = item.ordering;
        parameterDetail.active = item.active ?? true;

        if (existing) {
          parameterDetail.modifiedAt = new Date();
        }

        return parameterDetail;
      });
    }

    return await this.parameterHeaderRepository.save(parameterHeader);
  }

  async remove(id: string): Promise<void> {
    const parameterHeader = await this.findOne(id);
    await this.parameterHeaderRepository.remove(parameterHeader);
  }
}
