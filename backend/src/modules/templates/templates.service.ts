import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  private extractVariables(body: string, subject?: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const variables = new Set<string>();

    let match;
    while ((match = regex.exec(body)) !== null) {
      variables.add(match[1]);
    }

    if (subject) {
      while ((match = regex.exec(subject)) !== null) {
        variables.add(match[1]);
      }
    }

    return Array.from(variables);
  }

  private getVariables(
    dto: CreateTemplateDto | UpdateTemplateDto,
    existing?: { body: string; subject?: string | null },
  ): string[] {
    const body = dto.body ?? existing?.body ?? '';
    const subject = dto.subject !== undefined ? dto.subject : (existing?.subject ?? undefined);

    const extracted = this.extractVariables(body, subject);
    const provided = dto.variables ?? [];
    return Array.from(new Set([...extracted, ...provided]));
  }

  async create(userId: string, dto: CreateTemplateDto) {
    const variables = this.getVariables(dto);

    return this.prisma.template.create({
      data: {
        name: dto.name,
        subject: dto.subject,
        body: dto.body,
        type: dto.type,
        variables,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.template.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: string, templateId: string) {
    const template = await this.prisma.template.findFirst({
      where: { id: templateId, userId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async update(userId: string, templateId: string, dto: UpdateTemplateDto) {
    const template = await this.prisma.template.findFirst({
      where: { id: templateId, userId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const variables = this.getVariables(dto, template);

    return this.prisma.template.update({
      where: { id: templateId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.subject !== undefined && { subject: dto.subject }),
        ...(dto.body !== undefined && { body: dto.body }),
        ...(dto.type !== undefined && { type: dto.type }),
        variables,
      },
    });
  }

  async remove(userId: string, templateId: string) {
    const template = await this.prisma.template.findFirst({
      where: { id: templateId, userId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    await this.prisma.template.delete({
      where: { id: templateId },
    });

    return { success: true };
  }
}
