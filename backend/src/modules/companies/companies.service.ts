import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        name: dto.name,
        website: dto.website,
        industry: dto.industry,
        size: dto.size,
        location: dto.location,
        notes: dto.notes,
        logoUrl: dto.logoUrl,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.company.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: string, companyId: string) {
    const company = await this.prisma.company.findFirst({
      where: { id: companyId, userId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(userId: string, companyId: string, dto: UpdateCompanyDto) {
    const company = await this.prisma.company.findFirst({
      where: { id: companyId, userId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.prisma.company.update({
      where: { id: companyId },
      data: dto,
    });
  }

  async remove(userId: string, companyId: string) {
    const company = await this.prisma.company.findFirst({
      where: { id: companyId, userId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    await this.prisma.company.delete({
      where: { id: companyId },
    });

    return { success: true };
  }
}
