import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateContactDto) {
    if (dto.companyId) {
      const company = await this.prisma.company.findFirst({
        where: { id: dto.companyId, userId },
      });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    return this.prisma.contact.create({
      data: {
        name: dto.name,
        role: dto.role,
        email: dto.email,
        phone: dto.phone,
        linkedin: dto.linkedin,
        notes: dto.notes,
        companyId: dto.companyId,
        userId,
      },
      include: { company: true },
    });
  }

  async findAll(userId: string) {
    return this.prisma.contact.findMany({
      where: { userId },
      include: { company: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: string, contactId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, userId },
      include: { company: true },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async update(userId: string, contactId: string, dto: UpdateContactDto) {
    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, userId },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    if (dto.companyId && dto.companyId !== contact.companyId) {
      const company = await this.prisma.company.findFirst({
        where: { id: dto.companyId, userId },
      });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    return this.prisma.contact.update({
      where: { id: contactId },
      data: dto,
      include: { company: true },
    });
  }

  async remove(userId: string, contactId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, userId },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    await this.prisma.contact.delete({
      where: { id: contactId },
    });

    return { success: true };
  }
}
