import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.company.findMany({
      where: { userId },
      include: { _count: { select: { jobs: true, contacts: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, userId },
      include: { jobs: true, contacts: true },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  create(userId: string, dto: CreateCompanyDto) {
    return this.prisma.company.create({ data: { ...dto, userId } });
  }

  async update(userId: string, id: string, dto: UpdateCompanyDto) {
    await this.findOne(userId, id);
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.company.delete({ where: { id } });
    return { deleted: true };
  }
}
