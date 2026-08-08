import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplatesService } from './templates.service';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly service: TemplatesService) {}
  @Get() findAll(@CurrentUser() u: AuthenticatedUser) { return this.service.findAll(u.id); }
  @Get(':id') findOne(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) { return this.service.findOne(u.id, id); }
  @Post() create(@CurrentUser() u: AuthenticatedUser, @Body() dto: CreateTemplateDto) { return this.service.create(u.id, dto); }
  @Patch(':id') update(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateTemplateDto) { return this.service.update(u.id, id, dto); }
  @Delete(':id') remove(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) { return this.service.remove(u.id, id); }
}
