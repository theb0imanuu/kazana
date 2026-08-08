import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.template.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
  }

  async findOne(userId: string, id: string) {
    const item = await this.prisma.template.findFirst({ where: { id, userId } });
    if (!item) throw new NotFoundException('Template not found');
    return item;
  }

  create(userId: string, dto: CreateTemplateDto) {
    return this.prisma.template.create({ data: { ...dto, userId } });
  }

  async update(userId: string, id: string, dto: UpdateTemplateDto) {
    await this.findOne(userId, id);
    return this.prisma.template.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.template.delete({ where: { id } });
    return { deleted: true };
  }
}
