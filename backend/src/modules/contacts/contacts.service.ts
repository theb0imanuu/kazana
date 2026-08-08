import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.contact.findMany({
      where: { userId },
      include: { company: true, interviews: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const item = await this.prisma.contact.findFirst({
      where: { id, userId },
      include: { company: true, interviews: { include: { job: true } } },
    });
    if (!item) throw new NotFoundException('Contact not found');
    return item;
  }

  async create(userId: string, dto: CreateContactDto) {
    await this.assertCompany(userId, dto.companyId);
    return this.prisma.contact.create({ data: { ...dto, userId }, include: { company: true } });
  }

  async update(userId: string, id: string, dto: UpdateContactDto) {
    await this.findOne(userId, id);
    if (dto.companyId) await this.assertCompany(userId, dto.companyId);
    return this.prisma.contact.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.contact.delete({ where: { id } });
    return { deleted: true };
  }

  private async assertCompany(userId: string, companyId: string) {
    const company = await this.prisma.company.findFirst({ where: { id: companyId, userId } });
    if (!company) throw new BadRequestException('Company does not belong to the current user');
  }
}
